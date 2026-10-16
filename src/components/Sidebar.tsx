import React from 'react';
import { 
  Home, 
  Gamepad2, 
  Globe, 
  Bot, 
  Layers, 
  Music, 
  Eye, 
  Cloud, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Palette, 
  User 
} from 'lucide-react';
import { ThemeColors } from '../services/themeStore';

export interface TabItem {
  id: string;
  title: string;
  spaceType: 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'tools' | 'saved';
  icon?: string;
  url?: string;
}

interface SidebarProps {
  activeSpace: string;
  onSelectSpace: (space: any) => void;
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  splitTabId: string | null;
  onToggleSplitTab: (id?: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAccountModal: () => void;
  onOpenThemeModal: () => void;
  onLockSite: () => void;
  activeTheme: ThemeColors;
  totalGames: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSpace,
  onSelectSpace,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  splitTabId,
  onToggleSplitTab,
  isCollapsed,
  onToggleCollapse,
  onOpenAccountModal,
  onOpenThemeModal,
  onLockSite,
  activeTheme,
  totalGames
}) => {
  const navItems = [
    { space: 'home', label: 'Home', icon: Home },
    { space: 'games', label: `Games (${totalGames})`, icon: Gamepad2 },
    { space: 'proxy', label: 'Web Proxy', icon: Globe },
    { space: 'music', label: 'Music', icon: Music },
    { space: 'ai', label: 'MelonBot AI', icon: Bot },
    { space: 'apps', label: 'Apps & Tools', icon: Layers },
    { space: 'tools', label: 'Tab Cloaker', icon: Eye },
    { space: 'saved', label: 'Cloud Saves', icon: Cloud }
  ];

  return (
    <aside 
      className={`h-screen border-r flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        backgroundColor: activeTheme.bgSecondary,
        borderColor: activeTheme.border
      }}
    >
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 border-b flex items-center justify-between" style={{ borderColor: activeTheme.border }}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-2xl">🍉</span>
              <span className="font-extrabold text-sm tracking-tight text-white truncate">
                Owen Watermelon
              </span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-2xl mx-auto">🍉</span>
          )}
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer ml-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation Spaces */}
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSpace === item.space;
            return (
              <button 
                key={item.space}
                onClick={() => onSelectSpace(item.space)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'text-black shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? activeTheme.accent : 'transparent'
                }}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Browser Tabs Section */}
        {!isCollapsed && (
          <div className="px-3 mt-3">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <span>Open Tabs ({tabs.length})</span>
              <button 
                onClick={onNewTab}
                className="p-1 hover:text-white rounded hover:bg-white/5 cursor-pointer"
                title="New Tab"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto mt-1">
              {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                return (
                  <div 
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer border transition-all ${
                      isActive 
                        ? 'text-white border-emerald-500/30 bg-emerald-500/10' 
                        : 'text-slate-400 border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{tab.icon || '📄'}</span>
                      <span className="truncate">{tab.title}</span>
                    </div>
                    {tabs.length > 1 && (
                      <button 
                        onClick={(e) => onCloseTab(tab.id, e)}
                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-white/10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Utility Actions */}
      <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: activeTheme.border }}>
        <button 
          onClick={onOpenAccountModal}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          title="Account"
        >
          <User className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Profile & Cloud</span>}
        </button>
        <button 
          onClick={onOpenThemeModal}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          title="Themes"
        >
          <Palette className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Theme Studio</span>}
        </button>
        <button 
          onClick={onLockSite}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
          title="Lock Site"
        >
          <Lock className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Lock Portal</span>}
        </button>
      </div>
    </aside>
  );
};
