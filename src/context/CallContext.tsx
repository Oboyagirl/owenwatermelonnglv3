import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { auth } from '../services/firebase';
import { useAuth } from './AuthContext';
import {
  CALL_SESSIONS_COLLECTION,
  CallMediaMode,
  CallSessionDoc,
  RTC_CONFIG,
  addIceCandidateDoc,
  answerCallSessionDoc,
  createCallSessionDoc,
  generateCallId,
  subscribeCallCandidates,
  subscribeCallSession,
  subscribeIncomingCalls,
  updateCallSessionStatus
} from '../services/callService';

export type ActiveCallPhase =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'active';

export interface StartCallParams {
  peerUid: string;
  peerName: string;
  peerAvatarId?: string;
  mode: CallMediaMode;
  contextLabel?: string;
}

interface CallContextValue {
  callPhase: ActiveCallPhase;
  activeSession: CallSessionDoc | null;
  incomingRingSession: CallSessionDoc | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isMinimized: boolean;
  callError: string | null;
  elapsedSeconds: number;
  startCall: (params: StartCallParams) => Promise<void>;
  acceptIncomingCall: (modeOverride?: CallMediaMode) => Promise<void>;
  declineIncomingCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  setMinimized: (val: boolean) => void;
  clearCallError: () => void;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

function isRecentRingingSession(session: CallSessionDoc): boolean {
  if (session.status !== 'ringing') return false;
  const ts = session.createdAt as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === 'function') {
    const ageMs = Date.now() - ts.toMillis();
    if (ageMs > 75_000) return false;
  }
  return true;
}

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const isFirebaseReady = Boolean(user?.uid && auth.currentUser?.uid === user.uid);
  const myUid = isFirebaseReady ? user!.uid : '';

  const [callPhase, setCallPhase] = useState<ActiveCallPhase>('idle');
  const [activeSession, setActiveSession] = useState<CallSessionDoc | null>(null);
  const [incomingQueue, setIncomingQueue] = useState<CallSessionDoc[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const roleRef = useRef<'caller' | 'callee' | null>(null);
  const appliedAnswerRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const seenCandidateIdsRef = useRef<Set<string>>(new Set());
  const sessionUnsubRef = useRef<(() => void) | null>(null);
  const candidatesUnsubRef = useRef<(() => void) | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);
  const ringAudioCtxRef = useRef<AudioContext | null>(null);
  const dismissedIncomingIdsRef = useRef<Set<string>>(new Set());

  const incomingRingSession = useMemo(() => {
    if (activeSession && callPhase !== 'idle') return null;
    return (
      incomingQueue.find(
        (s) =>
          s.calleeUid === myUid &&
          isRecentRingingSession(s) &&
          !dismissedIncomingIdsRef.current.has(s.id)
      ) || null
    );
  }, [incomingQueue, myUid, activeSession, callPhase]);

  const cleanupPeerResources = useCallback(() => {
    if (ringTimeoutRef.current !== null) {
      window.clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (sessionUnsubRef.current) {
      sessionUnsubRef.current();
      sessionUnsubRef.current = null;
    }
    if (candidatesUnsubRef.current) {
      candidatesUnsubRef.current();
      candidatesUnsubRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    appliedAnswerRef.current = false;
    pendingIceRef.current = [];
    seenCandidateIdsRef.current.clear();
    activeCallIdRef.current = null;
    roleRef.current = null;
    setActiveSession(null);
    setCallPhase('idle');
    setIsMuted(false);
    setIsCameraOff(false);
    setIsMinimized(false);
    setElapsedSeconds(0);
  }, []);

  // Call duration timer when connected
  useEffect(() => {
    if (callPhase !== 'active') {
      setElapsedSeconds(0);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [callPhase]);

  // Soft incoming call ringtone loop while ringing
  useEffect(() => {
    if (!incomingRingSession) return;
    const playRing = () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!ringAudioCtxRef.current) ringAudioCtxRef.current = new AudioCtx();
        const ctx = ringAudioCtxRef.current;
        if (ctx.state === 'suspended') {
          void ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        [
          [523.25, 0, 0.14],
          [659.25, 0.16, 0.14],
          [783.99, 0.32, 0.22]
        ].forEach(([freq, offset, dur]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + offset);
          gain.gain.setValueAtTime(0.06, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + dur);
        });
      } catch {}
    };
    playRing();
    const timer = window.setInterval(playRing, 2800);
    return () => window.clearInterval(timer);
  }, [incomingRingSession]);

  // Global listener for incoming call sessions addressed to me
  useEffect(() => {
    if (!isFirebaseReady || !myUid) {
      setIncomingQueue([]);
      cleanupPeerResources();
      return;
    }

    const unsub = subscribeIncomingCalls(
      myUid,
      (sessions) => {
        setIncomingQueue(sessions);
      },
      () => {}
    );
    return () => unsub();
  }, [isFirebaseReady, myUid, cleanupPeerResources]);

  const acquireUserMedia = useCallback(async (mode: CallMediaMode): Promise<{ stream: MediaStream; videoEnabled: boolean }> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Your browser does not support voice or video calling.');
    }
    if (mode === 'video') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        return { stream, videoEnabled: true };
      } catch (videoErr) {
        // Graceful fallback to microphone-only if no webcam or camera permission denied
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false
          });
          setCallError('Camera unavailable — connected with microphone audio only.');
          return { stream: audioOnly, videoEnabled: false };
        } catch {
          throw videoErr;
        }
      }
    }
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false
    });
    return { stream: audioStream, videoEnabled: false };
  }, []);

  const attachPeerConnection = useCallback(
    (callId: string, peerUid: string, stream: MediaStream, role: 'caller' | 'callee') => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      const remote = new MediaStream();
      setRemoteStream(remote);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (ev) => {
        if (ev.streams && ev.streams[0]) {
          ev.streams[0].getTracks().forEach((t) => {
            if (!remote.getTracks().some((existing) => existing.id === t.id)) {
              remote.addTrack(t);
            }
          });
        } else if (ev.track) {
          if (!remote.getTracks().some((existing) => existing.id === ev.track.id)) {
            remote.addTrack(ev.track);
          }
        }
        // Trigger React consumers with fresh MediaStream wrapper reference when tracks arrive
        setRemoteStream(new MediaStream(remote.getTracks()));
      };

      pc.onicecandidate = (ev) => {
        if (!ev.candidate || !myUid) return;
        void addIceCandidateDoc({
          callId,
          fromUid: myUid,
          toUid: peerUid,
          type: role === 'caller' ? 'offer-ice' : 'answer-ice',
          candidateJson: JSON.stringify(ev.candidate.toJSON())
        }).catch(() => {});
      };

      pc.onconnectionstatechange = () => {
        if (!pcRef.current || activeCallIdRef.current !== callId) return;
        if (pc.connectionState === 'connected') {
          setCallPhase('active');
        } else if (pc.connectionState === 'failed') {
          setCallError('Peer connection lost. Check firewall or network connection.');
        }
      };

      return pc;
    },
    [myUid]
  );

  const subscribeActiveCallSignals = useCallback(
    (callId: string) => {
      sessionUnsubRef.current?.();
      candidatesUnsubRef.current?.();

      sessionUnsubRef.current = subscribeCallSession(
        callId,
        async (session) => {
          if (!session) {
            cleanupPeerResources();
            return;
          }
          setActiveSession(session);

          if (session.status === 'declined') {
            setCallError(`${session.calleeName} declined the call.`);
            cleanupPeerResources();
            return;
          }
          if (session.status === 'missed') {
            setCallError(`${session.calleeName} did not answer.`);
            cleanupPeerResources();
            return;
          }
          if (session.status === 'ended') {
            cleanupPeerResources();
            return;
          }

          if (
            roleRef.current === 'caller' &&
            session.status === 'active' &&
            session.sdpAnswer &&
            !appliedAnswerRef.current &&
            pcRef.current
          ) {
            appliedAnswerRef.current = true;
            if (ringTimeoutRef.current !== null) {
              window.clearTimeout(ringTimeoutRef.current);
              ringTimeoutRef.current = null;
            }
            setCallPhase('connecting');
            try {
              const answerDesc = JSON.parse(session.sdpAnswer) as RTCSessionDescriptionInit;
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(answerDesc));
              for (const cand of pendingIceRef.current) {
                try {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                } catch {}
              }
              pendingIceRef.current = [];
              if (pcRef.current.connectionState === 'connected') {
                setCallPhase('active');
              } else {
                // Keep showing active once signaling handshake finishes so timer/controls engage cleanly
                setCallPhase('active');
              }
            } catch (err) {
              setCallError(err instanceof Error ? err.message : 'Failed to connect call audio/video.');
            }
          }
        },
        () => {}
      );

      candidatesUnsubRef.current = subscribeCallCandidates(
        callId,
        myUid,
        async (candDoc) => {
          if (seenCandidateIdsRef.current.has(candDoc.id)) return;
          seenCandidateIdsRef.current.add(candDoc.id);
          if (candDoc.fromUid === myUid) return;
          try {
            const parsed = JSON.parse(candDoc.candidate) as RTCIceCandidateInit;
            const pc = pcRef.current;
            if (pc && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(parsed));
            } else {
              pendingIceRef.current.push(parsed);
            }
          } catch {}
        },
        () => {}
      );
    },
    [myUid, cleanupPeerResources]
  );

  const startCall = useCallback(
    async ({ peerUid, peerName, peerAvatarId = 'melon_classic', mode, contextLabel }: StartCallParams) => {
      setCallError(null);
      if (!isFirebaseReady || !myUid) {
        setCallError('Sign in with Google to make voice and video calls.');
        return;
      }
      if (!peerUid || peerUid === myUid) {
        setCallError('Select another signed-in player to call.');
        return;
      }
      if (activeCallIdRef.current) {
        setCallError('Already in an active call. Hang up first to start another.');
        return;
      }

      const callId = generateCallId();
      const myName = profile?.displayName || user?.displayName || 'Player';
      const myAvatar = profile?.avatarId || 'melon_classic';

      try {
        const { stream, videoEnabled } = await acquireUserMedia(mode);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsMuted(false);
        setIsCameraOff(!videoEnabled);
        setIsMinimized(false);

        activeCallIdRef.current = callId;
        roleRef.current = 'caller';
        setCallPhase('outgoing');

        const pc = attachPeerConnection(callId, peerUid, stream, 'caller');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: mode === 'video'
        });
        await pc.setLocalDescription(offer);

        await createCallSessionDoc({
          callId,
          callerUid: myUid,
          callerName: myName,
          callerAvatarId: myAvatar,
          calleeUid: peerUid,
          calleeName: peerName || 'Player',
          calleeAvatarId: peerAvatarId || 'melon_classic',
          mode,
          contextLabel: contextLabel || 'Direct Call',
          sdpOffer: JSON.stringify({ type: offer.type, sdp: offer.sdp })
        });

        setActiveSession({
          id: callId,
          callerUid: myUid,
          callerName: myName,
          callerAvatarId: myAvatar,
          calleeUid: peerUid,
          calleeName: peerName || 'Player',
          calleeAvatarId: peerAvatarId || 'melon_classic',
          participantUids: [myUid, peerUid],
          mode,
          status: 'ringing',
          contextLabel: contextLabel || 'Direct Call',
          sdpOffer: JSON.stringify({ type: offer.type, sdp: offer.sdp }),
          sdpAnswer: null
        });

        subscribeActiveCallSignals(callId);

        // Auto-mark missed if unanswered after 60 seconds
        ringTimeoutRef.current = window.setTimeout(() => {
          if (activeCallIdRef.current === callId && roleRef.current === 'caller' && !appliedAnswerRef.current) {
            void updateCallSessionStatus(callId, 'missed');
            cleanupPeerResources();
          }
        }, 60_000);
      } catch (err) {
        cleanupPeerResources();
        setCallError(
          err instanceof Error
            ? err.message
            : `Could not access ${mode === 'video' ? 'camera/microphone' : 'microphone'}.`
        );
      }
    },
    [
      isFirebaseReady,
      myUid,
      profile?.displayName,
      profile?.avatarId,
      user?.displayName,
      acquireUserMedia,
      attachPeerConnection,
      subscribeActiveCallSignals,
      cleanupPeerResources
    ]
  );

  const acceptIncomingCall = useCallback(
    async (modeOverride?: CallMediaMode) => {
      const target = incomingRingSession;
      if (!target || !myUid) return;
      setCallError(null);
      dismissedIncomingIdsRef.current.add(target.id);

      const mediaMode: CallMediaMode = modeOverride || target.mode;
      try {
        const { stream, videoEnabled } = await acquireUserMedia(mediaMode);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsMuted(false);
        setIsCameraOff(!videoEnabled);
        setIsMinimized(false);

        activeCallIdRef.current = target.id;
        roleRef.current = 'callee';
        setActiveSession(target);
        setCallPhase('connecting');

        const pc = attachPeerConnection(target.id, target.callerUid, stream, 'callee');
        const offerDesc = JSON.parse(target.sdpOffer) as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDesc));

        subscribeActiveCallSignals(target.id);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await answerCallSessionDoc(
          target.id,
          JSON.stringify({ type: answer.type, sdp: answer.sdp })
        );
        setCallPhase('active');
      } catch (err) {
        cleanupPeerResources();
        setCallError(
          err instanceof Error ? err.message : 'Could not join call. Check microphone/camera permissions.'
        );
      }
    },
    [
      incomingRingSession,
      myUid,
      acquireUserMedia,
      attachPeerConnection,
      subscribeActiveCallSignals,
      cleanupPeerResources
    ]
  );

  const declineIncomingCall = useCallback(async () => {
    const target = incomingRingSession;
    if (!target) return;
    dismissedIncomingIdsRef.current.add(target.id);
    await updateCallSessionStatus(target.id, 'declined').catch(() => {});
  }, [incomingRingSession]);

  const endCall = useCallback(async () => {
    const callId = activeCallIdRef.current;
    cleanupPeerResources();
    if (callId) {
      await updateCallSessionStatus(callId, 'ended').catch(() => {});
    }
  }, [cleanupPeerResources]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    setIsMuted((prev) => {
      const next = !prev;
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !next;
      });
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    setIsCameraOff((prev) => {
      const next = !prev;
      videoTracks.forEach((t) => {
        t.enabled = !next;
      });
      return next;
    });
  }, []);

  // Ensure peer tracks & Firestore signaling doc close cleanly if tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const callId = activeCallIdRef.current;
      if (callId && auth.currentUser?.uid) {
        void updateCallSessionStatus(callId, 'ended').catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupPeerResources();
    };
  }, [cleanupPeerResources]);

  const value = useMemo<CallContextValue>(
    () => ({
      callPhase,
      activeSession,
      incomingRingSession,
      localStream,
      remoteStream,
      isMuted,
      isCameraOff,
      isMinimized,
      callError,
      elapsedSeconds,
      startCall,
      acceptIncomingCall,
      declineIncomingCall,
      endCall,
      toggleMute,
      toggleCamera,
      setMinimized: setIsMinimized,
      clearCallError: () => setCallError(null)
    }),
    [
      callPhase,
      activeSession,
      incomingRingSession,
      localStream,
      remoteStream,
      isMuted,
      isCameraOff,
      isMinimized,
      callError,
      elapsedSeconds,
      startCall,
      acceptIncomingCall,
      declineIncomingCall,
      endCall,
      toggleMute,
      toggleCamera
    ]
  );

  // Reference constant to avoid unused import lint warnings if tree-shaken
  void CALL_SESSIONS_COLLECTION;

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error('useCall must be used inside CallProvider');
  }
  return ctx;
}
