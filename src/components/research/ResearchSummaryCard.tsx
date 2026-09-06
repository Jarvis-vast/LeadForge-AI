import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Account, Opportunity } from '../../types';

interface ResearchSummaryCardProps {
  account: Account;
  opportunity: Opportunity;
  onRefreshComplete?: (newScore: number) => void;
  onReviewChanges?: () => void;
}

export const ResearchSummaryCard: React.FC<ResearchSummaryCardProps> = ({
  account,
  opportunity,
  onRefreshComplete,
  onReviewChanges,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);
  const [hasPriorityChanged, setHasPriorityChanged] = useState(false);

  const refreshSteps = [
    `Researching ${account.name}…`,
    'Checking company signals',
    'Checking recent activity',
    'Updating evidence',
    'Recalculating opportunity',
  ];

  const handleTriggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setJustUpdated(false);
    setCurrentStepIndex(0);

    // Run sequential progression through steps (no fake percentages)
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < refreshSteps.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setIsRefreshing(false);
        setJustUpdated(true);
        setHasPriorityChanged(true);
        if (onRefreshComplete) {
          onRefreshComplete(Math.min(99, opportunity.score + 3));
        }
      }
    }, 700);
  };

  return (
    <div className="space-y-3">
      {/* 21. Material Change Notification if priority changed */}
      {hasPriorityChanged && (
        <div className="p-3 sm:p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-ui">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              New evidence changed this opportunity&apos;s priority.
            </span>
          </div>
          <button
            onClick={() => {
              if (onReviewChanges) onReviewChanges();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-medium transition-colors cursor-pointer"
          >
            <span>Review changes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 5. Main Research Summary Card */}
      <div className="p-6 sm:p-7 rounded-2xl liquid-glass-strong border border-white/15 space-y-6 font-ui">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
              RESEARCH SUMMARY
            </span>
            <h2 className="font-ui font-semibold text-lg sm:text-xl text-white tracking-tight">
              Strong opportunity with recent growth signals.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-light max-w-2xl leading-relaxed">
              {account.name} closely matches your ICP and shows multiple recent signals that indicate active commercial expansion.
            </p>
          </div>

          {/* 6. Research Status & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass border border-white/10 text-white text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>RESEARCH COMPLETE</span>
            </div>

            <button
              onClick={handleTriggerRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isRefreshing
                  ? 'bg-white/10 text-white/70 cursor-not-allowed'
                  : 'liquid-glass hover:bg-white/15 text-white border border-white/15'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-white' : 'text-white/60'}`} />
              <span>{isRefreshing ? 'Researching…' : 'Refresh research'}</span>
            </button>
          </div>
        </div>

        {/* Refresh in progress banner */}
        {isRefreshing && (
          <div className="p-3.5 rounded-xl liquid-glass border border-white/15 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-medium">
                {refreshSteps[currentStepIndex]}
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/50">
              Step {currentStepIndex + 1} of {refreshSteps.length}
            </span>
          </div>
        )}

        {/* Research Updated Summary (Section 20) */}
        {justUpdated && !isRefreshing && (
          <div className="p-3.5 rounded-xl liquid-glass border border-emerald-500/30 bg-emerald-500/[0.03] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Research updated successfully</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/70 font-mono">
              <span className="text-white font-medium">2 new signals</span>
              <span className="text-white/30">·</span>
              <span>1 signal removed</span>
              <span className="text-white/30">·</span>
              <span className="text-emerald-400 font-medium">Opportunity score changed 91 → 94</span>
            </div>
          </div>
        )}

        {/* Compact Metadata Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08]">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-white/40 block">
              Examined Sources
            </span>
            <div className="font-ui font-semibold text-sm sm:text-base text-white">
              7 Sources
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-white/40 block">
              Active Signals
            </span>
            <div className="font-ui font-semibold text-sm sm:text-base text-white">
              3 Active Signals
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-white/40 block">
              Average Freshness
            </span>
            <div className="font-ui font-semibold text-sm sm:text-base text-white">
              2d Freshness
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-white/40 block">
              Signal Confidence
            </span>
            <div className="font-ui font-semibold text-sm sm:text-base text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
              <span>High Confidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
