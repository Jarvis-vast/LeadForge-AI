import React from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import { OpportunityStage } from '../types';
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building,
  Plus,
} from 'lucide-react';

export const PipelineBoard: React.FC = () => {
  const {
    opportunities,
    accounts,
    updateOpportunityStage,
    openOpportunityDetail,
    setOutreachModalOpen,
    setSelectedOpportunityId,
  } = useLeadForge();

  const boardStages: { id: OpportunityStage; label: string }[] = [
    { id: 'NEW', label: 'New Discoveries' },
    { id: 'QUALIFIED', label: 'Qualified' },
    { id: 'PRIORITIZED', label: 'Prioritized' },
    { id: 'READY', label: 'Ready for Action' },
    { id: 'CONTACTED', label: 'Contacted' },
    { id: 'FOLLOW_UP_DUE', label: 'Follow-up Due' },
    { id: 'REPLIED', label: 'Replied' },
    { id: 'MEETING_BOOKED', label: 'Meeting Booked' },
    { id: 'WON', label: 'Won / Retained' },
  ];

  const getStageNext = (current: OpportunityStage): OpportunityStage | null => {
    const order: OpportunityStage[] = [
      'NEW',
      'QUALIFIED',
      'PRIORITIZED',
      'READY',
      'CONTACTED',
      'FOLLOW_UP_DUE',
      'REPLIED',
      'MEETING_BOOKED',
      'WON',
    ];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Pipeline Progression
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1">
            Visual stage management across the opportunity lifecycle. Score and stage remain independent dimensions.
          </p>
        </div>
      </div>

      {/* Horizontal Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[600px] no-scrollbar">
        {boardStages.map((stage) => {
          const stageOpps = opportunities.filter((o) => o.stage === stage.id);

          return (
            <div
              key={stage.id}
              className="w-72 sm:w-80 shrink-0 rounded-2xl glass-panel p-3.5 border border-white/[0.08] flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-ui font-semibold text-xs text-white/80 uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-white/70">
                    {stageOpps.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {stageOpps.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-white/30 font-ui font-light">
                    No active opportunities
                  </div>
                ) : (
                  stageOpps.map((opp) => {
                    const acc = accounts.find((a) => a.id === opp.accountId);
                    const nextStage = getStageNext(opp.stage);

                    return (
                      <div
                        key={opp.id}
                        onClick={() => openOpportunityDetail(opp.id)}
                        className="group rounded-xl p-3.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer space-y-2.5 relative"
                      >
                        {/* Card top */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-ui font-semibold text-sm text-white group-hover:text-white line-clamp-1">
                              {acc?.name}
                            </div>
                            <div className="text-[10px] text-white/40 font-ui truncate">
                              {acc?.industry}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-editorial italic text-xl text-white">
                              {opp.score}
                            </span>
                            <span className="text-[8px] text-white/40 font-ui block -mt-1">SCORE</span>
                          </div>
                        </div>

                        {/* Rationale snippet */}
                        <p className="text-[11px] font-ui text-white/70 font-light line-clamp-2">
                          {opp.whyNow}
                        </p>

                        {/* Next action preview */}
                        <div className="text-[10px] font-ui p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/60">
                          <span className="text-white/40 uppercase block mb-0.5">Next Action:</span>
                          <span className="line-clamp-1 text-white/80">{opp.nextAction.actionText}</span>
                        </div>

                        {/* Card Bottom: Advance Stage button */}
                        <div
                          className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-ui"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedOpportunityId(opp.id);
                              setOutreachModalOpen(true);
                            }}
                            className="text-white/50 hover:text-white transition-colors"
                          >
                            Outreach
                          </button>

                          {nextStage && (
                            <button
                              onClick={() => updateOpportunityStage(opp.id, nextStage)}
                              className="px-2.5 py-0.5 rounded-full glass-pill hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1 transition-all"
                            >
                              <span>Move to {nextStage.replace(/_/g, ' ')}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
