import React from 'react';
import { useLeadForge, NavigationTab } from '../context/LeadForgeContext';
import {
  Search,
  Bell,
  UploadCloud,
  Sparkles,
  Sliders,
  CheckSquare,
  Building2,
  Users,
  Kanban,
  Radar,
  Target,
  Zap,
  LogOut,
  User,
} from 'lucide-react';

export const HeaderNavigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    opportunities,
    tasks,
    notifications,
    setCommandPaletteOpen,
    setImportModalOpen,
    setNotificationsDrawerOpen,
    setSelectedOpportunityId,
    isAIWorking,
    workspace,
    enterFocusMode,
    logout,
    reopenOnboarding,
    currentUser,
  } = useLeadForge();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const dueTasksCount = tasks.filter((t) => t.status === 'DUE' || t.status === 'OVERDUE').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Radar className="w-3.5 h-3.5 mr-1.5 opacity-70" />, badge: 3 },
    { id: 'opportunities', label: 'Opportunities', icon: <Target className="w-3.5 h-3.5 mr-1.5 opacity-70" />, badge: opportunities.length },
    { id: 'pipeline', label: 'Pipeline', icon: <Kanban className="w-3.5 h-3.5 mr-1.5 opacity-70" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3.5 h-3.5 mr-1.5 opacity-70" />, badge: dueTasksCount },
    { id: 'accounts', label: 'Accounts', icon: <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-70" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="w-3.5 h-3.5 mr-1.5 opacity-70" /> },
    { id: 'icp', label: 'ICP Builder', icon: <Sliders className="w-3.5 h-3.5 mr-1.5 opacity-70" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black font-semibold text-xs tracking-tighter transition-transform group-hover:scale-105">
              LF
            </div>
            <div className="flex flex-col">
              <span className="font-ui font-semibold text-sm tracking-wider text-white uppercase flex items-center gap-1.5">
                LeadForge
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 border border-white/10">
                  V1.0
                </span>
              </span>
              <span className="text-[11px] text-white/40 tracking-tight font-ui truncate max-w-[140px] md:max-w-[180px]">
                {workspace.name}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Liquid-glass Navigation Pill */}
        <nav className="hidden lg:flex items-center p-1 rounded-full glass-pill luminous-edge">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'opportunities') {
                    setSelectedOpportunityId(null);
                  }
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center text-xs font-ui font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'glass-pill-active text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search / Command Palette */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.06] text-white/60 hover:text-white text-xs font-ui transition-all"
            title="Press Cmd+K to search"
          >
            <Search className="w-3.5 h-3.5 text-white/50" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Focus Sprint Launcher */}
          <button
            onClick={() => enterFocusMode()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.16] text-white text-xs font-ui transition-all"
            title="Enter Focus Mode (Esc to exit)"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Focus Sprint</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-ui transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-white/70" />
            <span>Import CSV</span>
          </button>

          {/* AI Activity Status Pill */}
          {isAIWorking && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-ui animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="hidden md:inline">AI Operating</span>
            </div>
          )}

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setNotificationsDrawerOpen(true)}
            className="relative p-2 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}
          </button>

          {/* Settings Tab shortcut */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-full glass-pill hover:bg-white/[0.08] transition-all ${
              activeTab === 'settings' ? 'text-white glass-pill-active' : 'text-white/60 hover:text-white'
            }`}
            title="Workspace Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Teach LeadForge (Screen 02 Onboarding) */}
          <button
            onClick={reopenOnboarding}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-ui transition-all"
            title="Teach LeadForge what you sell (Screen 02 Onboarding)"
          >
            <Sparkles className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden xl:inline">Onboarding</span>
          </button>

          {/* User Sign Out / Return to Screen 01 Welcome Screen */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-ui transition-all"
            title="Sign out to Screen 01 Welcome screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex lg:hidden overflow-x-auto py-2 mt-2 gap-1.5 no-scrollbar border-t border-white/[0.04]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'opportunities') {
                  setSelectedOpportunityId(null);
                }
                setActiveTab(item.id);
              }}
              className={`flex items-center text-xs font-ui px-3 py-1.5 rounded-full shrink-0 transition-all ${
                isActive
                  ? 'glass-pill-active text-white'
                  : 'glass-pill text-white/60'
              }`}
            >
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({item.badge})</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
