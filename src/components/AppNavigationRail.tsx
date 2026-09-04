import React from 'react';
import { useLeadForge, NavigationTab } from '../context/LeadForgeContext';
import {
  Radar,
  Target,
  Building2,
  Users,
  Kanban,
  CheckSquare,
  Sliders,
  Sparkles,
  LogOut,
} from 'lucide-react';

export const AppNavigationRail: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    opportunities,
    tasks,
    setSelectedOpportunityId,
    logout,
  } = useLeadForge();

  const dueTasksCount = tasks.filter((t) => t.status === 'DUE' || t.status === 'OVERDUE').length;

  const primaryNav: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Radar className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Target className="w-4 h-4" />, badge: opportunities.length },
    { id: 'accounts', label: 'Accounts', icon: <Building2 className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Pipeline', icon: <Kanban className="w-4 h-4" /> },
  ];

  const secondaryNav: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tasks', label: 'Activity', icon: <CheckSquare className="w-4 h-4" />, badge: dueTasksCount },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    if (tab === 'opportunities') {
      setSelectedOpportunityId(null);
    }
    setActiveTab(tab);
  };

  return (
    <aside
      id="leadforge-nav-rail"
      className="hidden md:flex flex-col justify-between w-16 lg:w-56 shrink-0 h-screen sticky top-0 bg-black/90 backdrop-blur-2xl border-r border-white/[0.08] px-3 py-6 z-30 transition-all select-none"
    >
      {/* Top: LF Logo & Workspace Identity */}
      <div className="space-y-6">
        <div
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
          title="LeadForge Overview"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-semibold text-xs tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-transform duration-200 group-hover:scale-105 shrink-0">
            LF
          </div>
          <div className="hidden lg:flex flex-col min-w-0">
            <span className="font-ui font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              LeadForge
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 border border-white/10">
                v1.0
              </span>
            </span>
            <span className="text-[11px] text-white/40 font-ui font-light truncate">
              Intelligence System
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {primaryNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-ui transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-black font-medium shadow-[0_0_20px_rgba(255,255,255,0.18)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={item.label}
              >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-black' : 'text-white/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:inline truncate font-medium">
                  {item.label}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`hidden lg:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'bg-white/10 text-white/70 group-hover:bg-white/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Separated Lower Section: Activity & Settings */}
      <div className="pt-6 border-t border-white/[0.08] space-y-1">
        {secondaryNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-ui transition-all duration-200 group relative ${
                isActive
                  ? 'bg-white text-black font-medium shadow-[0_0_20px_rgba(255,255,255,0.18)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
              title={item.label}
            >
              <span className={`shrink-0 transition-colors ${isActive ? 'text-black' : 'text-white/70 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="hidden lg:inline truncate font-medium">
                {item.label}
              </span>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`hidden lg:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white/10 text-white/70 group-hover:bg-white/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Sign Out Shortcut */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-ui text-white/40 hover:text-white hover:bg-white/[0.04] transition-all group"
          title="Sign out of LeadForge"
        >
          <LogOut className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
          <span className="hidden lg:inline truncate">Sign out</span>
        </button>
      </div>
    </aside>
  );
};
