import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Search, 
  Eye, 
  Palette, 
  User, 
  Columns, 
  Menu 
} from 'lucide-react';
import { ThemeColors } from '../services/themeStore';

export const REQUEST_GAME_URL = "https://github.com/owenpan2244/watermelonbase/issues";

interface HeaderProps {
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  omnibarValue: string;
  onOmnibarSubmit: (val: string) => void;
  onToggleSplit: () => void;
  isSplitActive: boolean;
  onOpenCloakerModal: () => void;
  onOpenAccountModal: () => void;
  onOpenThemeModal: () => void;
  onToggleMobileSidebar: () => void;
  activeTheme: ThemeColors;
  siteSettings: any;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onForward,
  onReload,
  onHome,
  omnibarValue,
  onOmnibarSubmit,
  onToggleSplit,
  isSplitActive,
  onOpenCloakerModal,
  onOpenAccountModal,
  onOpenThemeModal,
  onToggleMobileSidebar,
  activeTheme
}) => {
  const [val, setVal] = useState(omnibarValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOmnibarSubmit(val);
  };

  return (
    <header 
      className="h-14 px-4 border-b flex items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md"
      style={{
        backgroundColor: activeTheme.bgHeader,
        borderColor: activeTheme.border
      }}
    >
      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button 
          onClick={onToggleMobileSidebar} 
          className="p-2 md:hidden text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
        <button 
          onClick={onBack} 
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={onForward} 
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={onReload} 
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Reload"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button 
          onClick={onHome} 
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Center Omnibar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input 
            type="text" 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Search games, unblock URL, or ask MelonBot (Ctrl+K)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 border focus:outline-none transition-all shadow-inner"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.border
            }}
          />
        </div>
      </form>

      {/* Utility Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button 
          onClick={onToggleSplit}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isSplitActive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Split View"
        >
          <Columns className="w-4 h-4" />
        </button>
        <button 
          onClick={onOpenCloakerModal}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Tab Cloaker"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={onOpenThemeModal}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Theme Studio"
        >
          <Palette className="w-4 h-4" />
        </button>
        <button 
          onClick={onOpenAccountModal}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          title="Cloud Account"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
