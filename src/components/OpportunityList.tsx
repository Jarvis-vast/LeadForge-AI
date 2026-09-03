import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import { OpportunityStage } from '../types';
import {
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Kanban,
  List,
} from 'lucide-react';

export const OpportunityList: React.FC = () => {
  const {
    opportunities,
    accounts,
    contacts,
    evidence,
    openOpportunityDetail,
    setSelectedOpportunityId,
    setOutreachModalOpen,
    setActiveTab,
  } = useLeadForge();

  const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'followup' | 'high_intent' | 'recent'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filterPills = [
    { id: 'all', label: 'All Pursuits', count: opportunities.length },
    { id: 'hot', label: 'Hot (Score ≥ 85)', count: opportunities.filter((o) => o.score >= 85).length },
    { id: 'followup', label: 'Needs Follow-up', count: opportunities.filter((o) => o.stage === 'FOLLOW_UP_DUE').length },
    { id: 'high_intent', label: 'High Intent', count: opportunities.filter((o) => o.scoreBreakdown.timing >= 85).length },
    { id: 'recent', label: 'Recently Researched', count: opportunities.filter((o) => o.lastResearchedAt.includes('hour') || o.lastResearchedAt.includes('now')).length },
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    const acc = accounts.find((a) => a.id === opp.accountId);
    const cnt = contacts.find((c) => c.id === opp.primaryContactId);

    // Text search
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        acc?.name.toLowerCase().includes(q) ||
        acc?.domain.toLowerCase().includes(q) ||
        acc?.industry.toLowerCase().includes(q) ||
        cnt?.name.toLowerCase().includes(q) ||
        opp.whyNow.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Pill filter
    if (activeFilter === 'hot') return opp.score >= 85;
    if (activeFilter === 'followup') return opp.stage === 'FOLLOW_UP_DUE';
    if (activeFilter === 'high_intent') return opp.scoreBreakdown.timing >= 85;
    if (activeFilter === 'recent') return opp.lastResearchedAt.includes('hour') || opp.lastResearchedAt.includes('now');

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Opportunity Universe
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1">
            Browse and manage all active B2B opportunities ranked continuously by the AI scoring engine.
          </p>
        </div>

        {/* Board / Pipeline switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className="px-3.5 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-xs font-ui text-white/70 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Switch to Pipeline Board</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-ui whitespace-nowrap transition-all ${
                  isActive
                    ? 'glass-pill-active text-white font-medium'
                    : 'glass-pill text-white/60 hover:text-white'
                }`}
              >
                <span>{pill.label}</span>
                <span className="text-[10px] opacity-60">({pill.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search company, contact, signals..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
          />
        </div>
      </div>

      {/* Opportunities Table / Card list */}
      <div className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-ui uppercase tracking-wider text-white/40">
                <th className="py-3.5 px-5 font-semibold">Account & Pursuit</th>
                <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                <th className="py-3.5 px-4 font-semibold">Lifecycle Stage</th>
                <th className="py-3.5 px-4 font-semibold">Target Contact</th>
                <th className="py-3.5 px-4 font-semibold">Next Best Action</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs font-ui">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40 font-light">
                    No opportunities match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => {
                  const acc = accounts.find((a) => a.id === opp.accountId);
                  const cnt = contacts.find((c) => c.id === opp.primaryContactId);
                  const oppEvidence = evidence.filter((e) => e.opportunityId === opp.id);

                  return (
                    <tr
                      key={opp.id}
                      className="hover:bg-white/[0.025] transition-colors group cursor-pointer"
                      onClick={() => openOpportunityDetail(opp.id)}
                    >
                      {/* Account & Details */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-sm text-white group-hover:text-white">
                          {acc?.name}
                        </div>
                        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                          <span>{acc?.domain}</span>
                          <span>•</span>
                          <span className="text-white/60">{acc?.industry}</span>
                        </div>
                        <div className="text-[11px] text-white/60 mt-1 line-clamp-1 font-light max-w-sm">
                          {opp.whyNow}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-editorial italic text-2xl text-white leading-none">
                            {opp.score}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                            {opp.scoreBreakdown.fit}% Fit
                          </span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-ui text-white/80 whitespace-nowrap">
                          {opp.stage.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Primary Contact */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{cnt?.name}</div>
                        <div className="text-[11px] text-white/50">{cnt?.title}</div>
                      </td>

                      {/* Next Best Action */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-white/85 text-xs line-clamp-1 font-medium">
                          {opp.nextAction.actionText}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          Due: {opp.nextAction.dueAt}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openOpportunityDetail(opp.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Inspect Opportunity Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
