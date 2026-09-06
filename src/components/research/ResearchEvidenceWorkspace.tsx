import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadForge } from '../../context/LeadForgeContext';
import { ResearchTopContextBar } from './ResearchTopContextBar';
import { ResearchPageHeader } from './ResearchPageHeader';
import { ResearchSummaryCard } from './ResearchSummaryCard';
import { SignalSummaryGrid } from './SignalSummaryGrid';
import { EvidenceTimelineView } from './EvidenceTimelineView';
import { SourcePanel } from './SourcePanel';
import { AIInterpretationPanel } from './AIInterpretationPanel';
import { ResearchHistorySection } from './ResearchHistorySection';
import { SourceCoverageModal } from './SourceCoverageModal';
import { AlertTriangle, RefreshCw, Eye, Sparkles } from 'lucide-react';

export const ResearchEvidenceWorkspace: React.FC = () => {
  const {
    opportunities,
    accounts,
    evidence,
    selectedOpportunityId,
    setSelectedOpportunityId,
    setOpportunitySubView,
    updateOpportunityScore,
    disputeEvidence,
    openOpportunityDetail,
  } = useLeadForge();

  // Find active opportunity & account (defaulting to opp-01 / Acme SaaS if none selected)
  const activeOpp =
    opportunities.find((o) => o.id === selectedOpportunityId) ||
    opportunities[0];

  const activeAccount =
    accounts.find((a) => a.id === activeOpp?.accountId) ||
    accounts[0];

  // Evidence items specifically for this opportunity / account
  const accountEvidence = evidence.filter(
    (e) => e.opportunityId === activeOpp?.id || e.accountId === activeAccount?.id
  );

  // States for interactive testing/toggles
  const [workspaceState, setWorkspaceState] = useState<'COMPLETE' | 'PARTIAL' | 'EMPTY' | 'ERROR'>('COMPLETE');
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Handle score update on refresh
  const handleRefreshComplete = (newScore: number) => {
    if (activeOpp) {
      updateOpportunityScore(activeOpp.id, {
        ...activeOpp.scoreBreakdown,
        evidenceQuality: Math.min(100, activeOpp.scoreBreakdown.evidenceQuality + 4),
      });
    }
  };

  const handleReturnToOpportunities = () => {
    setSelectedOpportunityId(null);
  };

  const handleReturnToDossier = () => {
    setOpportunitySubView('dossier');
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)', y: 14 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-ui text-white"
    >
      {/* 3. Top Context Bar */}
      <ResearchTopContextBar
        account={activeAccount}
        opportunity={activeOpp}
        onBackToOpportunities={handleReturnToOpportunities}
        onBackToDossier={handleReturnToDossier}
        freshnessText="Updated 2h ago"
        statusText={workspaceState === 'PARTIAL' ? 'Research in progress' : 'Research complete'}
      />

      {/* 4. Page Header */}
      <ResearchPageHeader
        kicker="ACCOUNT RESEARCH"
        headline="What did we find?"
        supportingCopy="LeadForge reviewed the available company, market, hiring, product, and activity signals to understand whether this account deserves attention."
      />

      {/* State Switcher Tool (Discreet development/testing strip to view Empty, Partial, Error, and Complete states) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl liquid-glass border border-white/[0.06] text-xs text-white/50 font-mono">
        <span className="text-[10px] uppercase tracking-wider pl-1">
          Intelligence Mode:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWorkspaceState('COMPLETE')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              workspaceState === 'COMPLETE'
                ? 'bg-white text-black font-semibold'
                : 'hover:text-white'
            }`}
          >
            Complete (Default)
          </button>
          <button
            onClick={() => setWorkspaceState('PARTIAL')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              workspaceState === 'PARTIAL'
                ? 'bg-white text-black font-semibold'
                : 'hover:text-white'
            }`}
          >
            Partial (4/7)
          </button>
          <button
            onClick={() => setWorkspaceState('EMPTY')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              workspaceState === 'EMPTY'
                ? 'bg-white text-black font-semibold'
                : 'hover:text-white'
            }`}
          >
            Empty Signals
          </button>
          <button
            onClick={() => setWorkspaceState('ERROR')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              workspaceState === 'ERROR'
                ? 'bg-red-500/20 text-red-300 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Refresh Error
          </button>
        </div>
      </div>

      {/* 27. Error State Banner (If state === ERROR) */}
      {workspaceState === 'ERROR' && (
        <div className="p-5 rounded-2xl liquid-glass border border-red-500/30 bg-red-500/[0.03] space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Research couldn&apos;t be refreshed.</span>
          </div>
          <p className="text-xs text-white/70 font-light">
            Your previous evidence is still available. Network synchronization timed out while checking latest external career boards.
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs">
            <button
              onClick={() => setWorkspaceState('COMPLETE')}
              className="px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => setWorkspaceState('COMPLETE')}
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Continue with current evidence
            </button>
          </div>
        </div>
      )}

      {/* 26. Partial Research State Banner (If state === PARTIAL) */}
      {workspaceState === 'PARTIAL' && (
        <div className="p-5 rounded-2xl liquid-glass border border-amber-500/30 bg-amber-500/[0.03] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-300 text-sm">
              Research is still underway.
            </span>
            <span className="font-mono text-amber-300/80 bg-amber-400/10 px-2.5 py-0.5 rounded-full text-[11px]">
              4 / 7 sources reviewed
            </span>
          </div>
          <p className="text-xs text-white/70 font-light">
            LeadForge has reviewed 4 sources so far and is continuing to look for meaningful signals across external registries and news syndicates.
          </p>
        </div>
      )}

      {/* 25. Empty State (If state === EMPTY) */}
      {workspaceState === 'EMPTY' ? (
        <div className="p-12 rounded-2xl liquid-glass border border-white/10 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center mx-auto text-white/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            No strong signals found yet.
          </h3>
          <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            LeadForge hasn&apos;t found enough current evidence to confidently prioritize this account.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setWorkspaceState('COMPLETE')}
              className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors cursor-pointer"
            >
              Run deeper research
            </button>
            <button
              onClick={() => handleReturnToOpportunities()}
              className="px-4 py-2 rounded-full liquid-glass border border-white/15 text-white/80 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Keep monitoring
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 5 & 6. Research Summary Card */}
          <ResearchSummaryCard
            account={activeAccount}
            opportunity={activeOpp}
            onRefreshComplete={handleRefreshComplete}
            onReviewChanges={() => {
              // Smoothly navigate or highlight next step
              handleReturnToDossier();
            }}
          />

          {/* 7. Signal Summary Grid */}
          <SignalSummaryGrid
            onSelectSignal={(type) => {
              setActiveFilter(type);
            }}
          />

          {/* 8. Main Two-Column Layout (65% Main Evidence / 35% Source + AI Rail) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main column: 65% on Desktop (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-8 order-1">
              <EvidenceTimelineView
                evidenceItems={accountEvidence}
                onDisputeEvidence={disputeEvidence}
                selectedFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* Right rail: 35% on Desktop (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6 order-2">
              {/* 22. AI Interpretation Panel */}
              <AIInterpretationPanel
                onViewNextAction={() => {
                  handleReturnToDossier();
                }}
              />

              {/* 14 & 15. Source Panel */}
              <SourcePanel
                onOpenCoverageModal={() => setCoverageModalOpen(true)}
              />
            </div>
          </div>

          {/* 24. Research History Audit Log (Bottom) */}
          <ResearchHistorySection />
        </>
      )}

      {/* 15. Source Coverage Breakdown Modal */}
      <SourceCoverageModal
        isOpen={coverageModalOpen}
        onClose={() => setCoverageModalOpen(false)}
        account={activeAccount}
      />
    </motion.div>
  );
};
