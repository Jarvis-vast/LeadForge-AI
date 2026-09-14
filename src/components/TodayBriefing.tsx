import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadForge } from '../context/LeadForgeContext';
import { EvidenceCard } from './EvidenceCard';
import {
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Rocket,
  TrendingUp,
  Clock,
  Layers,
  UploadCloud,
  Kanban,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';

export const TodayBriefing: React.FC = () => {
  const {
    opportunities,
    accounts,
    tasks,
    evidence,
    openOpportunityDetail,
    setSelectedOpportunityId,
    setOutreachModalOpen,
    setImportModalOpen,
    setActiveTab,
    isAIWorking,
    enterFocusMode,
    researchTargetAccount,
  } = useLeadForge();

  // State to preview First-Use Variant vs Active Operational Briefing
  const [showFirstUseVariant, setShowFirstUseVariant] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('AI READY');

  const handleOpenOpportunity = (oppId: string) => {
    setSelectedOpportunityId(oppId);
    openOpportunityDetail(oppId);
  };

  const handleFollowUpAction = (oppId: string) => {
    setSelectedOpportunityId(oppId);
    setOutreachModalOpen(true);
  };

  const handleFindOpportunities = async () => {
    setAiStatusMessage('Researching accounts...');
    try {
      const targetId = opportunities[0]?.id || accounts[0]?.id || 'acc-01';
      if (typeof researchTargetAccount === 'function') {
        await researchTargetAccount(targetId);
      }
      setAiStatusMessage('AI READY');
      setShowFirstUseVariant(false);
    } catch (err) {
      console.warn('Find opportunities failed:', err);
      setAiStatusMessage('AI READY');
    }
  };

  // Dynamic metrics computed from real state (BUG-10)
  const activeCount = opportunities.length;
  const highPriorityCount = opportunities.filter((o) => o.score >= 85).length;
  const dueTasks = tasks.filter((t) => t.status === 'DUE');
  const followUpsCount = dueTasks.length > 0 ? dueTasks.length : opportunities.filter((o) => o.stage === 'FOLLOW_UP_DUE').length;
  const newSignalsCount = evidence.filter((e) => !e.isDisputed).length;
  const needAttentionCount = Math.max(1, opportunities.filter((o) => o.score >= 80 || o.stage === 'FOLLOW_UP_DUE').length);

  // Top opportunity recommendation
  const sortedOpps = [...opportunities].sort((a, b) => b.score - a.score);
  const topOpp = sortedOpps[0] || null;
  const topAcc = topOpp ? accounts.find((a) => a.id === topOpp.accountId) : null;
  const topEvidence = topOpp ? evidence.filter((e) => e.opportunityId === topOpp.id) : [];

  // Structured Opportunities for the Operator Queue (Dynamic)
  const primaryOpportunities = sortedOpps.slice(0, 4).map((opp, idx) => {
    const acc = accounts.find((a) => a.id === opp.accountId);
    const oppEvi = evidence.filter((e) => e.opportunityId === opp.id);
    const latestEvi = oppEvi[0];
    return {
      index: String(idx + 1).padStart(2, '0'),
      id: opp.id,
      name: acc?.name || 'Target Account',
      domain: acc?.domain || 'domain.com',
      industry: acc?.industry || 'B2B Tech',
      score: opp.score,
      priorityLabel: opp.score >= 85 ? 'HIGH PRIORITY' : opp.score >= 75 ? 'QUALIFIED' : 'EXPLORING',
      signal: latestEvi?.claim || opp.whyNow || 'High buying intent detected',
      signalTiming: latestEvi?.observedAt || 'Recently',
      whyItMatters: opp.whyNow || latestEvi?.whyItMatters || 'Aligned with your target ICP profile with active operational growth signals.',
      recommendedAction: opp.nextAction?.actionText || (opp.stage === 'FOLLOW_UP_DUE' ? 'Send follow-up message' : 'Review opportunity & send outreach'),
      actionType: opp.stage === 'FOLLOW_UP_DUE' ? 'follow_up' : 'open',
    };
  });

  // Follow-ups from real state
  const followUpItems = (dueTasks.length > 0 ? dueTasks.slice(0, 3) : tasks.slice(0, 3)).map((item) => ({
    id: item.id,
    oppId: item.opportunityId,
    company: item.accountName || 'Account',
    subject: item.title,
    time: item.dueAt || 'Today',
    actionLabel: 'Review →',
    action: () => handleOpenOpportunity(item.opportunityId),
  }));

  // Helper for signal category icons
  const getSignalIcon = (claimType: string) => {
    switch (claimType) {
      case 'HIRING':
        return <Users className="w-3.5 h-3.5 text-white/70" />;
      case 'PRODUCT_LAUNCH':
        return <Rocket className="w-3.5 h-3.5 text-white/70" />;
      case 'FUNDING':
        return <TrendingUp className="w-3.5 h-3.5 text-white/70" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-white/70" />;
    }
  };

  // Recent Signals from real evidence state
  const recentSignals = evidence.slice(0, 4).map((ev) => {
    const acc = accounts.find((a) => a.id === ev.accountId);
    return {
      id: ev.id,
      category: ev.claimType.replace('_', ' '),
      icon: getSignalIcon(ev.claimType),
      company: acc?.name || 'Account',
      claim: ev.claim,
      timeAgo: ev.observedAt || 'Recent',
    };
  });

  // If user toggles or opportunities empty: Render Section 15 First-Use Variant
  if (showFirstUseVariant) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto py-6">
        {/* State Switcher Pill */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowFirstUseVariant(false)}
            className="text-xs font-ui text-white/50 hover:text-white flex items-center gap-1.5 glass-pill px-3 py-1 rounded-full transition-all"
          >
            <span>View active briefing state</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Section 15: First-Use Onboarding Continuation Screen */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl liquid-glass-strong border border-white/[0.12] p-8 sm:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-white/70 text-xs font-ui font-medium">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>ICP Approved & Active</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="font-editorial italic text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.05]">
              Your sales intelligence is ready.
            </h1>
            <p className="font-ui font-light text-base sm:text-lg text-white/60 leading-relaxed">
              LeadForge has your ICP. The next step is finding companies that match it.
            </p>
          </div>

          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              onClick={handleFindOpportunities}
              disabled={isAIWorking}
              className="px-8 py-4 rounded-full bg-white text-black font-ui font-medium text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center gap-2.5 shadow-2xl shadow-white/20"
            >
              <span>Find my first opportunities →</span>
            </button>

            <div className="text-xs font-ui text-white/40 tracking-wide font-light flex items-center gap-2">
              <span>LeadForge will</span>
              <span className="font-medium text-white/70">research → rank → explain → recommend</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Screen 04: AI Sales Intelligence Briefing
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 4. GREETING / BRIEFING HEADER */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6"
      >
        <div className="space-y-1.5">
          {/* Small kicker: THURSDAY · SEPTEMBER 3 */}
          <div className="text-xs font-ui font-medium tracking-widest uppercase text-white/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>THURSDAY · SEPTEMBER 3</span>
          </div>

          {/* Large heading: Good evening, Alex. */}
          <h1 className="font-editorial italic text-4xl sm:text-5xl lg:text-[56px] text-white font-normal tracking-tight leading-[1.05]">
            Good evening, Alex.
          </h1>

          {/* Subheading: Here’s what deserves your attention. */}
          <p className="font-ui font-light text-base text-white/60 leading-relaxed pt-0.5">
            Here’s what deserves your attention.
          </p>
        </div>

        {/* State Toggle & Focus Launcher */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-end">
          <button
            onClick={() => setShowFirstUseVariant(true)}
            className="text-[11px] font-ui text-white/50 hover:text-white px-3 py-1.5 rounded-full glass-pill transition-all"
            title="Preview First-Use empty continuation state"
          >
            First-use view
          </button>

          <button
            onClick={() => enterFocusMode('opp-01')}
            className="px-4 py-2 rounded-full glass-pill hover:bg-white/[0.1] text-white text-xs font-ui font-medium transition-all flex items-center gap-1.5 luminous-edge"
            title="Enter distraction-free Focus Sprint (F)"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Focus Mode</span>
          </button>
        </div>
      </motion.div>

      {/* 5. AI BRIEFING CARD (Hero Element) */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        id="leadforge-briefing-card"
        className="rounded-3xl liquid-glass-strong border border-white/[0.12] p-7 sm:p-8 space-y-7 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Subtle luminous accent bar */}
        <div className="absolute -top-24 left-1/4 w-96 h-32 bg-white/[0.04] blur-3xl rounded-full pointer-events-none" />

        {/* Briefing Top Row: Kicker & Status Pill */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs font-ui uppercase tracking-widest text-white/50 font-medium">
            LEADFORGE BRIEFING
          </div>

          {/* 16. AI STATUS PILL */}
          <div
            onClick={() => {
              setAiStatusMessage(
                aiStatusMessage === 'AI READY' ? 'Researching 12 accounts' : 'AI READY'
              );
            }}
            className="px-3 py-1 rounded-full glass-pill border border-white/10 text-white/80 text-xs font-ui font-medium flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all select-none"
            title="AI operational status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                aiStatusMessage === 'AI READY'
                  ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                  : 'bg-white animate-ping'
              }`}
            />
            <span>{aiStatusMessage}</span>
          </div>
        </div>

        {/* Main Briefing Statement */}
        <div className="space-y-2">
          <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-[44px] text-white font-normal leading-[1.1] tracking-tight">
            {needAttentionCount} {needAttentionCount === 1 ? 'opportunity needs' : 'opportunities need'} attention today.
          </h2>
          <p className="font-ui text-white/70 text-sm sm:text-base font-light">
            {highPriorityCount} {highPriorityCount === 1 ? 'is' : 'are'} high-priority, {followUpsCount} need follow-up, and {newSignalsCount} verified signals.
          </p>
        </div>

        {/* 6. AI RECOMMENDATION AREA */}
        {topOpp && (
          <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.12] p-5 sm:p-6 transition-all space-y-4">
            <div className="text-[11px] font-ui uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white/70" />
              <span>YOUR NEXT MOVE</span>
            </div>

            <p className="font-ui text-sm sm:text-base text-white/95 leading-relaxed font-normal">
              Start with <span className="font-medium text-white underline decoration-white/30 underline-offset-4">{topAcc?.name || 'Top Opportunity'}</span>. {topOpp.whyNow}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3 text-xs font-ui text-white/60">
                <span className="font-medium text-white">Opportunity score {topOpp.score}</span>
                <span>·</span>
                <span className="text-white/70">{topOpp.confidence ? `${Math.round(topOpp.confidence * 100)}% confidence` : 'High confidence'}</span>
                {topEvidence[0] && (
                  <>
                    <span className="hidden md:inline">·</span>
                    <span className="hidden md:inline text-white/40">{topEvidence[0].observedAt}</span>
                  </>
                )}
              </div>

              <button
                onClick={() => handleOpenOpportunity(topOpp.id)}
                className="px-4 py-2 rounded-full bg-white text-black font-ui text-xs font-medium hover:bg-neutral-200 transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Open opportunity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 7. BRIEFING SUMMARY METRICS */}
        <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Metric 1: Opportunities Active */}
          <div className="space-y-1">
            <div className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
              {activeCount}
            </div>
            <div className="font-ui text-xs text-white/50 uppercase tracking-wider font-medium">
              Opportunities
            </div>
            <div className="font-ui text-xs text-white/40 font-light">
              Active
            </div>
          </div>

          {/* Metric 2: Today's actions Need attention */}
          <div className="space-y-1">
            <div className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
              {needAttentionCount}
            </div>
            <div className="font-ui text-xs text-white/50 uppercase tracking-wider font-medium">
              Today&apos;s actions
            </div>
            <div className="font-ui text-xs text-white/40 font-light">
              Need attention
            </div>
          </div>

          {/* Metric 3: High priority Score 85+ */}
          <div className="space-y-1">
            <div className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
              {highPriorityCount}
            </div>
            <div className="font-ui text-xs text-white/50 uppercase tracking-wider font-medium">
              High priority
            </div>
            <div className="font-ui text-xs text-white/40 font-light">
              Score 85+
            </div>
          </div>

          {/* Metric 4: Follow-ups Due today */}
          <div className="space-y-1">
            <div className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
              {followUpsCount}
            </div>
            <div className="font-ui text-xs text-white/50 uppercase tracking-wider font-medium">
              Follow-ups
            </div>
            <div className="font-ui text-xs text-white/40 font-light">
              Due today
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8. MAIN CONTENT GRID (Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: TODAY'S OPPORTUNITIES (60–65%) */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-7 xl:col-span-8 space-y-4"
        >
          {/* 9. TODAY'S OPPORTUNITIES HEADER */}
          <div className="flex items-end justify-between px-1 pb-1">
            <div className="space-y-1">
              <h2 className="font-editorial italic text-2xl sm:text-3xl text-white font-normal tracking-tight">
                Today&apos;s Opportunities
              </h2>
              <p className="font-ui font-light text-xs sm:text-sm text-white/60">
                Ranked by opportunity and urgency.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('opportunities')}
              className="text-xs font-ui text-white/60 hover:text-white flex items-center gap-1.5 transition-colors py-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 10 & 11. OPPORTUNITY CARDS */}
          <div className="space-y-4">
            {primaryOpportunities.map((opp, idx) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
                className="group rounded-2xl liquid-glass-strong border border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.04] p-5 sm:p-6 transition-all duration-200 shadow-md relative"
              >
                <div className="space-y-4">
                  {/* Row 1: Index, Company info & AI Score Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="font-ui text-xs font-mono text-white/30 pt-1 shrink-0">
                        {opp.index}
                      </span>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-ui font-semibold text-base sm:text-lg text-white group-hover:text-white transition-colors">
                            {opp.name}
                          </h3>
                          <span className="text-xs font-ui text-white/40">
                            {opp.domain}
                          </span>
                          <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60">
                            {opp.industry}
                          </span>
                        </div>

                        {/* Verified Signal Pill */}
                        <div className="flex items-center gap-2 text-xs font-ui text-white/75">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-medium text-white/90">{opp.signal}</span>
                          <span className="text-white/40">· {opp.signalTiming}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Score Display */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
                          {opp.score}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">/100</span>
                      </div>
                      <div className="text-[9px] font-mono tracking-widest text-white/50 uppercase mt-0.5">
                        {opp.priorityLabel}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Why It Matters Callout */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-medium">
                      Why It Matters
                    </div>
                    <p className="font-ui text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                      {opp.whyItMatters}
                    </p>
                  </div>

                  {/* Row 3: Recommended Next Action & CTAs */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-ui">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Next Action:
                      </span>
                      <span className="font-medium text-white/90 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/10">
                        {opp.recommendedAction}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {opp.actionType === 'follow_up' ? (
                        <button
                          onClick={() => handleFollowUpAction(opp.id)}
                          className="px-4 py-2 rounded-full bg-white text-black font-ui text-xs font-semibold hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Follow-up</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollowUpAction(opp.id)}
                          className="px-4 py-2 rounded-full bg-white text-black font-ui text-xs font-semibold hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Outreach</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenOpportunity(opp.id)}
                        className="px-3.5 py-2 rounded-full glass-pill hover:bg-white/10 text-white font-ui text-xs font-medium transition-all flex items-center gap-1"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: STACK OF FOLLOW-UPS & RECENT SIGNALS (35–40%) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* 12. FOLLOW-UP CARD */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            id="follow-ups-card"
            className="rounded-3xl liquid-glass-subtle border border-white/[0.1] p-6 space-y-5 shadow-lg"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-ui font-medium text-base text-white">
                Follow-ups
              </h3>
              <span className="text-xs font-ui text-white/50 font-light">
                {followUpsCount} due
              </span>
            </div>

            <div className="space-y-3">
              {followUpItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-3.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-ui font-medium text-xs text-white">
                      {item.company}
                    </span>
                    <span className="text-[11px] font-ui text-white/40">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-xs font-ui text-white/70 font-light leading-relaxed">
                    {item.subject}
                  </p>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={item.action}
                      className="text-xs font-ui text-white/70 group-hover:text-white font-medium flex items-center gap-1 hover:underline underline-offset-2 transition-all"
                    >
                      <span>{item.actionLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 13. EVIDENCE SIGNALS (EVIDENCE CARDS) */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            id="recent-signals-card"
            className="rounded-3xl liquid-glass-subtle border border-white/[0.1] p-6 space-y-5 shadow-lg"
          >
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <h3 className="font-ui font-medium text-base text-white">
                  Evidence Cards
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {evidence.length} verified
                </span>
              </div>
              <p className="text-xs font-ui text-white/50 font-light">
                Live signals feeding AI scores and timing triggers
              </p>
            </div>

            <div className="space-y-3">
              {evidence.slice(0, 3).map((ev) => {
                const acc = accounts.find((a) => a.id === ev.accountId);
                return (
                  <EvidenceCard
                    key={ev.id}
                    evidence={ev}
                    companyName={acc?.name}
                    compact={true}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 14. QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        id="quick-actions-bar"
        className="rounded-2xl liquid-glass-subtle border border-white/[0.1] p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Action: Find opportunities → (white-filled pill treatment) */}
          <button
            onClick={handleFindOpportunities}
            disabled={isAIWorking}
            className="px-5 py-2.5 rounded-full bg-white text-black font-ui font-medium text-xs hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Find opportunities →</span>
          </button>

          {/* Secondary Action: Import leads */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/80 hover:text-white font-ui text-xs font-medium transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-3.5 h-3.5 text-white/70" />
            <span>Import leads</span>
          </button>

          {/* Secondary Action: Create outreach */}
          <button
            onClick={() => {
              setSelectedOpportunityId('opp-01');
              setOutreachModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/80 hover:text-white font-ui text-xs font-medium transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-white/70" />
            <span>Create outreach</span>
          </button>

          {/* Secondary Action: View pipeline */}
          <button
            onClick={() => setActiveTab('pipeline')}
            className="px-4 py-2.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/80 hover:text-white font-ui text-xs font-medium transition-all flex items-center gap-2"
          >
            <Kanban className="w-3.5 h-3.5 text-white/70" />
            <span>View pipeline</span>
          </button>
        </div>

        <div className="text-[11px] font-ui text-white/40 font-light hidden sm:block">
          Research refreshed today · {activeCount} {activeCount === 1 ? 'opportunity' : 'opportunities'} queued
        </div>
      </motion.div>
    </div>
  );
};
