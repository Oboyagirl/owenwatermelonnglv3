import React, { useState } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  Laptop, 
  Smartphone, 
  Monitor, 
  FileCode, 
  RefreshCw, 
  LogIn, 
  Copy,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Game } from '../types/game';
import { ThemeConfig } from '../services/themeStore';
import { 
  captureBrowserGameState, 
  restoreBrowserGameState 
} from '../services/cloudSaveService';

interface CloudSaveModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onReloadGame: () => void;
  theme: ThemeConfig;
}

export const CloudSaveModal: React.FC<CloudSaveModalProps> = ({
  game,
  isOpen,
  onClose,
  onReloadGame,
  theme
}) => {
  const { user, profile, deviceLabel, isGuest, loginGoogle, loginGuest, saveCurrentGame, deleteSave, getSavesForGame } = useAuth();
  
  const [selectedSlot, setSelectedSlot] = useState<string>('slot1');
  const [manualSaveInput, setManualSaveInput] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSlot, setCopiedSlot] = useState<string | null>(null);

  if (!isOpen) return null;

  const gameSaves = getSavesForGame(game.id);
  const currentSlotSave = gameSaves.find(s => s.slot === selectedSlot);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleCloudSave = async () => {
    if (!user) {
      showStatus("Please sign in or continue as Guest to save games to the cloud.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      let dataToSave = manualSaveInput.trim();

      // If no custom text was entered, capture current browser localStorage
      if (!dataToSave || !useCustomInput) {
        dataToSave = captureBrowserGameState(game.id);
      }

      await saveCurrentGame(game.id, selectedSlot, {
        title: game.title,
        saveData: dataToSave,
        saveType: useCustomInput ? 'manual' : 'localStorage',
        deviceLabel
      });

      showStatus(`Saved to ${selectedSlot.toUpperCase()} on Cloud! Synced across all your devices.`, 'success');
    } catch (err: any) {
      console.error("Save error:", err);
      showStatus(err?.message || "Failed to save to cloud.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloudRestore = () => {
    if (!currentSlotSave) return;

    try {
      const restored = restoreBrowserGameState(game.id, currentSlotSave.saveData);
      if (restored) {
        showStatus("Save restored! Refreshing game session...", "success");
        setTimeout(() => {
          onReloadGame();
          onClose();
        }, 1200);
      } else {
        // If not standard JSON snapshot, copy to clipboard for games with code inputs (like Cookie Clicker)
        navigator.clipboard.writeText(currentSlotSave.saveData);
        showStatus("Save string copied to clipboard! Paste it inside the game's import menu.", "info");
      }
    } catch (err: any) {
      showStatus("Could not inject save data automatically.", "error");
    }
  };

  const handleDeleteSlot = async (slotToDelete: string) => {
    if (confirm(`Are you sure you want to delete ${slotToDelete.toUpperCase()} from cloud?`)) {
      try {
        await deleteSave(game.id, slotToDelete);
        showStatus(`Deleted ${slotToDelete.toUpperCase()}`, "info");
      } catch (err: any) {
        showStatus("Failed to delete save.", "error");
      }
    }
  };

  const handleCopySaveData = (data: string, slotId: string) => {
    navigator.clipboard.writeText(data);
    setCopiedSlot(slotId);
    setTimeout(() => setCopiedSlot(null), 2000);
  };

  const handleDownloadFile = () => {
    if (!currentSlotSave) return;
    const blob = new Blob([currentSlotSave.saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.id}_${selectedSlot}_save.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: theme.accent, color: theme.accentText }}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Cross-Device Cloud Saves</h3>
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: theme.accentBadge, color: theme.accent }}
                >
                  Firebase Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Playing <strong className="text-white">{game.title}</strong> on <span className="text-emerald-400">{deviceLabel}</span>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Message */}
          {statusMsg && (
            <div 
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                  : statusMsg.type === 'error'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Not signed in banner */}
          {!user && (
            <div 
              className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Save for different people & switch devices</h4>
                  <p className="text-[11px] text-slate-400">Sign in to save your progress at school and continue at home on any computer or phone.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loginGoogle}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: theme.accent, color: theme.accentText }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Sign-In</span>
                </button>
                <button
                  onClick={() => loginGuest()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  Guest Save
                </button>
              </div>
            </div>
          )}

          {/* User Account info if signed in */}
          {user && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Gamer Profile:</span>
                <span className="font-bold text-white">{profile?.displayName || 'Gamer'}</span>
                {isGuest && <span className="text-[10px] text-amber-400 font-semibold">(Guest Account)</span>}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud Sync Active
              </span>
            </div>
          )}

          {/* Slot Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block">
              Select Save Slot:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['slot1', 'slot2', 'slot3', 'auto'].map((slotId) => {
                const save = gameSaves.find(s => s.slot === slotId);
                const isSelected = selectedSlot === slotId;
                const slotTitle = slotId === 'slot1' ? 'Slot 1 (School)' : slotId === 'slot2' ? 'Slot 2 (Home)' : slotId === 'slot3' ? 'Slot 3 (Backup)' : 'Auto-Save';

                return (
                  <button
                    key={slotId}
                    onClick={() => setSelectedSlot(slotId)}
                    className="p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? theme.bgCard : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? theme.accent : theme.border
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold" style={{ color: isSelected ? theme.accent : '#fff' }}>
                        {slotTitle}
                      </span>
                      {save ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Empty</span>
                      )}
                    </div>
                    {save ? (
                      <div className="mt-1">
                        <div className="text-[10px] text-slate-300 truncate font-mono">
                          {save.deviceLabel || 'Synced save'}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {save.updatedAt ? new Date(save.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic">No cloud save</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions for current slot */}
          <div 
            className="p-4 rounded-xl border space-y-4"
            style={{ backgroundColor: theme.bgPrimary, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">
                  Actions for {selectedSlot.toUpperCase()}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {currentSlotSave ? `Last saved on ${currentSlotSave.deviceLabel || 'Device'} (${new Date(currentSlotSave.updatedAt || '').toLocaleString()})` : 'This slot is ready for your game progress.'}
                </p>
              </div>

              {currentSlotSave && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopySaveData(currentSlotSave.saveData, selectedSlot)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                    title="Copy save payload"
                  >
                    {copiedSlot === selectedSlot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                    title="Download .json file"
                  >
                    <CloudDownload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(selectedSlot)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                    title="Delete slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCloudSave}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: theme.accent, color: theme.accentText }}
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isProcessing ? 'Saving to Cloud...' : `Backup Progress to ${selectedSlot.toUpperCase()}`}</span>
              </button>

              {currentSlotSave && (
                <button
                  onClick={handleCloudRestore}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restore from Cloud into Game</span>
                </button>
              )}
            </div>
          </div>

          {/* Advanced / Manual Save Code Import */}
          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <button
              onClick={() => setUseCustomInput(!useCustomInput)}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>{useCustomInput ? 'Hide Manual Code Editor' : 'Manual Save Code / Text Export (Cookie Clicker, Retro Bowl, etc.)'}</span>
            </button>

            {useCustomInput && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={manualSaveInput}
                  onChange={(e) => setManualSaveInput(e.target.value)}
                  placeholder="Paste your raw export code or JSON save state here..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none resize-y"
                  style={{
                    backgroundColor: theme.bgPrimary,
                    borderColor: theme.border,
                    color: theme.kicker
                  }}
                />
                <p className="text-[10px] text-slate-500">
                  Tip: Games like Cookie Clicker, Retro Bowl, and BitLife have in-game "Export Save" buttons. Paste that text here to back it up to your cloud profile!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 border-t flex items-center justify-between text-xs text-slate-400"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Saves are securely isolated per user account in Firestore
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
