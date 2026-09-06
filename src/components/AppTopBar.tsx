import React from 'react';
import { useLeadForge, NavigationTab } from '../context/LeadForgeContext';
import { Search, Bell, Sparkles, Zap } from 'lucide-react';

export const AppTopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedOpportunityId,
    setSelectedOpportunityId,
    opportunitySubView,
    setOpportunitySubView,
    accounts,
    notifications,
    setCommandPaletteOpen,
    setNotificationsDrawerOpen,
    isAIWorking,
    enterFocusMode,
    opportunities,
    tasks,
  } = useLeadForge();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const isViewingOpportunityDetail = activeTab === 'opportunities' && !!selectedOpportunityId;
  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);
  const selectedAcc = accounts.find((a) => a.id === selectedOpp?.accountId);

  const pageHeaders: Record<NavigationTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Overview',
      subtitle: 'Your sales intelligence briefing',
    },
    opportunities: {
      title: "Today's Opportunities",
      subtitle: 'Your highest-value opportunities, ranked by urgency and fit.',
    },
    accounts: {
      title: 'Accounts',
      subtitle: 'Monitored target organizations & signals',
    },
    contacts: {
      title: 'Contacts',
      subtitle: 'Key executive decision makers & champions',
    },
    pipeline: {
      title: 'Pipeline',
      subtitle: 'Stage progression & conversion velocity',
    },
    tasks: {
      title: 'Activity',
      subtitle: 'Follow-ups, outreach reviews & action queue',
    },
    icp: {
      title: 'ICP Profile',
      subtitle: 'Ideal customer qualification rules',
    },
    research: {
      title: 'Research',
      subtitle: 'Deep intelligence dossiers & evidence archives',
    },
    analytics: {
      title: 'Analytics',
      subtitle: 'Pipeline metrics & conversion rates',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Workspace configuration & model parameters',
    },
  };

  const currentHeader = pageHeaders[activeTab] || pageHeaders.overview;

  const mobileTabs: { id: NavigationTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'tasks', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header
      id="leadforge-top-bar"
      className="sticky top-0 z-20 w-full bg-black/80 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-4 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Top-Left: Page title & Subheading */}
        <div className="flex items-center gap-3">
          {/* Mobile LF Brand Mark */}
          <div
            onClick={() => setActiveTab('overview')}
            className="md:hidden w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-semibold text-xs tracking-tighter shrink-0 cursor-pointer"
          >
            LF
          </div>

          {isViewingOpportunityDetail ? (
            <div className="flex items-center gap-2 text-xs font-ui">
              <button
                onClick={() => setSelectedOpportunityId(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Opportunities
              </button>
              <span className="text-white/30">/</span>
              {opportunitySubView === 'research' ? (
                <>
                  <button
                    onClick={() => setOpportunitySubView('dossier')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer font-medium"
                  >
                    {selectedAcc?.name || 'Acme SaaS'}
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-white font-medium">Research</span>
                </>
              ) : (
                <span className="text-white font-medium">{selectedAcc?.name || 'Acme SaaS'}</span>
              )}
            </div>
          ) : (
            <div>
              <h1 className="font-ui font-semibold text-base sm:text-lg text-white tracking-tight leading-tight">
                {currentHeader.title}
              </h1>
              <p className="font-ui font-light text-xs text-white/50 tracking-normal hidden sm:block">
                {currentHeader.subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Top-Right: Search pill, Focus Mode, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Processing Status */}
          {isAIWorking && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-ui animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Researching</span>
            </div>
          )}

          {/* Quick Focus Sprint */}
          <button
            onClick={() => enterFocusMode()}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-ui transition-all"
            title="Focus sprint mode (F)"
          >
            <Zap className="w-3.5 h-3.5 text-white/70" />
            <span>Focus</span>
          </button>

          {/* Search Pill: Search opportunities… / Search anything… [ ⌘ K ] */}
          <button
            id="topbar-search-pill"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-ui transition-all luminous-edge"
            title="Open command search (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-white/50" />
            <span className="hidden sm:inline">
              {activeTab === 'opportunities' ? 'Search opportunities…' : 'Search anything…'}
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 border border-white/10">
              ⌘ K
            </kbd>
          </button>

          {/* Notification Icon */}
          <button
            id="topbar-notifications-toggle"
            onClick={() => setNotificationsDrawerOpen(true)}
            className="relative p-2 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}
          </button>

          {/* Workspace Avatar / Initials: AB */}
          <div
            id="workspace-avatar-pill"
            className="w-8 h-8 rounded-full glass-pill border border-white/[0.18] flex items-center justify-center text-xs font-ui font-medium text-white/90 shadow-sm cursor-pointer hover:border-white/40 transition-all select-none"
            title="Operator: Alex Bennett (AB)"
          >
            AB
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Rail */}
      <div className="md:hidden flex overflow-x-auto pt-3 gap-1.5 no-scrollbar">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-ui whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black font-medium'
                  : 'glass-pill text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
