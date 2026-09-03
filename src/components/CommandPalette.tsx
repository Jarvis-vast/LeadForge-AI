import React, { useState, useEffect } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Search,
  X,
  Target,
  Building2,
  Users,
  Sliders,
  CheckSquare,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    opportunities,
    accounts,
    contacts,
    openOpportunityDetail,
    setActiveTab,
    setImportModalOpen,
  } = useLeadForge();

  const [query, setQuery] = useState('');

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredOpps = opportunities
    .filter((opp) => {
      const acc = accounts.find((a) => a.id === opp.accountId);
      return (
        acc?.name.toLowerCase().includes(query.toLowerCase()) ||
        opp.whyNow.toLowerCase().includes(query.toLowerCase())
      );
    })
    .slice(0, 4);

  const filteredAccounts = accounts
    .filter((acc) => acc.name.toLowerCase().includes(query.toLowerCase()) || acc.domain.includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredContacts = contacts
    .filter((cnt) => cnt.name.toLowerCase().includes(query.toLowerCase()) || cnt.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl glass-panel-elevated border border-white/20 shadow-2xl overflow-hidden p-4 space-y-4">
        {/* Search input row */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a company, contact, or command..."
            className="w-full bg-transparent text-sm font-ui text-white placeholder-white/40 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results groups */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* Quick Actions */}
          {!query && (
            <div className="space-y-1">
              <div className="text-[10px] font-ui uppercase tracking-wider text-white/40 px-2">
                Quick Navigation
              </div>
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-ui text-white/80 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Priority Briefing</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('icp');
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-ui text-white/80 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open ICP Criteria Builder</span>
              </button>
              <button
                onClick={() => {
                  setImportModalOpen(true);
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-ui text-white/80 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import Prospect Accounts CSV</span>
              </button>
            </div>
          )}

          {/* Opportunities */}
          {filteredOpps.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-ui uppercase tracking-wider text-white/40 px-2">
                Opportunities ({filteredOpps.length})
              </div>
              {filteredOpps.map((opp) => {
                const acc = accounts.find((a) => a.id === opp.accountId);
                return (
                  <button
                    key={opp.id}
                    onClick={() => {
                      openOpportunityDetail(opp.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-ui hover:bg-white/10 text-white transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Target className="w-3.5 h-3.5 text-white/60 shrink-0" />
                      <span className="font-semibold text-white">{acc?.name}</span>
                      <span className="text-white/40 truncate text-[11px] font-light">
                        {opp.whyNow}
                      </span>
                    </div>
                    <span className="font-editorial italic text-base text-white/80 shrink-0 ml-2">
                      {opp.score}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Accounts */}
          {filteredAccounts.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-ui uppercase tracking-wider text-white/40 px-2">
                Accounts ({filteredAccounts.length})
              </div>
              {filteredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setActiveTab('accounts');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-ui hover:bg-white/10 text-white transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>{acc.name}</span>
                    <span className="text-white/40 text-[11px]">{acc.domain}</span>
                  </div>
                  <span className="text-white/40 text-[11px]">{acc.industry}</span>
                </button>
              ))}
            </div>
          )}

          {/* Contacts */}
          {filteredContacts.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-ui uppercase tracking-wider text-white/40 px-2">
                Contacts ({filteredContacts.length})
              </div>
              {filteredContacts.map((cnt) => (
                <button
                  key={cnt.id}
                  onClick={() => {
                    setActiveTab('contacts');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-ui hover:bg-white/10 text-white transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>{cnt.name}</span>
                    <span className="text-white/40 text-[11px]">{cnt.title}</span>
                  </div>
                  <span className="text-white/50 text-[11px]">{cnt.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/30 pt-2 border-t border-white/[0.06] px-2 font-mono">
          <span>Navigate with arrow keys</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
