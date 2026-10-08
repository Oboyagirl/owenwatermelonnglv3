import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  LogIn,
  LogOut,
  Save,
  Check,
  Sparkles,
  Cloud,
  Gamepad2,
  Trash2,
  Smartphone,
  Laptop,
  Monitor,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeConfig } from '../services/themeStore';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { Game } from '../types/game';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGames: Game[];
  onSelectGame: (game: Game) => void;
  theme: ThemeConfig;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  allGames,
  onSelectGame,
  theme
}) => {
  const { 
    user, 
    profile, 
    saves, 
    deviceLabel, 
    isGuest, 
    loginGoogle, 
    loginGuest, 
    logout, 
    updateGamerProfile, 
    deleteSave 
  } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [guestNameInput, setGuestNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('melon_classic');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const currentAvatar = AVATAR_PRESETS.find(a => a.id === (profile?.avatarId || 'melon_classic')) || AVATAR_PRESETS[0];

  const handleStartEditName = () => {
    setNameInput(profile?.displayName || 'Player');
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsUpdating(true);
    try {
      await updateGamerProfile({ displayName: nameInput.trim() });
      setEditingName(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectAvatar = async (avatarId: string) => {
    setSelectedAvatar(avatarId);
    if (user) {
      await updateGamerProfile({ avatarId });
    }
  };

  const handleCreateGuest = async () => {
    setIsUpdating(true);
    try {
      await loginGuest(guestNameInput);
      setGuestNameInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group saves by game
  const gamesMap = new Map(allGames.map(g => [g.id, g]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.borderActive
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-xl"
              style={{ backgroundColor: currentAvatar.color + '25', border: `1px solid ${currentAvatar.color}` }}
            >
              {currentAvatar.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gamer Account & Cloud Vault</h3>
              <p className="text-xs text-slate-400">
                Save & sync game states across all school Chromebooks, PCs, and phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Status Card */}
          {user ? (
            <div 
              className="p-5 rounded-2xl border relative overflow-hidden"
              style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border"
                    style={{ backgroundColor: currentAvatar.color + '20', borderColor: currentAvatar.color }}
                  >
                    {currentAvatar.icon}
                  </div>
                  <div>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          maxLength={30}
                          className="px-2.5 py-1 text-sm font-bold bg-black/40 border rounded-lg text-white focus:outline-none"
                          style={{ borderColor: theme.accent }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={isUpdating}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          {profile?.displayName || user.displayName || 'Player'}
                        </h4>
                        <button
                          onClick={handleStartEditName}
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                          title="Edit Gamer Tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        {user.email || (isGuest ? 'Guest Gamer Profile' : 'Synced Account')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {saves.length} Cloud Saves Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Switch Profile)</span>
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.border }}>
                <span className="text-xs font-bold text-slate-300 block mb-2">Choose Avatar Badge:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {AVATAR_PRESETS.map((avatar) => {
                    const isSel = (profile?.avatarId || 'melon_classic') === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => handleSelectAvatar(avatar.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer border ${
                          isSel ? 'ring-2 ring-emerald-400 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: avatar.color + '20', borderColor: avatar.color }}
                        title={avatar.label}
                      >
                        {avatar.icon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="p-6 rounded-2xl border text-center space-y-4"
              style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg border border-emerald-500/30">
                🍉
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-lg font-bold text-white">Cloud Saves for Different People & Devices</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Create a gamer profile or sign in with Google so all your game saves, high scores, and favorites stay synced between your school Chromebook, phone, and home PC!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={loginGoogle}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: theme.accent, color: theme.accentText }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder="Custom Gamer Tag..."
                    className="px-3 py-2 text-xs bg-black/40 border rounded-xl text-white focus:outline-none w-36"
                    style={{ borderColor: theme.border }}
                  />
                  <button
                    onClick={handleCreateGuest}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {isUpdating ? 'Creating...' : 'Quick Guest Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Device Info */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Current Device: <strong className="text-white">{deviceLabel}</strong></span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              End-to-End User Isolation
            </span>
          </div>

          {/* All Saves in Cloud Vault */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Your Cloud Saves ({saves.length})</span>
              </h4>
              <span className="text-xs text-slate-400">
                Auto-synced via Firebase
              </span>
            </div>

            {saves.length === 0 ? (
              <div 
                className="p-8 rounded-xl border text-center space-y-2"
                style={{ backgroundColor: theme.bgPrimary, borderColor: theme.border }}
              >
                <Gamepad2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No cloud saves found yet. Play any game and click the <strong>Cloud Save</strong> button in the game player to backup your progress!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {saves.map((save) => {
                  const game = gamesMap.get(save.gameId);
                  return (
                    <div
                      key={save.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors hover:border-emerald-500/50"
                      style={{ backgroundColor: theme.bgPrimary, borderColor: theme.border }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {game?.thumbnail ? (
                          <img 
                            src={game.thumbnail} 
                            alt={save.title || save.gameId} 
                            className="w-10 h-10 rounded-lg object-cover shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                            🎮
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {save.title || game?.title || save.gameId}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-semibold uppercase">{save.slot}</span>
                            <span>•</span>
                            <span>{save.deviceLabel || 'Synced device'}</span>
                            <span>•</span>
                            <span>{save.updatedAt ? new Date(save.updatedAt).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {game && (
                          <button
                            onClick={() => {
                              onSelectGame(game);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            style={{ backgroundColor: theme.accent, color: theme.accentText }}
                          >
                            Play
                          </button>
                        )}
                        <button
                          onClick={() => deleteSave(save.gameId, save.slot)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete cloud save"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 border-t flex items-center justify-between text-xs text-slate-400"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <span className="text-[11px]">
            Different people on the same computer can sign out & in to access their own private saves.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
