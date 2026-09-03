import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  RotateCw,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const ResearchCenter: React.FC = () => {
  const {
    evidence,
    researchRuns,
    opportunities,
    accounts,
    runResearchOnAccount,
    disputeEvidence,
    openOpportunityDetail,
    isAIWorking,
    aiWorkingMessage,
  } = useLeadForge();

  const [selectedOppForRun, setSelectedOppForRun] = useState(opportunities[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvidence = evidence.filter((evi) => {
    if (filterType === 'ALL') return true;
    return evi.claimType === filterType;
  });

  const claimTypes = ['ALL', 'HIRING', 'TECH_CHANGE', 'FUNDING', 'LEADERSHIP', 'CONTENT'];

  const handleLaunchRun = () => {
    if (!selectedOppForRun) return;
    runResearchOnAccount(selectedOppForRun);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Engine</span>
          </div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Live Research & Signal Discovery
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1 max-w-2xl">
            Surfaces verifiable facts from public sources, job boards, and technology fingerprints to eliminate generic sales outreach.
          </p>
        </div>
      </div>

      {/* Trigger Research Box */}
      <div className="rounded-3xl glass-panel p-6 border border-white/[0.1] space-y-4">
        <h2 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/70 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white/80" />
          Dispatch Autonomous Research Run
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedOppForRun}
            onChange={(e) => setSelectedOppForRun(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-ui text-white focus:outline-none"
          >
            {opportunities.map((opp) => {
              const acc = accounts.find((a) => a.id === opp.accountId);
              return (
                <option key={opp.id} value={opp.id} className="bg-neutral-900 text-white">
                  {acc?.name} ({acc?.domain})
                </option>
              );
            })}
          </select>

          <button
            onClick={handleLaunchRun}
            disabled={isAIWorking}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{isAIWorking ? 'Executing Intelligence Run...' : 'Execute Deep Research'}</span>
          </button>
        </div>

        {isAIWorking && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-ui text-white/80 flex items-center gap-2.5 animate-pulse">
            <RotateCw className="w-4 h-4 animate-spin text-white" />
            <span>{aiWorkingMessage || 'Querying external signals and synthesizing claims...'}</span>
          </div>
        )}
      </div>

      {/* Active & Recent Runs */}
      <div className="space-y-4">
        <h2 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/70">
          Recent Intelligence Runs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchRuns.map((run) => (
            <div key={run.id} className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-ui">
                <span className="font-semibold text-white">{run.accountName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                  {run.status}
                </span>
              </div>
              <p className="text-xs font-ui text-white/60 font-light">
                {run.currentStep}
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${run.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 font-mono">
                <span>Findings: {run.findingsCount}</span>
                <span>{run.completedAt || run.startedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Evidence Database */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-ui font-semibold text-base text-white">
              Signal Registry ({evidence.length})
            </h2>
            <p className="text-xs font-ui text-white/50">
              Verified ground-truth facts across all monitored prospect companies.
            </p>
          </div>

          {/* Filter Types */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {claimTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-xs font-ui transition-all ${
                  filterType === t
                    ? 'glass-pill-active text-white'
                    : 'glass-pill text-white/50 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((evi) => {
            const opp = opportunities.find((o) => o.id === evi.opportunityId);
            const acc = accounts.find((a) => a.id === evi.accountId);

            return (
              <div
                key={evi.id}
                className={`p-5 rounded-2xl glass-panel border flex flex-col justify-between space-y-3 transition-all ${
                  evi.isDisputed ? 'border-red-500/40 bg-red-500/[0.02]' : 'border-white/[0.08]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-white/50 uppercase">{evi.claimType}</span>
                    <span className="text-white/40 font-mono">
                      {(evi.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <div className="font-ui text-xs font-medium text-white/90">
                    {evi.claim}
                  </div>

                  <div className="text-[11px] font-ui text-white/50 line-clamp-2">
                    {evi.whyItMatters}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/40 font-ui">
                  <span
                    onClick={() => opp && openOpportunityDetail(opp.id)}
                    className="text-white/70 hover:underline cursor-pointer truncate max-w-[120px]"
                  >
                    {acc?.name}
                  </span>

                  <button
                    onClick={() => disputeEvidence(evi.id)}
                    className={`hover:underline ${evi.isDisputed ? 'text-red-400' : 'text-white/40 hover:text-white'}`}
                  >
                    {evi.isDisputed ? 'Disputed' : 'Flag / Dispute'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
