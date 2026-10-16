import React from 'react';
import { 
  Gamepad2, 
  Globe, 
  Bot, 
  LayoutGrid, 
  Radio, 
  ShieldCheck, 
  Cloud, 
  Plus, 
  X, 
  Columns, 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  Home,
  Dices
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { triggerPanic } from '../data/cloakPresets';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';

export interface TabItem {
  id: string;
  title: string;
  icon?: string;
  spaceType: 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'gambling' | 'tools' | 'saved';
  url?: string;
}

interface OwenSidebarProps {
  activeSpace: 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'gambling' | 'tools' | 'saved';
  onSelectSpace: (space: 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'gambling' | 'tools' | 'saved') => void;
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  splitTabId?: string | null;
  onToggleSplitTab?: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAccountModal: () => void;
  onOpenThemeModal: () => void;
  onLockSite?: () => void;
  activeTheme: ThemeConfig;
  totalGames: number;
}

export const Sidebar: React.FC<OwenSidebarProps> = ({
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
  const { profile } = useAuth();
  const currentAvatar = AVATAR_PRESETS.find(a => a.id === (profile?.avatarId || 'melon_classic')) || AVATAR_PRESETS[0];

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'games', label: 'Games', icon: Gamepad2, emoji: '🎮' },
    { id: 'gambling', label: 'Fake Gambling', icon: Dices, emoji: '🎰' },
    { id: 'proxy', label: 'Proxy', icon: Globe, emoji: '🌐' },
    { id: 'ai', label: 'AI Chat', icon: Bot, emoji: '🤖' },
    { id: 'apps', label: 'Apps', icon: LayoutGrid, emoji: '📱' },
    { id: 'music', label: 'Music', icon: Radio, emoji: '🎵' },
    { id: 'tools', label: 'Cloaker', icon: ShieldCheck, emoji: '🛠️' },
    { id: 'saved', label: 'Saves', icon: Cloud, emoji: '💾' }
  ] as const;

  return (
    <aside 
      className={`hidden md:flex flex-col shrink-0 select-none z-30 transition-all duration-300 border-r text-slate-200 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
      style={{
        backgroundColor: activeTheme.bgHeader || activeTheme.bgPrimary,
        borderColor: activeTheme.border
      }}
    >
      {/* Top OwenWatermelonV3 Brand Area */}
      <div 
        className="h-16 px-3.5 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: activeTheme.border }}
      >
        <button
          onClick={() => onSelectSpace('home')}
          className="flex items-center gap-3 cursor-pointer text-left overflow-hidden group"
          title="OwenWatermelonV3 OS"
        >
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg group-hover:scale-105 transition-transform border"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.borderActive
            }}
          >
            {activeTheme.emoji || '🍉'}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-white tracking-tight leading-tight flex items-center gap-1 truncate">
                <span>OwenWatermelon</span>
                <span className="font-mono text-xs" style={{ color: activeTheme.accent }}>V3</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {totalGames} unblocked games
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Spaces Rail */}
      <div 
        className="p-2.5 flex flex-col gap-1 border-b shrink-0"
        style={{ borderColor: activeTheme.border }}
      >
        {!isCollapsed && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 py-1">
            Spaces
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeSpace === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSpace(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative group ${
                  isActive
                    ? 'text-white border shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                style={{
                  backgroundColor: isActive ? activeTheme.accentBadge : undefined,
                  borderColor: isActive ? activeTheme.borderActive : 'transparent'
                }}
                title={item.label}
              >
                <div className="flex items-center justify-center shrink-0">
                  <Icon 
                    className="w-4 h-4 transition-colors" 
                    style={{ color: isActive ? activeTheme.accent : undefined }} 
                  />
                </div>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {isActive && (
                  <span 
                    className="absolute right-2 w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: activeTheme.accent, boxShadow: `0 0 8px ${activeTheme.accent}` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Browser Tabs Section */}
      <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
        <div className="flex items-center justify-between px-2 py-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Tabs ({tabs.length})
            </span>
          )}
          <button
            onClick={onNewTab}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border"
            style={{ borderColor: activeTheme.border, color: activeTheme.accent }}
            title="New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-none">
          {tabs.map(tab => {
            const isTabActive = tab.id === activeTabId;
            const isSplit = tab.id === splitTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                  isTabActive
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isTabActive ? activeTheme.bgCard : activeTheme.bgSecondary,
                  borderColor: isTabActive ? activeTheme.borderActive : activeTheme.border
                }}
                title={tab.title}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{tab.icon || '📄'}</span>
                  {!isCollapsed && (
                    <span className="truncate font-medium text-[11px]">{tab.title}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onToggleSplitTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSplitTab(tab.id);
                        }}
                        className={`p-1 rounded hover:bg-white/10 ${isSplit ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                        style={{ color: isSplit ? activeTheme.accent : undefined }}
                        title="Split view"
                      >
                        <Columns className="w-3 h-3" />
                      </button>
                    )}
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseTab(tab.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-rose-400"
                        title="Close tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile, Themes & Stealth Toolbar */}
      <div 
        className="p-2.5 border-t flex flex-col gap-1.5 shrink-0"
        style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bgSecondary }}
      >
        {/* Themes Button */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          title="Change Theme & Custom Studio"
        >
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.borderActive
            }}
          >
            <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
          </div>
          {!isCollapsed && <span>Themes ({activeTheme.name || 'Theme'})</span>}
        </button>

        {/* Panic Button */}
        <button
          onClick={triggerPanic}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
          title="Emergency Panic Button (Redirect to Google Classroom immediately)"
        >
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            🚨
          </div>
          {!isCollapsed && <span>Panic Key (Esc)</span>}
        </button>

        {/* User Account / Profile */}
        <button
          onClick={onOpenAccountModal}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          title="Account & Cloud Saves"
        >
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.borderActive
            }}
          >
            {currentAvatar.icon || '👤'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left truncate">
              <span className="truncate text-[11px] font-bold text-white">
                {profile?.displayName || 'Guest Player'}
              </span>
              <span className="truncate text-[9px] text-slate-500 font-mono">
                Cloud Sync Active
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
