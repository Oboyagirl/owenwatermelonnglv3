import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Gamepad2, 
  PlusCircle, 
  Trash2, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Game, SiteSettings } from '../types/game';

interface SiteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (updates: Partial<SiteSettings>) => void;
  onResetSiteSettings: () => void;
  games: Game[];
  onUpdateGame: (game: Game) => void;
  onAddGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
  onResetGames: () => void;
  onExitCreatorMode: () => void;
}

export const SiteEditorModal: React.FC<SiteEditorModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onUpdateSiteSettings,
  onResetSiteSettings,
  games,
  onUpdateGame,
  onAddGame,
  onDeleteGame,
  onResetGames,
  onExitCreatorMode
}) => {
  const [activeTab, setActiveTab] = useState<'site' | 'games' | 'add' | 'backup'>('site');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  
  // Game editor state
  const [searchGame, setSearchGame] = useState('');
  const [editingGameId, setEditingGameId] = useState<string>(games[0]?.id || '');
  const selectedGame = games.find(g => g.id === editingGameId) || games[0];

  // Editable game form fields
  const [editTitle, setEditTitle] = useState(selectedGame?.title || '');
  const [editCategory, setEditCategory] = useState(selectedGame?.category || 'Action');
  const [editSecondaryCategory, setEditSecondaryCategory] = useState(selectedGame?.secondaryCategory || 'Potato Classics');
  const [editDescription, setEditDescription] = useState(selectedGame?.description || '');
  const [editThumbnail, setEditThumbnail] = useState(selectedGame?.thumbnail || '');
  const [editIframeSrc, setEditIframeSrc] = useState(selectedGame?.iframeSrc || '');
  const [editIframeCode, setEditIframeCode] = useState(selectedGame?.iframeCode || '');
  const [editTags, setEditTags] = useState(selectedGame?.tags?.join(', ') || '');
  const [editAuthor, setEditAuthor] = useState(selectedGame?.author || '');
  const [editFeatured, setEditFeatured] = useState(selectedGame?.featured || false);

  // Sync edit form when selected game changes
  const handleSelectGameToEdit = (game: Game) => {
    setEditingGameId(game.id);
    setEditTitle(game.title);
    setEditCategory(game.category);
    setEditSecondaryCategory(game.secondaryCategory || 'Potato Classics');
    setEditDescription(game.description);
    setEditThumbnail(game.thumbnail);
    setEditIframeSrc(game.iframeSrc);
    setEditIframeCode(game.iframeCode || `<iframe src="${game.iframeSrc}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`);
    setEditTags(game.tags ? game.tags.join(', ') : '');
    setEditAuthor(game.author || '');
    setEditFeatured(!!game.featured);
  };

  // Add game form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Arcade');
  const [newSecondaryCategory, setNewSecondaryCategory] = useState('Potato Classics');
  const [newDescription, setNewDescription] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newIframeSrc, setNewIframeSrc] = useState('');
  const [newTags, setNewTags] = useState('Unblocked, Web Game');
  const [newAuthor, setNewAuthor] = useState('Community');

  const flashMessage = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSaveCurrentGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    const updated: Game = {
      ...selectedGame,
      title: editTitle.trim(),
      category: editCategory.trim(),
      secondaryCategory: editSecondaryCategory.trim(),
      description: editDescription.trim(),
      thumbnail: editThumbnail.trim(),
      iframeSrc: editIframeSrc.trim(),
      iframeCode: editIframeCode.trim() || `<iframe src="${editIframeSrc.trim()}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      author: editAuthor.trim(),
      featured: editFeatured
    };

    onUpdateGame(updated);
    flashMessage(`Saved "${updated.title}" successfully!`);
  };

  const handleCreateNewGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIframeSrc.trim()) {
      alert('Please provide at least a Title and Game URL / Iframe');
      return;
    }

    const id = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `game-${Date.now()}`;
    const newGame: Game = {
      id,
      title: newTitle.trim(),
      category: newCategory.trim(),
      secondaryCategory: newSecondaryCategory.trim() || 'Custom Added',
      description: newDescription.trim() || 'Custom added game.',
      thumbnail: newThumbnail.trim() || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230c2016"/><text x="50" y="60" font-size="40" text-anchor="middle">🎮</text></svg>',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      rating: 4.8,
      plays: 1,
      author: newAuthor.trim() || 'Owen Custom',
      source: 'unblocked',
      featured: false,
      iframeSrc: newIframeSrc.trim(),
      iframeCode: `<iframe src="${newIframeSrc.trim()}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
      mirrors: [newIframeSrc.trim()]
    };

    onAddGame(newGame);
    flashMessage(`Added new game "${newGame.title}"!`);
    setNewTitle('');
    setNewIframeSrc('');
    setNewDescription('');
    setNewThumbnail('');
    setActiveTab('games');
    setEditingGameId(newGame.id);
    handleSelectGameToEdit(newGame);
  };

  const handleDeleteCurrentGame = () => {
    if (!selectedGame) return;
    if (confirm(`Are you sure you want to delete "${selectedGame.title}"?`)) {
      onDeleteGame(selectedGame.id);
      flashMessage(`Deleted "${selectedGame.title}".`);
      const remaining = games.filter(g => g.id !== selectedGame.id);
      if (remaining.length > 0) {
        handleSelectGameToEdit(remaining[0]);
      }
    }
  };

  const handleExportJson = () => {
    const backup = {
      siteSettings,
      games,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owen-watermelon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flashMessage('Exported configuration backup file!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.siteSettings) {
          onUpdateSiteSettings(parsed.siteSettings);
        }
        if (Array.isArray(parsed.games)) {
          parsed.games.forEach((g: Game) => onUpdateGame(g));
        }
        flashMessage('Configuration successfully imported!');
      } catch (err: any) {
        alert('Invalid backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const filteredGameList = games.filter(g => 
    g.title.toLowerCase().includes(searchGame.toLowerCase()) ||
    g.category.toLowerCase().includes(searchGame.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#08160f] border-2 border-[#10b981] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#16402a] bg-[#0c2016]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Creator Studio & Site Editor
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#10b981] text-[#064e3b]">
                  Unlocked (owenpanedit2244)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full superadmin control over games, categories, animated stars, banners, and proxy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessMsg && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-lg animate-pulse flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {saveSuccessMsg}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#16402a] rounded-xl transition-colors cursor-pointer"
              title="Close Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-[#16402a] bg-[#091b12] overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'site'
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Site Identity & Stars</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'games'
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Games ({games.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#07130c]">
          
          {/* TAB 1: SITE & STARS */}
          {activeTab === 'site' && (
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#10b981]" />
                  <span>Branding & Header Text</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Site Title
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteTitle}
                      onChange={e => onUpdateSiteSettings({ siteTitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Theme Accent Color
                    </label>
                    <select
                      value={siteSettings.themeColor}
                      onChange={e => onUpdateSiteSettings({ themeColor: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                    >
                      <option value="emerald">Emerald Melon (Default)</option>
                      <option value="ruby">Ruby Watermelon Red</option>
                      <option value="violet">Cyber Violet</option>
                      <option value="cyan">Neon Cyan</option>
                      <option value="amber">Solar Amber</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Site Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteSubtitle}
                    onChange={e => onUpdateSiteSettings({ siteSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Announcement Bar Customizer */}
              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Top Announcement Banner</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={siteSettings.announcementActive}
                      onChange={e => onUpdateSiteSettings({ announcementActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#10b981] accent-[#10b981]"
                    />
                    <span>Show Announcement</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Banner Message
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={e => onUpdateSiteSettings({ announcementText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Animated Starfield Controls */}
              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#10b981]" />
                    <span>Animated Stars Background Settings</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">
                    Live canvas preview
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span>Star Drifting Speed:</span>
                      <span className="font-mono text-[#10b981]">{siteSettings.starSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={siteSettings.starSpeed}
                      onChange={e => onUpdateSiteSettings({ starSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-[#10b981] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span>Star Density / Count:</span>
                      <span className="font-mono text-[#10b981]">{siteSettings.starDensity}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={siteSettings.starDensity}
                      onChange={e => onUpdateSiteSettings({ starDensity: parseFloat(e.target.value) })}
                      className="w-full accent-[#10b981] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#16402a]">
                  <span className="text-xs text-slate-300 font-medium">Shooting Stars (Meteors crossing screen)</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-semibold">
                    <input
                      type="checkbox"
                      checked={siteSettings.shootingStarsEnabled}
                      onChange={e => onUpdateSiteSettings({ shootingStarsEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-[#10b981] accent-[#10b981]"
                    />
                    <span>{siteSettings.shootingStarsEnabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onResetSiteSettings}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#16402a] hover:bg-[#255238] rounded-xl transition-colors cursor-pointer"
                >
                  Reset Site Settings
                </button>
                <button
                  onClick={() => flashMessage('Site settings saved!')}
                  className="px-5 py-2 text-xs font-bold text-[#064e3b] bg-[#10b981] hover:bg-[#34d399] rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE & EDIT GAMES */}
          {activeTab === 'games' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Game List / Picker */}
              <div className="lg:col-span-4 bg-[#0c2016] border border-[#16402a] rounded-xl p-4 flex flex-col gap-3 max-h-[65vh]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchGame}
                    onChange={e => setSearchGame(e.target.value)}
                    className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {filteredGameList.map(g => {
                    const isSelected = g.id === selectedGame?.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => handleSelectGameToEdit(g)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#10b981]/20 border-[#10b981] text-white shadow-sm'
                            : 'bg-[#08160f]/60 hover:bg-[#16402a]/60 border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={g.thumbnail}
                            alt=""
                            className="w-7 h-7 rounded object-cover shrink-0 bg-slate-800"
                            onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{g.title}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {g.category} · {g.secondaryCategory || 'Potato Classics'}
                            </div>
                          </div>
                        </div>
                        {g.featured && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded shrink-0">
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Edit Current Game Form */}
              <div className="lg:col-span-8 bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-4">
                {selectedGame ? (
                  <form onSubmit={handleSaveCurrentGame} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#16402a]">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          Edit: <span className="text-[#10b981]">{selectedGame.title}</span>
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">ID: {selectedGame.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteCurrentGame}
                          className="p-2 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-lg border border-rose-800/40 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                          title="Delete game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Game</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Game Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Primary Category
                          </label>
                          <select
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                          >
                            <option value="Action">Action</option>
                            <option value="Arcade">Arcade</option>
                            <option value="Sports">Sports</option>
                            <option value="Racing">Racing</option>
                            <option value="Puzzle">Puzzle</option>
                            <option value="Multiplayer">Multiplayer</option>
                            <option value="Casual">Casual</option>
                            <option value="Horror">Horror</option>
                            <option value="Retro">Retro</option>
                            <option value="Strategy">Strategy</option>
                            <option value="Platformer">Platformer</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Secondary Category
                          </label>
                          <input
                            type="text"
                            value={editSecondaryCategory}
                            onChange={e => setEditSecondaryCategory(e.target.value)}
                            placeholder="e.g. Potato Classics, 2-Player"
                            className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value={editThumbnail}
                          onChange={e => setEditThumbnail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Author / Developer
                        </label>
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={e => setEditAuthor(e.target.value)}
                          className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Game Embed / Play URL (or relative local path)
                      </label>
                      <input
                        type="text"
                        value={editIframeSrc}
                        onChange={e => setEditIframeSrc(e.target.value)}
                        className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981] font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Game Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={e => setEditTags(e.target.value)}
                          className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={editFeatured}
                            onChange={e => setEditFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-[#10b981] accent-[#10b981]"
                          />
                          <span>Pin as Featured Spotlight Game</span>
                        </label>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    Select a game on the left to edit.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW GAME */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateNewGame} className="max-w-2xl bg-[#0c2016] border border-[#16402a] rounded-xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[#16402a]">
                <PlusCircle className="w-4 h-4 text-[#10b981]" />
                <span>Add Any Custom Game or Web App</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. My Favorite Game"
                    required
                    className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Primary Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                    >
                      <option value="Action">Action</option>
                      <option value="Arcade">Arcade</option>
                      <option value="Sports">Sports</option>
                      <option value="Racing">Racing</option>
                      <option value="Puzzle">Puzzle</option>
                      <option value="Multiplayer">Multiplayer</option>
                      <option value="Casual">Casual</option>
                      <option value="Horror">Horror</option>
                      <option value="Retro">Retro</option>
                      <option value="Strategy">Strategy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Second Category
                    </label>
                    <input
                      type="text"
                      value={newSecondaryCategory}
                      onChange={e => setNewSecondaryCategory(e.target.value)}
                      placeholder="e.g. Potato Classics"
                      className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Game URL or Embed Source *
                </label>
                <input
                  type="text"
                  value={newIframeSrc}
                  onChange={e => setNewIframeSrc(e.target.value)}
                  placeholder="https://... or games/my-game/index.html"
                  required
                  className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white font-mono text-xs focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Thumbnail Image URL (optional)
                </label>
                <input
                  type="text"
                  value={newThumbnail}
                  onChange={e => setNewThumbnail(e.target.value)}
                  placeholder="https://... (leave empty for default)"
                  className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Tell players what this game is about..."
                  className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="Unblocked, 2 Player"
                    className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    placeholder="Creator name"
                    className="w-full px-3 py-2 bg-[#07130c] border border-[#16402a] rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Game to Catalog</span>
              </button>
            </form>
          )}

          {/* TAB 4: BACKUP & ACTIONS */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl flex flex-col gap-6">
              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#10b981]" />
                  <span>Export & Import Configuration</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Export your modified games catalog, titles, settings, and custom items to JSON file, or restore them anytime.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2.5 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <label className="px-4 py-2.5 bg-[#16402a] hover:bg-[#255238] text-emerald-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-[#2d6a4f]">
                    <Upload className="w-4 h-4" />
                    <span>Restore from JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Factory Reset</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Restore original games catalog and default settings if you made unwanted changes.
                </p>

                <div>
                  <button
                    onClick={() => {
                      if (confirm('Reset all games and settings to defaults?')) {
                        onResetGames();
                        onResetSiteSettings();
                        flashMessage('Reset to factory defaults!');
                      }
                    }}
                    className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Everything to Default
                  </button>
                </div>
              </div>

              <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-5 flex flex-col gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span>Exit Creator Mode</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lock the editor. You can re-enter anytime by typing the password <span className="font-mono text-emerald-400">owenpanedit2244</span>.
                </p>

                <div>
                  <button
                    onClick={() => {
                      onExitCreatorMode();
                      onClose();
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Lock Creator Mode & Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#16402a] bg-[#0c2016] flex items-center justify-between text-xs text-slate-400">
          <span>Owen Watermelon V3 · Site Editor Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done Editing
          </button>
        </div>

      </div>
    </div>
  );
};
