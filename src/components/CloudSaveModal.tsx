import React from "react";
import { Game } from "../types/game";
import { ThemeConfig } from "../services/themeStore";

interface CloudSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: Game;
  onReloadGame?: () => void;
  theme?: ThemeConfig;
  contentWindow?: Window | null;
}

export const CloudSaveModal: React.FC<CloudSaveModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#080f1d] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
        <h3 className="text-lg font-bold text-white mb-2">Cloud Saves</h3>
        <p className="text-xs text-slate-400 mb-6">Game progress and save state syncing across devices.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};
