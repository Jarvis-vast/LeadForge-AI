import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import { OpportunityStage } from '../types';
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  Send,
  Calendar,
  AlertCircle,
  Plus,
  CheckCircle,
  ChevronDown,
  Building,
  Mail,
  Linkedin,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const OpportunityDetail: React.FC = () => {
  const {
    selectedOpportunityId,
    setSelectedOpportunityId,
    setActiveTab,
    opportunities,
    accounts,
    contacts,
    evidence,
    activities,
    updateOpportunityStage,
    updateOpportunityScore,
    runResearchOnAccount,
    disputeEvidence,
    setOutreachModalOpen,
    addTask,
    isAIWorking,
    enterFocusMode,
  } = useLeadForge();

  const [activeZone, setActiveZone] = useState<'overview' | 'evidence' | 'timeline'>('overview');
  const [showScoreTuner, setShowScoreTuner] = useState(false);
  const [newNote, setNewNote] = useState('');

  const opp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];
  if (!opp) {
    return (
      <div className="p-8 text-center text-white/50 font-ui">
        No opportunity selected.
      </div>
    );
  }

  const account = accounts.find((a) => a.id === opp.accountId);
  const contact = contacts.find((c) => c.id === opp.primaryContactId);
  const oppEvidence = evidence.filter((e) => e.opportunityId === opp.id);
  const oppActivities = activities.filter((a) => a.opportunityId === opp.id);

  const stages: OpportunityStage[] = [
    'NEW',
    'RESEARCHING',
    'QUALIFIED',
    'PRIORITIZED',
    'READY',
    'OUTREACH_DRAFTED',
    'CONTACTED',
    'FOLLOW_UP_DUE',
    'REPLIED',
    'MEETING_BOOKED',
    'QUOTED',
    'WON',
  ];

  const handleScoreFactorChange = (factor: keyof typeof opp.scoreBreakdown, val: number) => {
    const nextBreakdown = {
      ...opp.scoreBreakdown,
      [factor]: val,
    };
    updateOpportunityScore(opp.id, nextBreakdown);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedOpportunityId(null);
            setActiveTab('opportunities');
          }}
          className="inline-flex items-center gap-2 text-xs font-ui text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => enterFocusMode(opp.id)}
            className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.16] text-white text-xs font-ui flex items-center gap-1.5 transition-all"
            title="Open Focus Mode for this opportunity"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Focus Sprint</span>
          </button>
          <button
            onClick={() => runResearchOnAccount(opp.id)}
            disabled={isAIWorking}
            className="px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-ui flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAIWorking ? 'animate-spin' : ''}`} />
            <span>Re-run AI Research</span>
          </button>
          <button
            onClick={() => setOutreachModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Outreach</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Header */}
      <div className="rounded-3xl glass-panel-elevated p-6 md:p-8 border border-white/[0.12] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 font-ui">
                Opportunity Dossier
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-ui text-white/60">
                Created {opp.createdAt.split('T')[0]}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-ui text-white/60">
                Last signal: {opp.lastResearchedAt}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-white font-normal">
                {account?.name}
              </h1>
              <a
                href={`https://${account?.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white text-xs font-ui inline-flex items-center gap-1 transition-colors"
              >
                <span>{account?.domain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="mt-2 text-sm text-white/70 font-ui font-light max-w-2xl">
              {account?.description}
            </p>
          </div>

          {/* Opportunity Score Gauge Card */}
          <div className="flex items-center gap-4 self-start lg:self-auto shrink-0 bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
            <div className="text-center pr-4 border-r border-white/10">
              <div className="font-editorial italic text-5xl text-white leading-none">
                {opp.score}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-white/50 font-ui font-semibold mt-1">
                Opp Score
              </div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">
                {(opp.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-ui text-white/60">
              <div className="flex justify-between gap-4">
                <span>ICP Fit:</span>
                <span className="text-white font-mono">{opp.scoreBreakdown.fit}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Need Signal:</span>
                <span className="text-white font-mono">{opp.scoreBreakdown.need}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Timing:</span>
                <span className="text-white font-mono">{opp.scoreBreakdown.timing}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Commercial:</span>
                <span className="text-white font-mono">{opp.scoreBreakdown.commercial}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Stage Pills */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <span className="text-xs font-ui text-white/40 uppercase tracking-wider mr-1">
              Stage:
            </span>
            {stages.map((st) => {
              const isCurrent = opp.stage === st;
              return (
                <button
                  key={st}
                  onClick={() => updateOpportunityStage(opp.id, st)}
                  className={`text-[11px] font-ui px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowScoreTuner(!showScoreTuner)}
            className="text-xs font-ui text-white/50 hover:text-white underline underline-offset-4"
          >
            {showScoreTuner ? 'Hide Formula Tuner' : 'Tune Factor Weights'}
          </button>
        </div>

        {/* Interactive Formula Tuner */}
        {showScoreTuner && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="text-xs font-ui font-medium text-white/80 flex items-center justify-between">
              <span>Deterministic Scoring Engine Weights (Technical Arch #17)</span>
              <span className="font-mono text-[11px] text-white/50">
                Formula: 0.30·Fit + 0.25·Need + 0.20·Timing + 0.15·Val + 0.10·Qual
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-ui">
              <div>
                <label className="text-white/60 block mb-1">Fit ({opp.scoreBreakdown.fit})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opp.scoreBreakdown.fit}
                  onChange={(e) => handleScoreFactorChange('fit', Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Need ({opp.scoreBreakdown.need})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opp.scoreBreakdown.need}
                  onChange={(e) => handleScoreFactorChange('need', Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Timing ({opp.scoreBreakdown.timing})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opp.scoreBreakdown.timing}
                  onChange={(e) => handleScoreFactorChange('timing', Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Commercial ({opp.scoreBreakdown.commercial})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opp.scoreBreakdown.commercial}
                  onChange={(e) => handleScoreFactorChange('commercial', Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Evidence ({opp.scoreBreakdown.evidenceQuality})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opp.scoreBreakdown.evidenceQuality}
                  onChange={(e) => handleScoreFactorChange('evidenceQuality', Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Best Action Banner */}
      <div className="rounded-2xl glass-panel p-5 border border-white/[0.1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-white/10 text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-ui font-semibold uppercase tracking-wider text-white">
                Recommended Next Action
              </span>
              <span className="px-2 py-0.2 rounded-full bg-white/10 text-white/80 text-[10px] font-mono">
                {opp.nextAction.urgency}
              </span>
            </div>
            <p className="text-sm font-ui text-white/90 mt-1 font-medium">
              {opp.nextAction.actionText}
            </p>
            <p className="text-xs font-ui text-white/50 mt-0.5 font-light">
              Reason: {opp.nextAction.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setOutreachModalOpen(true)}
            className="px-4 py-2 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all flex items-center gap-1.5"
          >
            <span>Execute Action</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Three Zone Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveZone('overview')}
          className={`px-4 py-2 text-xs font-ui font-medium rounded-full transition-all ${
            activeZone === 'overview'
              ? 'glass-pill-active text-white'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Overview & Context
        </button>
        <button
          onClick={() => setActiveZone('evidence')}
          className={`px-4 py-2 text-xs font-ui font-medium rounded-full transition-all flex items-center gap-1.5 ${
            activeZone === 'evidence'
              ? 'glass-pill-active text-white'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span>Evidence & Signals</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">
            {oppEvidence.length}
          </span>
        </button>
        <button
          onClick={() => setActiveZone('timeline')}
          className={`px-4 py-2 text-xs font-ui font-medium rounded-full transition-all flex items-center gap-1.5 ${
            activeZone === 'timeline'
              ? 'glass-pill-active text-white'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span>Timeline & Activities</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">
            {oppActivities.length}
          </span>
        </button>
      </div>

      {/* Zone 1: Overview */}
      {activeZone === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Company Profile & Sourced Intelligence */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] space-y-4">
              <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                Account Specification
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-ui">
                <div>
                  <span className="text-white/40 block mb-0.5">Industry Vertical</span>
                  <span className="text-white font-medium">{account?.industry}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-0.5">Headcount & Scale</span>
                  <span className="text-white font-medium">{account?.size}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-0.5">Headquarters</span>
                  <span className="text-white font-medium">{account?.location}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-0.5">Ingestion Source</span>
                  <span className="text-white font-medium">{account?.source}</span>
                </div>
              </div>

              <div>
                <span className="text-white/40 text-xs font-ui block mb-1.5">Detected Tech Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {account?.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-ui text-white/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Why This Opportunity Ranks High card */}
            <div className="rounded-2xl glass-panel p-6 border border-white/[0.08]">
              <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white/60" />
                Intelligence Synthesis
              </h3>
              <p className="font-ui text-sm text-white/90 font-light leading-relaxed">
                {opp.whyNow}
              </p>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs font-ui text-white/50">
                Matches active ICP criteria on high engineering hiring signals, Series A capital injection, and previous conversion patterns.
              </div>
            </div>
          </div>

          {/* Right 5 cols: Decision Maker & Quick Follow-up scheduler */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Contact Card */}
            <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                  Target Decision Maker
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white">
                  Primary
                </span>
              </div>

              <div className="pt-1">
                <div className="font-ui font-semibold text-base text-white">{contact?.name}</div>
                <div className="text-xs font-ui text-white/60">{contact?.title}</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-ui">
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                  <a href={`mailto:${contact?.email}`} className="hover:text-white underline">
                    {contact?.email}
                  </a>
                </div>
                {contact?.linkedinUrl && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Linkedin className="w-3.5 h-3.5 text-white/40" />
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white hover:underline truncate"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Task Creation */}
            <div className="rounded-2xl glass-panel p-6 border border-white/[0.08]">
              <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80 mb-3">
                Schedule Follow-up Task
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Follow up on proposal)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40 font-ui">Due in 3 days</span>
                  <button
                    onClick={() => {
                      if (!newNote.trim()) return;
                      addTask({
                        opportunityId: opp.id,
                        accountName: account?.name || 'Account',
                        title: newNote,
                        dueAt: 'In 3 days',
                        status: 'DUE',
                        reason: 'Manually scheduled follow-up',
                        assignee: 'Alex (You)',
                      });
                      setNewNote('');
                    }}
                    className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone 2: Evidence Drawer */}
      {activeZone === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
                Verified Evidence Items ({oppEvidence.length})
              </h3>
              <p className="text-xs text-white/50 font-ui mt-0.5">
                All external AI claims are grounded in explicit source URLs and extraction timestamps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oppEvidence.map((evi) => (
              <div
                key={evi.id}
                className={`p-5 rounded-2xl glass-panel border transition-all ${
                  evi.isDisputed ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/10 text-white font-medium uppercase tracking-wider">
                    {evi.claimType} SIGNAL
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    {(evi.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <p className="font-ui text-sm text-white font-medium mb-3">
                  {evi.claim}
                </p>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-ui mb-3">
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider mb-0.5">
                    Why it matters:
                  </span>
                  <span className="text-white/80 font-light">{evi.whyItMatters}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/40 font-ui pt-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <ExternalLink className="w-3 h-3 text-white/30 shrink-0" />
                    <a
                      href={evi.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white truncate"
                    >
                      {evi.sourceDomain}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span>{evi.observedAt}</span>
                    <button
                      onClick={() => disputeEvidence(evi.id)}
                      className={`text-[10px] hover:underline ${
                        evi.isDisputed ? 'text-red-400' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {evi.isDisputed ? 'Disputed (Flagged)' : 'Dispute claim'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone 3: Unified Timeline */}
      {activeZone === 'timeline' && (
        <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-white/80">
              Complete Opportunity History
            </h3>
            <span className="text-xs text-white/40 font-ui">Append-only audit log</span>
          </div>

          <div className="relative pl-6 border-l border-white/10 space-y-6">
            {oppActivities.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-white/20 border border-white/40 group-hover:bg-white transition-colors" />
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-xs font-ui font-medium text-white">
                    {act.type.replace(/_/g, ' ')}
                  </div>
                  <span className="text-[11px] font-mono text-white/40">
                    {act.happenedAt}
                  </span>
                </div>
                <p className="text-xs font-ui text-white/70 mt-1 font-light">
                  {act.description}
                </p>
                <span className="text-[10px] font-ui text-white/40 mt-1 block">
                  By {act.actorName} ({act.actorType})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
