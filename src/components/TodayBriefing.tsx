import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadForge } from '../context/LeadForgeContext';
import { PrioritizationMode } from '../types';
import {
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  RotateCw,
  Zap,
  SlidersHorizontal,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const TodayBriefing: React.FC = () => {
  const {
    opportunities,
    accounts,
    evidence,
    tasks,
    researchRuns,
    openOpportunityDetail,
    setOutreachModalOpen,
    setSelectedOpportunityId,
    completeTask,
    setActiveTab,
    prioritizationMode,
    setPrioritizationMode,
    rerankOpportunitiesWithAI,
    isAIWorking,
    enterFocusMode,
  } = useLeadForge();

  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  // Filter active opportunities
  const activeOpportunities = opportunities.filter(
    (o) => o.stage !== 'WON' && o.stage !== 'LOST'
  );

  // Dynamic sorting engine based on prioritizationMode
  const sortedOpportunities = [...activeOpportunities].sort((a, b) => {
    if (prioritizationMode === 'AI_DYNAMIC') {
      const scoreA = a.dynamicScore ?? a.score;
      const scoreB = b.dynamicScore ?? b.score;
      return scoreB - scoreA;
    }

    if (prioritizationMode === 'SCORE') {
      return b.score - a.score;
    }

    if (prioritizationMode === 'DEADLINES') {
      const urgencyWeight: Record<string, number> = {
        IMMEDIATE: 4,
        TODAY: 3,
        THIS_WEEK: 2,
        LOW: 1,
      };
      const urgA = urgencyWeight[a.nextAction?.urgency] || 1;
      const urgB = urgencyWeight[b.nextAction?.urgency] || 1;
      if (urgA !== urgB) return urgB - urgA;
      return b.score - a.score;
    }

    if (prioritizationMode === 'FRESH_SIGNALS') {
      const evA = evidence.filter((e) => e.opportunityId === a.id).length;
      const evB = evidence.filter((e) => e.opportunityId === b.id).length;
      if (evA !== evB) return evB - evA;
      return b.score - a.score;
    }

    return b.score - a.score;
  });

  const topOpportunities = sortedOpportunities.slice(0, 5);
  const dueTodayTasks = tasks.filter((t) => t.status === 'DUE' || t.status === 'OVERDUE');
  const highPriorityCount = opportunities.filter((o) => o.score >= 85).length;

  const handleActionClick = (oppId: string, actionType: string) => {
    setSelectedOpportunityId(oppId);
    if (actionType === 'OUTREACH') {
      setOutreachModalOpen(true);
    } else {
      openOpportunityDetail(oppId);
    }
  };

  const handleRerankClick = async () => {
    await rerankOpportunitiesWithAI();
    setSimulatedFeedback('Prioritization recalculated: 3 opportunities boosted by recent market signals & approaching deadlines.');
    setTimeout(() => setSimulatedFeedback(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Briefing Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/50 text-xs font-ui tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>AI Sales Intelligence Briefing • 03 September 2026</span>
          </div>

          <h1 className="font-editorial italic text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[0.95]">
            Good morning. Here&apos;s where I&apos;d focus today.
          </h1>

          <p className="text-white/60 font-ui text-sm sm:text-base max-w-2xl font-light pt-1 leading-relaxed">
            {highPriorityCount} accounts demand executive action today. Dynamic AI prioritization ranks items by fresh signals, imminent deadlines, and high-probability conversion patterns.
          </p>
        </div>

        {/* Header Action Buttons: Focus Sprint + Quick Stats */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Dedicated Focus Sprint Launcher */}
          <button
            onClick={() => enterFocusMode(topOpportunities[0]?.id)}
            className="px-5 py-2.5 rounded-full bg-white text-black font-ui font-medium text-xs hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-white/10"
            title="Enter distraction-free Focus Mode"
          >
            <Zap className="w-4 h-4 text-black fill-black" />
            <span>Start Focus Sprint</span>
          </button>

          {/* KPI metrics pill */}
          <div className="px-4 py-2 rounded-full glass-panel flex items-center gap-4">
            <div className="text-right">
              <div className="font-editorial italic text-xl text-white leading-none">
                {activeOpportunities.length}
              </div>
              <div className="text-[9px] text-white/50 uppercase tracking-wider font-ui mt-0.5">
                Pursuits
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-right">
              <div className="font-editorial italic text-xl text-white leading-none">
                {dueTodayTasks.length}
              </div>
              <div className="text-[9px] text-white/50 uppercase tracking-wider font-ui mt-0.5">
                Due Today
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Prioritization Controls Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/[0.10] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Prioritization Mode Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-ui uppercase tracking-wider text-white/40 mr-1 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Priority Engine:
          </span>

          <button
            onClick={() => setPrioritizationMode('AI_DYNAMIC')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-ui transition-all flex items-center gap-1.5 ${
              prioritizationMode === 'AI_DYNAMIC'
                ? 'bg-white text-black font-medium shadow-sm'
                : 'glass-pill text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Dynamic Priority</span>
          </button>

          <button
            onClick={() => setPrioritizationMode('DEADLINES')}
            className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all flex items-center gap-1.5 ${
              prioritizationMode === 'DEADLINES'
                ? 'bg-white text-black font-medium shadow-sm'
                : 'glass-pill text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Imminent Deadlines</span>
          </button>

          <button
            onClick={() => setPrioritizationMode('FRESH_SIGNALS')}
            className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all flex items-center gap-1.5 ${
              prioritizationMode === 'FRESH_SIGNALS'
                ? 'bg-white text-black font-medium shadow-sm'
                : 'glass-pill text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Signal Surge</span>
          </button>

          <button
            onClick={() => setPrioritizationMode('SCORE')}
            className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all flex items-center gap-1.5 ${
              prioritizationMode === 'SCORE'
                ? 'bg-white text-black font-medium shadow-sm'
                : 'glass-pill text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Score (Fit & Need)</span>
          </button>
        </div>

        {/* Re-rank with AI trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRerankClick}
            disabled={isAIWorking}
            className="px-4 py-1.5 rounded-full glass-panel hover:bg-white/10 active:scale-[0.98] text-xs font-ui text-white/80 hover:text-white border border-white/[0.12] transition-all flex items-center gap-2 disabled:opacity-50"
            title="Re-calculate AI weights against newest market signals and time sensitivity"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAIWorking ? 'animate-spin' : ''}`} />
            <span>{isAIWorking ? 'Re-ranking with AI…' : 'Re-rank with AI'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Re-rank Feedback Banner */}
      <AnimatePresence>
        {simulatedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-white/[0.06] border border-white/20 text-xs font-ui text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>{simulatedFeedback}</span>
            </div>
            <button
              onClick={() => setSimulatedFeedback(null)}
              className="text-white/40 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: 2 columns (Ranked Stack on left, Contextual Rail on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Ranked Opportunity Stack */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-ui text-xs font-semibold uppercase tracking-widest text-white/70">
                Dynamic Priority Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-mono">
                Top {topOpportunities.length} of {activeOpportunities.length}
              </span>
            </div>
            <span className="text-[12px] text-white/40 font-ui hidden sm:inline">
              Ordered by {prioritizationMode.replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>

          <div className="space-y-4">
            {topOpportunities.map((opp, index) => {
              const account = accounts.find((a) => a.id === opp.accountId);
              const oppEvidence = evidence.filter((e) => e.opportunityId === opp.id);
              const rankFormatted = String(index + 1).padStart(2, '0');
              const displayScore =
                prioritizationMode === 'AI_DYNAMIC' && opp.dynamicScore
                  ? opp.dynamicScore
                  : opp.score;

              return (
                <motion.div
                  key={opp.id}
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="group relative rounded-2xl glass-panel p-5 sm:p-6 transition-all duration-300 hover:bg-white/[0.045] hover:border-white/20 border border-white/[0.08] space-y-4"
                >
                  {/* Top row: Rank, Account Name, Dynamic Signal Pill, Opportunity Score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      {/* Rank indicator */}
                      <span className="font-editorial italic text-2xl sm:text-3xl text-white/30 font-light select-none group-hover:text-white/60 transition-colors shrink-0">
                        {rankFormatted}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => openOpportunityDetail(opp.id)}
                            className="font-ui font-semibold text-lg sm:text-xl text-white group-hover:text-white cursor-pointer hover:underline underline-offset-4 tracking-tight"
                          >
                            {account?.name}
                          </h3>
                          <span className="text-white/40 text-xs font-ui">
                            {account?.domain}
                          </span>
                          <span className="text-[11px] font-ui px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/60 border border-white/[0.08]">
                            {account?.industry}
                          </span>
                        </div>

                        {/* Stage, Freshness, and Dynamic Priority Boost Pills */}
                        <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-white/50 font-ui flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                            {opp.stage.replace(/_/g, ' ')}
                          </span>

                          <span className="flex items-center gap-1 text-white/60">
                            <ShieldCheck className="w-3 h-3 text-white/70" />
                            {oppEvidence.length} verified signals
                          </span>

                          {/* Dynamic Priority Boost Badge */}
                          {opp.priorityReasons && opp.priorityReasons.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.14] text-white/90 font-medium flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-white/80" />
                              <span>{opp.priorityReasons[0]}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Opportunity Score Block */}
                    <div
                      onClick={() => openOpportunityDetail(opp.id)}
                      className="cursor-pointer text-right shrink-0 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 group-hover:border-white/20 transition-all"
                    >
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-editorial italic text-3xl font-light text-white leading-none">
                          {displayScore}
                        </span>
                        <span className="text-[10px] text-white/40 font-ui font-medium">/100</span>
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-white/50 font-ui mt-0.5">
                        {prioritizationMode === 'AI_DYNAMIC' ? 'AI Priority' : 'Score'}
                      </div>
                    </div>
                  </div>

                  {/* PROMINENT SECTION 1: WHY THIS OPPORTUNITY MATTERS */}
                  <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-white/60 font-ui flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-white/80" />
                        <span>Why it matters</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 normal-case">
                        Researched {opp.lastResearchedAt}
                      </span>
                    </div>

                    <p className="font-ui text-sm sm:text-[14.5px] text-white/90 leading-relaxed font-light">
                      {opp.whyNow}
                    </p>

                    {/* Cited Evidence Snippets */}
                    {oppEvidence.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {oppEvidence.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[10.5px] font-ui text-white/60 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="truncate max-w-[280px]">{ev.claim}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PROMINENT SECTION 2: RECOMMENDED NEXT BEST ACTION HERO STRIP */}
                  <div className="p-4 rounded-xl bg-white/[0.045] border border-white/[0.14] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white text-black font-ui uppercase tracking-wider">
                          Recommended Action
                        </span>
                        <span className="text-[11px] font-mono text-white/50">
                          Due: {opp.nextAction.dueAt}
                        </span>
                        <span className="text-[10.5px] font-ui px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/[0.10]">
                          {opp.nextAction.urgency}
                        </span>
                      </div>

                      <p className="font-ui font-medium text-xs sm:text-sm text-white leading-snug pt-0.5">
                        {opp.nextAction.actionText}
                      </p>
                    </div>

                    {/* Action Execution Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => enterFocusMode(opp.id)}
                        className="px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 text-xs font-ui text-white/80 hover:text-white transition-all flex items-center gap-1.5 border border-white/[0.12]"
                        title="Enter distraction-free Focus Sprint for this opportunity"
                      >
                        <Zap className="w-3 h-3 text-white/80" />
                        <span>Focus</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(opp.id, opp.nextAction.actionType)}
                        className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-medium flex items-center gap-1.5 shadow-sm hover:shadow-white/20 active:scale-[0.98] transition-all"
                      >
                        <span>Take Action</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View full pipeline link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('opportunities')}
              className="px-5 py-2 rounded-full glass-pill hover:bg-white/[0.06] text-white/60 hover:text-white text-xs font-ui transition-all inline-flex items-center gap-1.5"
            >
              <span>View all {opportunities.length} opportunities in pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Contextual Rail (Due Tasks, Research Jobs, Dynamic Priority Explainer) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dynamic AI Prioritization Explainer Card */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                AI Prioritization Logic
              </h3>
            </div>
            <p className="text-xs text-white/60 font-ui leading-relaxed font-light">
              LeadForge ranks your action queue deterministically using continuous signal synthesis:
            </p>
            <div className="space-y-2 pt-1 text-xs font-ui text-white/70">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span>Imminent & Overdue Deadlines</span>
                <span className="font-mono text-white/90 font-medium">+24 pts</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span>Verified Fresh Signals (&lt;48h)</span>
                <span className="font-mono text-white/90 font-medium">+16 pts</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span>Founder Outreach Momentum</span>
                <span className="font-mono text-white/90 font-medium">+14 pts</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span>Deterministic ICP Fit / Need</span>
                <span className="font-mono text-white/90 font-medium">Core 50%</span>
              </div>
            </div>
          </div>

          {/* Due Tasks Card */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                  Follow-ups & Due Tasks
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white/50">
                {dueTodayTasks.length} pending
              </span>
            </div>

            {dueTodayTasks.length === 0 ? (
              <div className="text-center py-6 text-white/40 text-xs font-ui">
                No overdue tasks. All follow-ups are on schedule.
              </div>
            ) : (
              <div className="space-y-3">
                {dueTodayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:border-white/15 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-xs font-ui font-medium text-white/90 leading-snug">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-white/45 font-ui flex items-center gap-2">
                          <span className={task.status === 'OVERDUE' ? 'text-red-400 font-medium' : 'text-white/60'}>
                            {task.status === 'OVERDUE' ? 'Overdue' : 'Due Today'}
                          </span>
                          <span>•</span>
                          <span>{task.dueAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Research Pipeline Card */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white/60" />
                <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                  Autonomous Research
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white/50">
                {researchRuns.length} runs
              </span>
            </div>

            <div className="space-y-2.5">
              {researchRuns.slice(0, 3).map((run) => (
                <div
                  key={run.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs font-ui"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-white/80">{run.accountName}</div>
                    <div className="text-[10.5px] text-white/40">{run.currentStep}</div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-white/60 font-mono">
                    {run.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
