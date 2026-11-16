import React, { useState, useEffect, useRef } from "react";
import { 
  Cloud, 
  Clock, 
  Save, 
  RotateCcw, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Tag, 
  Layers, 
  Monitor, 
  Edit3, 
  Play, 
  Flame,
  Zap,
  Info,
  Copy,
  FileText,
  Key,
  Bookmark,
  Server
} from "lucide-react";
import { Game } from "../types/game";
import { ThemeConfig, THEMES } from "../services/themeStore";
import { useAuth } from "../context/AuthContext";
import { 
  captureUniversalGameStateDetailed, 
  restoreUniversalGameState, 
  formatExactTimestamp, 
  formatTimeAgo, 
  formatSaveBytes,
  createCodeSavePayload,
  createFileSavePayload,
  createBookmarkSavePayload,
  isWindowCrossOriginBlocked,
  GameSave 
} from "../services/cloudSaveService";

interface CloudSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: Game;
  onReloadGame?: () => void;
  onRestoreSave?: (save: GameSave) => Promise<boolean>;
  theme?: ThemeConfig;
  getContentWindow?: () => Window | null;
  sameOriginMirror?: string | null;
  onSwitchToSameOriginMirror?: () => void;
}

export const CloudSaveModal: React.FC<CloudSaveModalProps> = ({
  isOpen,
  onClose,
  game,
  onReloadGame,
  onRestoreSave,
  theme = THEMES.original,
  getContentWindow,
  sameOriginMirror,
  onSwitchToSameOriginMirror
}) => {
  const { user, profile, deviceLabel, isAuthReady, isGuest, isCloudSynced, authError, clearAuthError, loginGoogle, saveCurrentGameWithStatus, deleteSave, getSavesForGame } = useAuth();
  
  const [currentLiveTime, setCurrentLiveTime] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("new_checkpoint");
  const [customCheckpointTitle, setCustomCheckpointTitle] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<'snapshot' | 'code' | 'file'>('snapshot');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const batteryFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredSaveId, setRestoredSaveId] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [bookmarkLevel, setBookmarkLevel] = useState<string>("");
  const [bookmarkScore, setBookmarkScore] = useState<string>("");
  
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("owen_autosave_enabled") === "true";
    } catch {
      return false;
    }
  });

  // Ticking clock for accurate second-by-second checkpoint timestamps
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Set default checkpoint title when modal opens
  useEffect(() => {
    if (isOpen) {
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      setCustomCheckpointTitle(`Checkpoint at ${timeStr}`);
      setBookmarkLevel("");
      setBookmarkScore("");
      setSaveSuccessMsg(null);
      setSaveErrorMsg(null);
      setRestoreSuccessMsg(null);
      setConfirmDeleteId(null);
      clearAuthError();
    }
  }, [isOpen, game?.id, clearAuthError]);

  if (!isOpen || !game) return null;

  const gameSaves = getSavesForGame(game.id);
  const currentContentWindow = getContentWindow ? getContentWindow() : null;
  const isCrossOriginExternal = isWindowCrossOriginBlocked(currentContentWindow);

  const formattedLiveClock = currentLiveTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedLiveDate = currentLiveTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Handle capturing an exact checkpoint (or saving a Progress Bookmark on cross-origin games)
  const handleCaptureCheckpoint = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    setRestoreSuccessMsg(null);

    try {
      const runSave = async () => {
        const contentWindow = getContentWindow ? getContentWindow() : null;
        const capture = await captureUniversalGameStateDetailed(game.id, contentWindow);
        const exactTimeStr = formatExactTimestamp(new Date().toISOString());

        let slotKey = selectedSlot;
        if (selectedSlot === "new_checkpoint") {
          slotKey = `cp_${Date.now()}`;
        }

        if (capture.crossOriginBlocked) {
          const parsedScore = bookmarkScore.trim() ? Number(bookmarkScore.trim()) : undefined;
          const cleanScore = parsedScore !== undefined && Number.isFinite(parsedScore) ? parsedScore : undefined;
          const levelVal = bookmarkLevel.trim() || undefined;
          const labelToUse = customCheckpointTitle.trim() || (levelVal ? `${levelVal} Bookmark` : `Bookmark (${exactTimeStr})`);
          const bookmarkPayload = createBookmarkSavePayload(game.id, {
            note: labelToUse,
            level: levelVal,
            score: cleanScore,
            mirrorUrl: game.iframeSrc
          });

          const result = await saveCurrentGameWithStatus(game.id, slotKey, {
            title: labelToUse,
            saveData: bookmarkPayload,
            saveType: "bookmark",
            level: levelVal,
            score: cleanScore,
            deviceLabel
          });

          setSaveSuccessMsg(
            result.cloudSynced
              ? `Saved Progress Bookmark at ${exactTimeStr} to Cloud + Device Vault!`
              : `Saved Progress Bookmark at ${exactTimeStr} to Device Vault! ${result.cloudError || 'Sign in with Google to sync across devices.'}`
          );

          const nextTimeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
          setCustomCheckpointTitle(`Checkpoint at ${nextTimeStr}`);
          setBookmarkLevel("");
          setBookmarkScore("");
          setSelectedSlot("new_checkpoint");

          setTimeout(() => {
            setSaveSuccessMsg(null);
          }, 5000);
          return;
        }

        if (capture.capturedKeysCount === 0) {
          setSaveErrorMsg(
            "No in-game save data found yet. Play until an in-game checkpoint saves, or paste a Save Code in the Save Code tab!"
          );
          return;
        }

        const titleToUse = customCheckpointTitle.trim() || `Checkpoint (${exactTimeStr})`;

        const result = await saveCurrentGameWithStatus(game.id, slotKey, {
          title: titleToUse,
          saveData: capture.saveData,
          saveType: "universal",
          deviceLabel
        });

        setSaveSuccessMsg(
          result.cloudSynced
            ? `Saved checkpoint (${capture.capturedKeysCount} keys) at ${exactTimeStr} to Cloud + Device Vault!`
            : `Saved checkpoint (${capture.capturedKeysCount} keys) at ${exactTimeStr} to Device Vault! ${result.cloudError || 'Sign in with Google to sync across devices.'}`
        );

        const nextTimeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        setCustomCheckpointTitle(`Checkpoint at ${nextTimeStr}`);
        setSelectedSlot("new_checkpoint");

        setTimeout(() => {
          setSaveSuccessMsg(null);
        }, 5000);
      };

      const outcome = await Promise.race([
        runSave().then(() => 'done' as const),
        new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), 12000))
      ]);

      if (outcome === 'timeout') {
        setSaveErrorMsg("Save took too long and timed out. Try again or use the Save Code tab.");
      }
    } catch (err) {
      console.warn("Failed to capture checkpoint:", err);
      const rawMsg = err instanceof Error ? err.message : "Could not save checkpoint.";
      let friendlyMsg = rawMsg;
      if (rawMsg.startsWith('{')) {
        try {
          const parsedErr = JSON.parse(rawMsg);
          friendlyMsg = parsedErr?.error || "Cloud sync failed due to permissions. Check your Google sign-in.";
        } catch {}
      }
      setSaveErrorMsg(friendlyMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle restoring the exact game state at that point in time
  const handleRestoreCheckpoint = async (save: GameSave) => {
    setIsRestoring(true);
    setRestoredSaveId(save.id);
    setSaveErrorMsg(null);
    setRestoreSuccessMsg(null);

    try {
      const exactTime = formatExactTimestamp(save.updatedAt || save.createdAt);

      if (onRestoreSave) {
        const ok = await onRestoreSave(save);
        if (ok) {
          setRestoreSuccessMsg(`Restored checkpoint from ${exactTime}!`);
          setTimeout(() => {
            setIsRestoring(false);
            setRestoredSaveId(null);
            onClose();
          }, 700);
        } else {
          setSaveErrorMsg("This checkpoint did not contain restorable storage data.");
          setIsRestoring(false);
          setRestoredSaveId(null);
        }
        return;
      }

      const contentWindow = getContentWindow ? getContentWindow() : null;
      await restoreUniversalGameState(game.id, save.saveData, contentWindow);
      let hasLiveEmulatorState = false;
      try {
        const parsed = JSON.parse(save.saveData);
        if (parsed?.emulator?.stateBase64) {
          hasLiveEmulatorState = true;
        }
      } catch {}

      if (hasLiveEmulatorState) {
        setRestoreSuccessMsg(`Restored exact point in time (${exactTime})! State loaded into game.`);
        setIsRestoring(false);
        setRestoredSaveId(null);
        setTimeout(() => onClose(), 1000);
      } else {
        setRestoreSuccessMsg(`Restored checkpoint from ${exactTime}! Reloading game...`);
        setTimeout(() => {
          if (onReloadGame) onReloadGame();
          setIsRestoring(false);
          setRestoredSaveId(null);
          setTimeout(() => onClose(), 800);
        }, 400);
      }
    } catch (err) {
      console.error("Failed to restore checkpoint:", err);
      setSaveErrorMsg("Failed to restore checkpoint.");
      setIsRestoring(false);
      setRestoredSaveId(null);
    }
  };

  // Handle deleting a checkpoint (inline confirmation instead of window.confirm)
  const handleDeleteCheckpoint = async (save: GameSave) => {
    if (confirmDeleteId !== save.id) {
      setConfirmDeleteId(save.id);
      return;
    }
    setConfirmDeleteId(null);
    await deleteSave(game.id, save.slot);
  };

  // Handle renaming a checkpoint
  const handleStartRename = (save: GameSave) => {
    setEditingSaveId(save.id);
    setEditingTitleText(save.title || "");
  };

  const handleSaveRename = async (save: GameSave) => {
    if (editingTitleText.trim()) {
      await saveCurrentGameWithStatus(game.id, save.slot, {
        title: editingTitleText.trim(),
        saveData: save.saveData,
        saveType: save.saveType,
        deviceLabel: save.deviceLabel,
        score: save.score,
        level: save.level
      });
    }
    setEditingSaveId(null);
  };

  // Export a single checkpoint to JSON file
  const handleExportSave = (save: GameSave) => {
    try {
      const jsonStr = JSON.stringify(save, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${game.id}_checkpoint_${save.slot}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export save error:", e);
    }
  };

  // Import checkpoint from JSON file
  const handleImportSaveFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaveErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed && parsed.saveData) {
          const importedTitle = parsed.title ? `Imported: ${parsed.title}` : `Imported Checkpoint (${formatExactTimestamp(new Date().toISOString())})`;
          const result = await saveCurrentGameWithStatus(game.id, `cp_${Date.now()}`, {
            title: importedTitle,
            saveData: parsed.saveData,
            saveType: parsed.saveType || "universal",
            deviceLabel: parsed.deviceLabel || "Imported File"
          });
          setSaveSuccessMsg(
            result.cloudSynced
              ? "Successfully imported checkpoint to Cloud + Device Vault!"
              : "Successfully imported checkpoint to Device Vault!"
          );
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        } else {
          setSaveErrorMsg("Invalid checkpoint JSON file (missing saveData).");
        }
      } catch {
        setSaveErrorMsg("Invalid checkpoint JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveCodeCheckpoint = async () => {
    if (!manualCodeInput.trim()) return;
    setIsSaving(true);
    setSaveErrorMsg(null);
    try {
      const runSave = async () => {
        const payloadStr = createCodeSavePayload(game.id, manualCodeInput.trim());
        const exactTimeStr = formatExactTimestamp(new Date().toISOString());
        const timeOnly = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        const titleToUse = customCheckpointTitle.trim() || `Code Save at ${timeOnly}`;
        const slotKey = selectedSlot === "new_checkpoint" ? `code_${Date.now()}` : selectedSlot;

        const result = await saveCurrentGameWithStatus(game.id, slotKey, {
          title: titleToUse,
          saveData: payloadStr,
          saveType: "manual_code",
          deviceLabel
        });

        setSaveSuccessMsg(
          `Saved game code checkpoint at ${exactTimeStr} (${result.cloudSynced ? 'Cloud + Device' : 'Device Vault'})!`
        );
        setManualCodeInput('');
        setSelectedSlot("new_checkpoint");
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      };

      const outcome = await Promise.race([
        runSave().then(() => 'done' as const),
        new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), 12000))
      ]);
      if (outcome === 'timeout') {
        setSaveErrorMsg("Saving code timed out. Please try again.");
      }
    } catch (e) {
      console.warn(e);
      const rawMsg = e instanceof Error ? e.message : "Failed to save code checkpoint.";
      let friendlyMsg = rawMsg;
      if (rawMsg.startsWith('{')) {
        try {
          const parsedErr = JSON.parse(rawMsg);
          friendlyMsg = parsedErr?.error || "Cloud sync failed due to permissions.";
        } catch {}
      }
      setSaveErrorMsg(friendlyMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadBatteryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaveErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const result = ev.target?.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : btoa(result);
        const exactTimeStr = formatExactTimestamp(new Date().toISOString());
        const payloadStr = createFileSavePayload(game.id, file.name, base64);
        const titleToUse = `File: ${file.name} (${exactTimeStr})`;

        const savedRes = await saveCurrentGameWithStatus(game.id, `file_${Date.now()}`, {
          title: titleToUse,
          saveData: payloadStr,
          saveType: "battery_file",
          deviceLabel
        });

        setSaveSuccessMsg(
          `Uploaded "${file.name}" to ${savedRes.cloudSynced ? 'Cloud + Device Checkpoints' : 'Device Checkpoints'}!`
        );
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } catch (err) {
        setSaveErrorMsg(err instanceof Error ? err.message : "Failed to upload save file.");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setRestoreSuccessMsg("Save code copied to clipboard! Paste it into the in-game load menu.");
      setTimeout(() => {
        setCopiedCodeId(null);
        setRestoreSuccessMsg(null);
      }, 4000);
    } catch {}
  };

  const handleDownloadSavedFile = (save: GameSave) => {
    try {
      const parsed = JSON.parse(save.saveData);
      if (parsed.saveFileBase64 && parsed.saveFileName) {
        const binary = atob(parsed.saveFileBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = parsed.saveFileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {}
    handleExportSave(save);
  };

  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem("owen_autosave_enabled", String(next));
        window.dispatchEvent(new Event("owen-autosave-changed"));
      } catch {}
      return next;
    });
  };

  const quickAreaChips = [
    "Boss Battle",
    "Level Up",
    "Safe Area",
    "Before Hazard",
    "World 2",
    "Volcano",
    "High Score"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        style={{
          backgroundColor: theme.bgPrimary || "#080f1d",
          borderColor: theme.border || "rgba(255,255,255,0.12)"
        }}
      >
        {/* Header Bar */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between shrink-0 select-none"
          style={{
            backgroundColor: theme.bgHeader || "#0b1528",
            borderColor: theme.border || "rgba(255,255,255,0.1)"
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
              style={{
                backgroundColor: theme.accentBadge || "rgba(16, 185, 129, 0.15)",
                borderColor: theme.accent || "#10b981",
                color: theme.accent || "#10b981"
              }}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide truncate max-w-[260px] sm:max-w-md">
                  {game.title}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Exact Time Saves
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Save & restore progress to the exact minute and in-game state
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Account Status Badge */}
            {!isAuthReady ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-white/5 border-white/10 text-slate-300">
                <span>Restoring session...</span>
              </div>
            ) : isCloudSynced && !isGuest && user ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">Cloud Sync: {user.email || profile?.displayName}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  void loginGoogle().catch(() => {});
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-200 border-white/15"
                title="Sign in with Google to sync saves across school and home devices"
              >
                <span>Google Sign-In</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-5 overflow-y-auto flex flex-col gap-6 flex-1">

          {/* Feedback alerts */}
          {(saveErrorMsg || authError) && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{saveErrorMsg || authError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {restoreSuccessMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xs font-medium animate-fadeIn">
              <Sparkles className="w-4 h-4 shrink-0 text-sky-300 animate-spin" />
              <span>{restoreSuccessMsg}</span>
            </div>
          )}

          {/* Top Hero: Multi-Tier Checkpoints Vault */}
          <div 
            className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden transition-all shadow-lg"
            style={{
              backgroundColor: theme.bgCard || "#0f1c34",
              borderColor: theme.border || "rgba(255,255,255,0.15)"
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Save Exact Moment Checkpoint
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">{formattedLiveDate}</span>
                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {formattedLiveClock}
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 my-3.5 max-w-lg">
              <button
                type="button"
                onClick={() => setSaveMode('snapshot')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  saveMode === 'snapshot'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto Snapshot</span>
              </button>
              <button
                type="button"
                onClick={() => setSaveMode('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  saveMode === 'code'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Save Code / String</span>
              </button>
              <button
                type="button"
                onClick={() => setSaveMode('file')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  saveMode === 'file'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Upload File (.sav)</span>
              </button>
            </div>

            {saveMode === 'snapshot' && (
              <div className="flex flex-col gap-3">
                {isCrossOriginExternal && (
                  <div className="p-3.5 rounded-xl border border-sky-400/30 bg-sky-500/10 flex flex-col gap-2.5">
                    <div className="flex items-start gap-2.5 text-xs text-sky-100">
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-white">External Game Host Detected</div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Browser security blocks reading memory from external game websites directly. You can switch to a save-capable mirror or log your progress as a Cloud Bookmark below.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {sameOriginMirror && onSwitchToSameOriginMirror && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchToSameOriginMirror();
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Server className="w-3.5 h-3.5" />
                          <span>Switch to Save-Capable Mirror & Reload</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSaveMode('code')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Use In-Game Save Code</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Checkpoint Label / Game Area Note:</span>
                    </label>
                    <input
                      type="text"
                      value={customCheckpointTitle}
                      onChange={(e) => setCustomCheckpointTitle(e.target.value)}
                      placeholder="e.g. Level 4 Volcano, Before Boss, Wave 30..."
                      className="w-full px-3.5 py-2 text-xs bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Save Target:</span>
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-black/40 border border-white/15 rounded-xl text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <option value="new_checkpoint">📸 New Timeline Snapshot</option>
                      <option value="slot1">Slot 1 (Quick Save)</option>
                      <option value="slot2">Slot 2</option>
                      <option value="slot3">Slot 3</option>
                      <option value="slot4">Slot 4</option>
                      <option value="slot5">Slot 5</option>
                    </select>
                  </div>
                </div>

                {isCrossOriginExternal && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-300">Level / Stage (Optional):</label>
                      <input
                        type="text"
                        value={bookmarkLevel}
                        onChange={(e) => setBookmarkLevel(e.target.value)}
                        placeholder="e.g. World 3 - Level 8"
                        className="w-full px-3 py-1.5 text-xs bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-300">Score / Coins (Optional):</label>
                      <input
                        type="number"
                        value={bookmarkScore}
                        onChange={(e) => setBookmarkScore(e.target.value)}
                        placeholder="e.g. 12500"
                        className="w-full px-3 py-1.5 text-xs bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Area Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400">Quick Tags:</span>
                  {quickAreaChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const timeStr = currentLiveTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                        setCustomCheckpointTitle(`${chip} (${timeStr})`);
                      }}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-emerald-400/40 transition-colors cursor-pointer"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Monitor className="w-3.5 h-3.5 text-slate-400" />
                    <span>Origin: <span className="text-slate-200 font-semibold">{deviceLabel}</span></span>
                  </div>

                  <button
                    onClick={handleCaptureCheckpoint}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent || "#10b981",
                      color: "#050811"
                    }}
                  >
                    {isSaving ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>{isCrossOriginExternal ? 'Saving Bookmark...' : 'Capturing Exact State...'}</span>
                      </>
                    ) : isCrossOriginExternal ? (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Save Progress Bookmark</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Capture & Save Checkpoint Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {saveMode === 'code' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paste In-Game Save Code / Export String / Password:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Paste your exported save code, game string, or level password here (e.g. Cookie Clicker save text, Retro Bowl save string, Duck Life password)..."
                    className="w-full px-3.5 py-2 text-xs font-mono bg-black/40 border border-amber-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Checkpoint Label:</label>
                    <input
                      type="text"
                      value={customCheckpointTitle}
                      onChange={(e) => setCustomCheckpointTitle(e.target.value)}
                      placeholder="e.g. 500 Trillion Cookies, Super Bowl Win, Duck 100 Stats..."
                      className="w-full px-3.5 py-2 text-xs bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Target Slot:</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-black/40 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                    >
                      <option value="new_checkpoint">📸 New Code Slot</option>
                      <option value="slot1">Slot 1 (Quick)</option>
                      <option value="slot2">Slot 2</option>
                      <option value="slot3">Slot 3</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    💡 When restored, this code is copied to your clipboard instantly for 1-click in-game pasting!
                  </span>
                  <button
                    onClick={handleSaveCodeCheckpoint}
                    disabled={isSaving || !manualCodeInput.trim()}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-40 bg-amber-500 text-black hover:bg-amber-400"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Code Checkpoint</span>
                  </button>
                </div>
              </div>
            )}

            {saveMode === 'file' && (
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={batteryFileInputRef}
                  onChange={handleUploadBatteryFile}
                  accept=".sav,.state,.json,.sol,.txt,.dat"
                  className="hidden"
                />
                <div 
                  onClick={() => batteryFileInputRef.current?.click()}
                  className="p-6 rounded-xl border border-dashed border-sky-400/40 bg-sky-950/20 hover:bg-sky-950/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Upload className="w-8 h-8 text-sky-400" />
                  <span className="text-xs font-bold text-sky-200">
                    Click to select .sav, .state, .sol, .json, or .txt battery save file
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Automatically backs up to Firestore Cloud Vault and syncs to all your Chromebooks and PCs
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Saved Checkpoints List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Saved Moments & Checkpoints
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold font-mono">
                  {gameSaves.length}
                </span>
              </div>

              {gameSaves.length > 0 && (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click <strong className="text-emerald-400 font-semibold">Restore</strong> to jump straight back to that exact area
                </span>
              )}
            </div>

            {gameSaves.length === 0 ? (
              <div 
                className="p-8 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 border-dashed"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderColor: "rgba(255, 255, 255, 0.12)"
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="max-w-sm">
                  <h4 className="text-sm font-bold text-white mb-1">No Checkpoints Saved Yet</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click the "Capture & Save Checkpoint Now" button above while playing to bookmark your exact in-game progress, level, and timestamp.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {gameSaves.map((save, idx) => {
                  const exactFormattedTime = formatExactTimestamp(save.updatedAt || save.createdAt);
                  const timeAgo = formatTimeAgo(save.updatedAt || save.createdAt);
                  const dataSize = formatSaveBytes(save.saveData ? save.saveData.length : 0);
                  const isCurrentlyRestoring = isRestoring && restoredSaveId === save.id;
                  const isLatest = idx === 0;

                  let parsedPayload: any = null;
                  try {
                    parsedPayload = JSON.parse(save.saveData);
                  } catch {}

                  const hasManualCode = parsedPayload && (parsedPayload.type === 'manual_code' || parsedPayload.manualCode);
                  const manualCodeVal = parsedPayload?.manualCode;
                  const hasBatteryFile = parsedPayload && (parsedPayload.type === 'battery_file' || parsedPayload.saveFileBase64);
                  const fileNameVal = parsedPayload?.saveFileName;
                  const hasBookmark = save.saveType === 'bookmark' || Boolean(parsedPayload?.bookmarkNote);
                  const levelVal = save.level || parsedPayload?.level;
                  const scoreVal = typeof save.score === 'number' ? save.score : parsedPayload?.score;

                  return (
                    <div
                      key={save.id}
                      className="rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group"
                      style={{
                        backgroundColor: isLatest ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.025)",
                        borderColor: isLatest ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.08)"
                      }}
                    >
                      {/* Left: Info & Time Area */}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Slot Tag */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            save.slot === 'slot1'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : save.slot.startsWith('code_')
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : save.slot.startsWith('file_')
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : save.slot.startsWith('cp_')
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-white/10 text-slate-300 border-white/15'
                          }`}>
                            {save.slot === 'slot1' ? 'Slot 1 (Quick)' : save.slot.startsWith('code_') ? 'Code Save' : save.slot.startsWith('file_') ? 'File Save' : save.slot.startsWith('cp_') ? 'Snapshot' : save.slot.toUpperCase()}
                          </span>

                          {hasBookmark && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                              <Bookmark className="w-2.5 h-2.5" /> Bookmark
                            </span>
                          )}

                          {hasManualCode && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Key className="w-2.5 h-2.5" /> Save Code
                            </span>
                          )}

                          {hasBatteryFile && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" /> Battery File
                            </span>
                          )}

                          {levelVal && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Lv: {levelVal}
                            </span>
                          )}

                          {typeof scoreVal === 'number' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                              Score: {scoreVal.toLocaleString()}
                            </span>
                          )}

                          {isLatest && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Latest
                            </span>
                          )}

                          {/* Relative Time */}
                          <span className="text-xs font-semibold text-slate-400">
                            {timeAgo}
                          </span>
                        </div>

                        {/* Checkpoint Title / Note */}
                        {editingSaveId === save.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={(e) => setEditingTitleText(e.target.value)}
                              className="px-2.5 py-1 text-xs bg-black/60 border border-emerald-400 rounded-lg text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(save)}
                              className="px-2 py-1 text-xs font-bold bg-emerald-500 text-black rounded-lg cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSaveId(null)}
                              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate max-w-sm">
                              {save.title || `Checkpoint (${exactFormattedTime})`}
                            </h4>
                            <button
                              onClick={() => handleStartRename(save)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                              title="Rename checkpoint label"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Exact Timestamp & Metadata */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-emerald-400/90 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {exactFormattedTime}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-slate-500" />
                            {save.deviceLabel || "Web Browser"}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-500">
                            {dataSize} ({save.saveType || (hasManualCode ? 'save-code' : hasBatteryFile ? 'battery-file' : 'universal')})
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        {/* Direct Copy Code Action for Code Saves */}
                        {hasManualCode && (
                          <button
                            onClick={() => handleCopyCode(manualCodeVal, save.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              copiedCodeId === save.id
                                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                            }`}
                            title="Copy in-game save code to clipboard for 1-click loading"
                          >
                            {copiedCodeId === save.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Direct Download Action for Battery Files */}
                        {hasBatteryFile && (
                          <button
                            onClick={() => handleDownloadSavedFile(save)}
                            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-300"
                            title={`Download ${fileNameVal || 'battery save file'}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {fileNameVal ? fileNameVal.slice(0, 12) : 'File'}</span>
                          </button>
                        )}

                        {/* Primary: GO TO THIS MOMENT / RESTORE */}
                        <button
                          onClick={() => handleRestoreCheckpoint(save)}
                          disabled={isRestoring}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border"
                          style={{
                            backgroundColor: isLatest ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                            borderColor: isLatest ? "#10b981" : "rgba(255, 255, 255, 0.2)",
                            color: isLatest ? "#34d399" : "#ffffff"
                          }}
                          title="Restore game state to this exact second and reload"
                        >
                          {isCurrentlyRestoring ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Restoring...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Go To This Moment</span>
                            </>
                          )}
                        </button>

                        {/* Export Checkpoint */}
                        <button
                          onClick={() => handleExportSave(save)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                          title="Export checkpoint to JSON file"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Delete Checkpoint */}
                        <button
                          onClick={() => handleDeleteCheckpoint(save)}
                          className={`p-2 rounded-xl transition-colors border cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            confirmDeleteId === save.id
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
                          }`}
                          title={confirmDeleteId === save.id ? "Click again to confirm delete" : "Delete checkpoint"}
                        >
                          <Trash2 className="w-4 h-4" />
                          {confirmDeleteId === save.id && <span>Confirm</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Settings & Sync Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={toggleAutoSave}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-black/40"
                />
                <span className="text-slate-300 font-medium">Auto-capture checkpoint every 3 min</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {/* Import from file button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Save JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSaveFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border font-bold text-slate-200 hover:text-white transition-colors cursor-pointer border-white/15 bg-white/5"
              >
                Done
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
