import React from 'react';
import { Bell, Gamepad2, MessageCircle, Play, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { ThemeConfig, THEMES } from '../services/themeStore';

interface NotificationToastsProps {
  activeTheme?: ThemeConfig;
}

function getAvatarIcon(avatarId?: string | null): string {
  return (AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0]).icon;
}

export const NotificationToasts: React.FC<NotificationToastsProps> = ({
  activeTheme = THEMES.original
}) => {
  const {
    toasts,
    dismissToast,
    openChatWithPeer,
    openGameRoom,
    acceptGameInvite,
    declineGameInvite
  } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[60] flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-[350px] pointer-events-none">
      {toasts.map(toast => {
        const isInvite = toast.kind === 'invite' && toast.invite;
        const isChat = toast.kind === 'chat' && toast.chatTarget;
        const isTurn = toast.kind === 'turn' && toast.targetSpace;

        const accent =
          toast.kind === 'invite'
            ? '#38bdf8'
            : toast.kind === 'turn'
            ? '#f59e0b'
            : activeTheme.accent;

        return (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border p-3 shadow-2xl backdrop-blur-xl flex flex-col gap-2 animate-fadeIn transition-all"
            style={{
              backgroundColor: activeTheme.bgHeader,
              borderColor: accent,
              boxShadow: '0 14px 36px rgba(0,0,0,0.55)'
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center text-sm shrink-0"
                style={{
                  backgroundColor: `${accent}22`,
                  borderColor: `${accent}55`
                }}
              >
                {toast.avatarId ? (
                  <span>{getAvatarIcon(toast.avatarId)}</span>
                ) : toast.kind === 'invite' ? (
                  <Gamepad2 className="w-4 h-4" style={{ color: accent }} />
                ) : toast.kind === 'turn' ? (
                  <Bell className="w-4 h-4" style={{ color: accent }} />
                ) : (
                  <MessageCircle className="w-4 h-4" style={{ color: accent }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-white leading-snug">
                  {toast.title}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                  {toast.body}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isInvite && toast.invite && (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => void acceptGameInvite(toast.invite!)}
                  className="flex-1 py-1.5 px-3 rounded-xl text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 transition-all"
                  style={{ backgroundColor: accent }}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Accept & Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => void declineGameInvite(toast.invite!)}
                  className="py-1.5 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Decline
                </button>
              </div>
            )}

            {isChat && toast.chatTarget && (
              <button
                type="button"
                onClick={() => {
                  openChatWithPeer(toast.chatTarget!);
                  dismissToast(toast.id);
                }}
                className="w-full py-1.5 px-3 rounded-xl text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 transition-all"
                style={{ backgroundColor: accent }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reply in Chatbox</span>
              </button>
            )}

            {isTurn && toast.targetSpace && (
              <button
                type="button"
                onClick={() => {
                  openGameRoom(toast.targetSpace!, toast.roomCode);
                  dismissToast(toast.id);
                }}
                className="w-full py-1.5 px-3 rounded-xl text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 transition-all"
                style={{ backgroundColor: accent }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jump to Match</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
