import React, { useEffect, useRef } from 'react';
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneCall,
  PhoneOff,
  Video,
  VideoOff,
  X
} from 'lucide-react';
import { ThemeConfig, THEMES } from '../services/themeStore';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';

interface CallOverlayProps {
  activeTheme?: ThemeConfig;
}

function getAvatarIcon(avatarId?: string | null): string {
  return (AVATAR_PRESETS.find((a) => a.id === avatarId) || AVATAR_PRESETS[0]).icon;
}

function formatCallDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ activeTheme = THEMES.original }) => {
  const { user } = useAuth();
  const {
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
    acceptIncomingCall,
    declineIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
    setMinimized,
    clearCallError
  } = useCall();

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasRemoteVideo = Boolean(remoteStream && remoteStream.getVideoTracks().some((t) => t.readyState === 'live'));
  const hasLocalVideo = Boolean(localStream && localStream.getVideoTracks().length > 0 && !isCameraOff);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      void remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, isMinimized, callPhase]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isMinimized, isCameraOff, callPhase]);

  const myUid = user?.uid || '';
  const peerName = activeSession
    ? activeSession.callerUid === myUid
      ? activeSession.calleeName
      : activeSession.callerName
    : '';
  const peerAvatar = activeSession
    ? activeSession.callerUid === myUid
      ? activeSession.calleeAvatarId
      : activeSession.callerAvatarId
    : 'melon_classic';

  return (
    <>
      {/* Hidden audio element always ensures remote voice output even when minimized or audio-only */}
      {remoteStream && (
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      )}

      {/* Call Error Banner */}
      {callError && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] max-w-md w-[calc(100vw-2rem)] rounded-2xl border px-4 py-3 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-xl"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: 'rgba(244, 63, 94, 0.5)'
          }}
        >
          <div className="text-xs font-semibold text-rose-200">{callError}</div>
          <button
            type="button"
            onClick={clearCallError}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            aria-label="Dismiss call message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Incoming Call Ringing Card */}
      {incomingRingSession && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[115] max-w-sm w-[calc(100vw-1.5rem)] rounded-3xl border p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.borderActive,
            boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 28px ${activeTheme.accent}35`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 animate-pulse"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              {getAvatarIcon(incomingRingSession.callerAvatarId)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>
                  Incoming {incomingRingSession.mode === 'video' ? 'Video Call' : 'Voice Call'}
                </span>
              </div>
              <div className="text-sm font-black text-white truncate">
                {incomingRingSession.callerName}
              </div>
              {incomingRingSession.contextLabel && (
                <div className="text-[11px] text-slate-400 truncate">
                  {incomingRingSession.contextLabel}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {incomingRingSession.mode === 'video' && (
              <button
                type="button"
                onClick={() => void acceptIncomingCall('video')}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Accept Video</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void acceptIncomingCall('audio')}
              className="flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              style={{
                backgroundColor:
                  incomingRingSession.mode === 'video' ? activeTheme.bgSecondary : '#10b981',
                color: incomingRingSession.mode === 'video' ? '#ffffff' : '#000000',
                border: incomingRingSession.mode === 'video' ? `1px solid ${activeTheme.border}` : 'none'
              }}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{incomingRingSession.mode === 'video' ? 'Voice Only' : 'Accept Call'}</span>
            </button>
            <button
              type="button"
              onClick={() => void declineIncomingCall()}
              className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              title="Decline call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Outgoing / Active Call Floating Panel */}
      {callPhase !== 'idle' && activeSession && (
        isMinimized ? (
          <div
            className="fixed bottom-4 left-4 md:left-24 z-[110] rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.borderActive
            }}
          >
            <div
              className="w-8 h-8 rounded-xl border flex items-center justify-center text-base shrink-0"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              {getAvatarIcon(peerAvatar)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-white truncate max-w-[120px]">
                {peerName}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 tabular-nums">
                {callPhase === 'outgoing'
                  ? 'Ringing...'
                  : callPhase === 'connecting'
                  ? 'Connecting...'
                  : formatCallDuration(elapsedSeconds)}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className={`p-1.5 rounded-lg border cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="p-1.5 rounded-lg border bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 cursor-pointer"
              title="Expand Call View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => void endCall()}
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="fixed bottom-4 left-4 md:left-24 z-[110] w-80 sm:w-96 rounded-3xl border shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.borderActive,
              boxShadow: `0 22px 55px rgba(0,0,0,0.68)`
            }}
          >
            {/* Header Bar */}
            <div
              className="px-3.5 py-2.5 border-b flex items-center justify-between gap-2"
              style={{ backgroundColor: activeTheme.bgHeader, borderColor: activeTheme.border }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate">
                    {peerName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate tabular-nums">
                    {activeSession.mode === 'video' ? 'Video Call' : 'Voice Call'} ·{' '}
                    {callPhase === 'outgoing'
                      ? 'Ringing...'
                      : callPhase === 'connecting'
                      ? 'Connecting...'
                      : formatCallDuration(elapsedSeconds)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="p-1.5 rounded-lg border text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                style={{ borderColor: activeTheme.border }}
                title="Minimize call window"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Video / Audio Stage */}
            <div className="relative bg-slate-950/90 h-52 flex items-center justify-center overflow-hidden">
              {hasRemoteVideo ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 text-center px-4">
                  <div
                    className="w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl shadow-lg"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      borderColor: activeTheme.borderActive
                    }}
                  >
                    {getAvatarIcon(peerAvatar)}
                  </div>
                  <div className="text-sm font-extrabold text-white">{peerName}</div>
                  <div className="text-[11px] font-mono text-emerald-300">
                    {callPhase === 'outgoing'
                      ? 'Waiting for answer...'
                      : callPhase === 'connecting'
                      ? 'Establishing encrypted audio/video...'
                      : activeSession.mode === 'video'
                      ? 'Camera off · Voice active'
                      : 'Voice connected'}
                  </div>
                </div>
              )}

              {/* Local Self-View PiP */}
              {hasLocalVideo && (
                <div className="absolute bottom-2.5 right-2.5 w-24 h-18 rounded-xl overflow-hidden border border-white/25 bg-black shadow-xl">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover -scale-x-100"
                  />
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div
              className="px-4 py-3 flex items-center justify-center gap-3 border-t"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
            >
              <button
                type="button"
                onClick={toggleMute}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                    : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {localStream && localStream.getVideoTracks().length > 0 && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                    isCameraOff
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                  }`}
                  title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => void endCall()}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End</span>
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};
