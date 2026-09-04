import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadForge } from '../context/LeadForgeContext';
import { Opportunity } from '../types';
import {
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Calendar,
  Layers,
  Archive,
  Download,
  CheckCircle2,
  Users,
  Building2,
  CheckSquare,
  Square,
  HelpCircle,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

export type OpportunityFilter =
  | 'all'
  | 'high_priority'
  | 'new_signals'
  | 'follow_up'
  | 'uncontacted'
  | 'contacted'
  | 'research_fresh';

export type OpportunitySort =
  | 'recommendation'
  | 'score'
  | 'recent_signal'
  | 'urgency'
  | 'recently_added';

export const OpportunityList: React.FC = () => {
  const {
    opportunities,
    accounts,
    contacts,
    evidence,
    activities,
    openOpportunityDetail,
    setSelectedOpportunityId,
    setOutreachModalOpen,
    setActiveTab,
    isAIWorking,
    enterFocusMode,
  } = useLeadForge();

  // Filter and Sort states
  const [activeFilter, setActiveFilter] = useState<OpportunityFilter>('all');
  const [activeSort, setActiveSort] = useState<OpportunitySort>('recommendation');
  const [searchQuery, setSearchQuery] = useState('');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Card interaction states
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [undoNotice, setUndoNotice] = useState<{ id: string; name: string; reason: string } | null>(null);

  // State Previews & Intelligence Refresh simulation
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [refreshStep, setRefreshStep] = useState<number>(0);
  const [refreshResultBanner, setRefreshResultBanner] = useState<string | null>(null);

  // Toggle card expansion
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  // Bulk selection toggles
  const toggleSelectCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === visibleOpportunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleOpportunities.map((o) => o.id));
    }
  };

  // Primary action trigger
  const handlePrimaryAction = (opp: Opportunity, actionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOpportunityId(opp.id);
    if (actionType.toLowerCase().includes('contact') || actionType.toLowerCase().includes('outreach')) {
      setOutreachModalOpen(true);
    } else if (actionType.toLowerCase().includes('follow')) {
      setOutreachModalOpen(true);
    } else {
      openOpportunityDetail(opp.id);
    }
  };

  // Dismiss / Not now handlers
  const handleOpenDismissMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissingId((prev) => (prev === id ? null : id));
  };

  const confirmDismiss = (oppId: string, reason: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    const acc = accounts.find((a) => a.id === opp?.accountId);
    setDismissedIds((prev) => [...prev, oppId]);
    setDismissingId(null);
    setSelectedIds((prev) => prev.filter((id) => id !== oppId));
    setUndoNotice({
      id: oppId,
      name: acc?.name || 'Account',
      reason,
    });
    setTimeout(() => {
      setUndoNotice((curr) => (curr?.id === oppId ? null : curr));
    }, 6000);
  };

  const undoDismiss = (oppId: string) => {
    setDismissedIds((prev) => prev.filter((id) => id !== oppId));
    setUndoNotice(null);
  };

  // Intelligence Refresh execution (Staged feedback)
  const handleRefreshIntelligence = () => {
    setViewState('loading');
    setRefreshStep(1);
    setRefreshResultBanner(null);

    setTimeout(() => setRefreshStep(2), 700);
    setTimeout(() => setRefreshStep(3), 1400);
    setTimeout(() => setRefreshStep(4), 2100);
    setTimeout(() => {
      setViewState('normal');
      setRefreshStep(0);
      setRefreshResultBanner('12 accounts reviewed · 3 new signals found · 2 opportunities reprioritized');
      setTimeout(() => setRefreshResultBanner(null), 7000);
    }, 2800);
  };

  // Enriched opportunities with canonical presentation metadata
  const enrichedOpportunities = useMemo(() => {
    return opportunities.map((opp) => {
      const acc = accounts.find((a) => a.id === opp.accountId);
      const cnt = contacts.find((c) => c.id === opp.primaryContactId);
      const oppEvidence = evidence.filter((e) => e.opportunityId === opp.id);
      const oppActivities = activities.filter((a) => a.opportunityId === opp.id);

      // Default values
      let companyDescriptor = acc ? `${acc.industry} · ${acc.domain}` : 'B2B Software';
      let priorityLabel = 'QUALIFIED';
      let whyNowHeadline = opp.whyNow;
      let signalFreshness = '2 days ago';
      let aiRecommendation = opp.nextAction.actionText;
      let primaryActionLabel = 'Open opportunity →';
      let secondaryActionLabel: string | null = null;
      let evidenceChips: string[] = ['ICP match', 'Signal surge'];
      let confidenceLevel: 'High confidence' | 'Medium confidence' =
        opp.confidence >= 0.88 ? 'High confidence' : 'Medium confidence';
      let opportunityState: 'New' | 'High priority' | 'Needs follow-up' | 'Watching' | 'Dismissed' = 'New';

      // Precise canonical mappings for specified cards
      if (opp.id === 'opp-01') {
        companyDescriptor = 'B2B SaaS · acme.io';
        priorityLabel = 'HIGH PRIORITY';
        opportunityState = 'High priority';
        whyNowHeadline = 'Recently hired a VP of Marketing and launched a new product.';
        signalFreshness = '2 days ago';
        aiRecommendation = 'Contact the founder with a product-growth angle.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Contact';
        evidenceChips = ['Hiring signal', 'Product launch', 'ICP match'];
        confidenceLevel = 'High confidence';
      } else if (opp.id === 'opp-02') {
        companyDescriptor = 'B2B software · novasystems.com';
        priorityLabel = 'HIGH PRIORITY';
        opportunityState = 'High priority';
        whyNowHeadline = 'Launched an enterprise product and expanded into the US market.';
        signalFreshness = '4 days ago';
        aiRecommendation = 'Follow up on your previous conversation.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Follow up';
        evidenceChips = ['Enterprise launch', 'Market expansion', 'Executive touch'];
        confidenceLevel = 'High confidence';
      } else if (opp.id === 'opp-03') {
        companyDescriptor = 'Technology services · orbitlabs.co';
        priorityLabel = 'GOOD FIT';
        opportunityState = 'Needs follow-up';
        whyNowHeadline = 'Added four sales roles and is expanding its commercial team.';
        signalFreshness = '6 days ago';
        aiRecommendation = 'Research their current growth stack before outreach.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Research';
        evidenceChips = ['Sales expansion', 'Commercial team', 'Funding round'];
        confidenceLevel = 'Medium confidence';
      } else if (opp.id === 'opp-07') {
        companyDescriptor = 'Marketing agency · northstar.digital';
        priorityLabel = 'WATCH';
        opportunityState = 'Watching';
        whyNowHeadline = 'Increased hiring activity but no direct buying signal yet.';
        signalFreshness = '8 days ago';
        aiRecommendation = 'Monitor for a stronger trigger before contacting.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = null; // Spec: Only Open opportunity →. LeadForge does not always recommend outreach!
        evidenceChips = ['Hiring activity', 'Growth trend', 'Unconfirmed intent'];
        confidenceLevel = 'High confidence';
      } else if (opp.id === 'opp-06') {
        companyDescriptor = 'AI Automation & Agents · hyperflow.ai';
        priorityLabel = 'HIGH PRIORITY';
        opportunityState = 'High priority';
        whyNowHeadline = 'ProductHunt launch drove 8x traffic spike; document processing backlogged.';
        signalFreshness = '3 days ago';
        aiRecommendation = 'Inspect evidence dossier and pitch high-concurrency queue reliability.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Research';
        evidenceChips = ['Traffic spike', 'Agent reliability', 'Fast track'];
        confidenceLevel = 'High confidence';
      } else if (opp.id === 'opp-04') {
        companyDescriptor = 'HealthTech · kovahealth.com';
        priorityLabel = 'NEEDS FOLLOW-UP';
        opportunityState = 'Needs follow-up';
        whyNowHeadline = 'Announced 4 clinical network expansions; FHIR data integration quadrupled.';
        signalFreshness = '2 days ago';
        aiRecommendation = 'Check for reply on HIPAA sync audit proposal sent on Monday.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Follow up';
        evidenceChips = ['Regional expansion', 'FHIR integration', 'Follow up'];
        confidenceLevel = 'High confidence';
      } else if (opp.id === 'opp-05') {
        companyDescriptor = 'B2B Logistics · luminacommerce.io';
        priorityLabel = 'QUALIFIED';
        opportunityState = 'New';
        whyNowHeadline = 'Logistics Software Architect role vacant for 42 days; warehouse automation delayed.';
        signalFreshness = 'Yesterday';
        aiRecommendation = 'Verify VP Operations direct email and propose external engineering capacity.';
        primaryActionLabel = 'Open opportunity →';
        secondaryActionLabel = 'Research';
        evidenceChips = ['Stalled role', 'Supply chain', 'New lead'];
        confidenceLevel = 'Medium confidence';
      }

      if (dismissedIds.includes(opp.id)) {
        opportunityState = 'Dismissed';
      }

      return {
        ...opp,
        account: acc,
        contact: cnt,
        evidenceItems: oppEvidence,
        activityList: oppActivities,
        companyDescriptor,
        priorityLabel,
        opportunityState,
        whyNowHeadline,
        signalFreshness,
        aiRecommendation,
        primaryActionLabel,
        secondaryActionLabel,
        evidenceChips,
        confidenceLevel,
      };
    });
  }, [opportunities, accounts, contacts, evidence, activities, dismissedIds]);

  // Filtered & Sorted opportunities
  const visibleOpportunities = useMemo(() => {
    let result = enrichedOpportunities.filter((opp) => !dismissedIds.includes(opp.id));

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.account?.name.toLowerCase().includes(q) ||
          o.account?.domain.toLowerCase().includes(q) ||
          o.whyNowHeadline.toLowerCase().includes(q) ||
          o.aiRecommendation.toLowerCase().includes(q) ||
          o.contact?.name.toLowerCase().includes(q)
      );
    }

    // Filter bar
    if (activeFilter === 'high_priority') {
      result = result.filter((o) => o.score >= 85 || o.priorityLabel.includes('HIGH'));
    } else if (activeFilter === 'new_signals') {
      result = result.filter((o) => o.signalFreshness.includes('Yesterday') || o.signalFreshness.includes('2 days'));
    } else if (activeFilter === 'follow_up') {
      result = result.filter((o) => o.secondaryActionLabel === 'Follow up' || o.stage === 'FOLLOW_UP_DUE');
    } else if (activeFilter === 'uncontacted') {
      result = result.filter((o) => o.stage === 'PRIORITIZED' || o.stage === 'READY' || o.stage === 'NEW');
    } else if (activeFilter === 'contacted') {
      result = result.filter((o) => o.stage === 'CONTACTED' || o.stage === 'FOLLOW_UP_DUE');
    } else if (activeFilter === 'research_fresh') {
      result = result.filter((o) => o.lastResearchedAt.includes('hour') || o.lastResearchedAt.includes('day'));
    }

    // Min score slider
    if (minScoreFilter > 0) {
      result = result.filter((o) => o.score >= minScoreFilter);
    }

    // Sorting
    return result.sort((a, b) => {
      if (activeSort === 'score') {
        return b.score - a.score;
      }
      if (activeSort === 'recent_signal') {
        return a.signalFreshness.localeCompare(b.signalFreshness);
      }
      if (activeSort === 'urgency') {
        const urgencyWeight = { IMMEDIATE: 3, TODAY: 2, THIS_WEEK: 1, NEXT_WEEK: 0 };
        return (urgencyWeight[b.nextAction.urgency] || 0) - (urgencyWeight[a.nextAction.urgency] || 0);
      }
      if (activeSort === 'recently_added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Default: 'recommendation' (LeadForge recommendation)
      return b.score - a.score;
    });
  }, [enrichedOpportunities, dismissedIds, searchQuery, activeFilter, activeSort, minScoreFilter]);

  // Bulk actions handlers
  const handleBulkDismiss = () => {
    setDismissedIds((prev) => [...prev, ...selectedIds]);
    setSelectedIds([]);
  };

  const handleBulkReviewed = () => {
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Company,Domain,Score,Priority,Why Now,Recommendation']
        .concat(
          selectedIds.map((id) => {
            const item = enrichedOpportunities.find((o) => o.id === id);
            return `"${item?.account?.name}","${item?.account?.domain}","${item?.score}","${item?.priorityLabel}","${item?.whyNowHeadline}","${item?.aiRecommendation}"`;
          })
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'leadforge_selected_opportunities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedIds([]);
  };

  // Section 24: Loading State UI
  if (viewState === 'loading') {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto py-12">
        <div className="rounded-3xl liquid-glass-strong border border-white/[0.12] p-8 sm:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-white/70 text-xs font-ui font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            <span>AI Intelligence Engine</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
              Building today&apos;s intelligence briefing
            </h2>
            <p className="font-ui font-light text-sm sm:text-base text-white/60 max-w-lg mx-auto">
              LeadForge is synthesizing recent signals, score regressions, and verified intent across all monitored accounts.
            </p>
          </div>

          {/* Staged States (Section 24 specification) */}
          <div className="max-w-md mx-auto space-y-3 text-left pt-2 font-ui text-xs">
            {[
              { step: 1, label: 'Reviewing recent signals' },
              { step: 2, label: 'Refreshing opportunity scores' },
              { step: 3, label: 'Prioritizing actions' },
              { step: 4, label: 'Preparing your queue' },
            ].map((st) => {
              const isPast = refreshStep > st.step;
              const isCurrent = refreshStep === st.step;
              return (
                <div
                  key={st.step}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-white/[0.08] border-white/20 text-white shadow-lg'
                      : isPast
                      ? 'bg-white/[0.03] border-white/[0.08] text-white/50'
                      : 'bg-white/[0.01] border-white/[0.04] text-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      isPast
                        ? 'bg-white text-black font-semibold'
                        : isCurrent
                        ? 'border border-white text-white animate-pulse'
                        : 'border border-white/20 text-white/30'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : st.step}
                  </div>
                  <span className="font-medium text-xs sm:text-sm">{st.label}</span>
                  {isCurrent && <span className="ml-auto text-white/40 text-[11px] animate-pulse">Running…</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Section 25: Error State UI
  if (viewState === 'error') {
    return (
      <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto py-12">
        <div className="rounded-3xl liquid-glass-strong border border-white/[0.12] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative">
          <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center mx-auto text-white">
            <AlertCircle className="w-6 h-6 text-white/80" />
          </div>

          <div className="space-y-2">
            <h2 className="font-editorial italic text-3xl sm:text-4xl text-white font-normal tracking-tight">
              Today&apos;s intelligence could not be refreshed.
            </h2>
            <p className="font-ui font-light text-sm sm:text-base text-white/60 max-w-md mx-auto">
              Your existing opportunities are still available. Try refreshing again.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefreshIntelligence}
              className="px-6 py-2.5 rounded-full bg-white text-black font-ui text-xs font-medium hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setViewState('normal')}
              className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white font-ui text-xs font-medium transition-all"
            >
              <span>Continue with current data</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Section 23: Empty State UI (When no opportunities need attention)
  if (viewState === 'empty' || visibleOpportunities.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto py-12">
        <div className="rounded-3xl liquid-glass-strong border border-white/[0.12] p-8 sm:p-14 text-center space-y-6 shadow-2xl relative">
          <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center mx-auto text-white">
            <ShieldCheck className="w-6 h-6 text-white/80" />
          </div>

          <div className="space-y-3">
            <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
              Nothing needs you right now.
            </h2>
            <p className="font-ui font-light text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
              LeadForge is monitoring your accounts and will surface an opportunity when the evidence is strong enough to matter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setViewState('normal');
                setDismissedIds([]);
              }}
              className="px-6 py-3 rounded-full bg-white text-black font-ui text-xs font-medium hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <span>Find more opportunities →</span>
            </button>
            <button
              onClick={() => setActiveTab('icp')}
              className="px-5 py-3 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white font-ui text-xs font-medium transition-all"
            >
              <span>Review your ICP</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 4. PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(7px)', y: 14 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        id="opportunities-page-header"
        className="space-y-2 border-b border-white/[0.08] pb-6"
      >
        {/* Small kicker: DAILY INTELLIGENCE */}
        <div className="text-xs font-ui font-medium tracking-widest uppercase text-white/50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>DAILY INTELLIGENCE</span>
        </div>

        {/* Main heading: Who needs your attention? (Desktop: 52-60px, Instrument Serif italic) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="font-editorial italic text-4xl sm:text-5xl lg:text-[56px] text-white font-normal tracking-tight leading-[1.05]">
            Who needs your attention?
          </h1>

          {/* Development / Testing Quick Mode Switcher */}
          <div className="flex items-center gap-2 text-[11px] font-ui text-white/40 shrink-0">
            <button
              onClick={handleRefreshIntelligence}
              className="px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white transition-all flex items-center gap-1.5"
              title="Trigger simulated intelligence refresh"
            >
              <RefreshCw className="w-3 h-3 text-white/60" />
              <span>Refresh intelligence</span>
            </button>
            <button
              onClick={() => setViewState(viewState === 'empty' ? 'normal' : 'empty')}
              className="px-2.5 py-1.5 rounded-full glass-pill text-white/40 hover:text-white transition-all"
              title="Toggle empty state preview"
            >
              Empty
            </button>
            <button
              onClick={() => setViewState(viewState === 'error' ? 'normal' : 'error')}
              className="px-2.5 py-1.5 rounded-full glass-pill text-white/40 hover:text-white transition-all"
              title="Toggle error state preview"
            >
              Error
            </button>
          </div>
        </div>

        {/* Supporting copy: Barlow Light, rgba(255,255,255,0.62) */}
        <p className="font-ui font-light text-sm sm:text-base text-white/60 max-w-3xl leading-relaxed pt-1">
          LeadForge ranked these opportunities using fit, timing, intent, recent signals, and your sales history.
        </p>
      </motion.div>

      {/* REFRESH RESULT BANNER (Section 21) */}
      <AnimatePresence>
        {refreshResultBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-2xl liquid-glass border border-white/[0.18] p-4 flex items-center justify-between text-xs font-ui text-white/90 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="font-medium">{refreshResultBanner}</span>
            </div>
            <button
              onClick={() => setRefreshResultBanner(null)}
              className="text-white/40 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. DAILY SUMMARY STRIP (Horizontal liquid-glass summary panel) */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(7px)', y: 14 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.28, delay: 0.05, ease: 'easeOut' }}
        id="daily-summary-strip"
        className="rounded-2xl liquid-glass-subtle border border-white/[0.1] p-5 overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center justify-between min-w-[580px] divide-x divide-white/[0.08]">
          {/* Stat 1: 14 Need attention */}
          <div
            onClick={() => setActiveFilter('all')}
            className="px-4 first:pl-2 cursor-pointer group"
          >
            <div className="font-editorial italic text-3xl sm:text-4xl text-white group-hover:text-white transition-colors leading-none">
              14
            </div>
            <div className="font-ui text-xs text-white/60 group-hover:text-white/90 transition-colors mt-1 font-normal">
              Need attention
            </div>
          </div>

          {/* Stat 2: 5 High priority */}
          <div
            onClick={() => setActiveFilter('high_priority')}
            className="px-4 cursor-pointer group"
          >
            <div className="font-editorial italic text-3xl sm:text-4xl text-white group-hover:text-white transition-colors leading-none">
              5
            </div>
            <div className="font-ui text-xs text-white/60 group-hover:text-white/90 transition-colors mt-1 font-normal">
              High priority
            </div>
          </div>

          {/* Stat 3: 4 Follow-ups */}
          <div
            onClick={() => setActiveFilter('follow_up')}
            className="px-4 cursor-pointer group"
          >
            <div className="font-editorial italic text-3xl sm:text-4xl text-white group-hover:text-white transition-colors leading-none">
              4
            </div>
            <div className="font-ui text-xs text-white/60 group-hover:text-white/90 transition-colors mt-1 font-normal">
              Follow-ups
            </div>
          </div>

          {/* Stat 4: 2 New signals */}
          <div
            onClick={() => setActiveFilter('new_signals')}
            className="px-4 cursor-pointer group"
          >
            <div className="font-editorial italic text-3xl sm:text-4xl text-white group-hover:text-white transition-colors leading-none">
              2
            </div>
            <div className="font-ui text-xs text-white/60 group-hover:text-white/90 transition-colors mt-1 font-normal">
              New signals
            </div>
          </div>

          {/* Stat 5: 3 Recently added */}
          <div
            onClick={() => setActiveFilter('uncontacted')}
            className="px-4 last:pr-2 cursor-pointer group"
          >
            <div className="font-editorial italic text-3xl sm:text-4xl text-white group-hover:text-white transition-colors leading-none">
              3
            </div>
            <div className="font-ui text-xs text-white/60 group-hover:text-white/90 transition-colors mt-1 font-normal">
              Recently added
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. FILTER BAR & 7. SORT CONTROL */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(7px)', y: 14 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.28, delay: 0.08, ease: 'easeOut' }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        {/* 6. HORIZONTAL PILL FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap sm:flex-nowrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'high_priority', label: 'High Priority' },
            { id: 'new_signals', label: 'New Signals' },
            { id: 'follow_up', label: 'Follow-up Due' },
            { id: 'uncontacted', label: 'Uncontacted' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'research_fresh', label: 'Research Fresh' },
          ].map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id as OpportunityFilter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-ui whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black font-medium shadow-sm'
                    : 'glass-pill text-white/60 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}

          {/* More Filters button (subdued glass pill) */}
          <button
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-ui whitespace-nowrap glass-pill flex items-center gap-1.5 transition-all ${
              moreFiltersOpen || minScoreFilter > 0 ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-white/60" />
            <span>More filters</span>
            {minScoreFilter > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        </div>

        {/* 7. SORT CONTROL */}
        <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
          <span className="text-xs font-ui text-white/50">Ranked by</span>
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as OpportunitySort)}
              className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] rounded-full pl-3.5 pr-8 py-1.5 text-xs font-ui text-white focus:outline-none focus:border-white/30 cursor-pointer transition-all"
            >
              <option value="recommendation" className="bg-neutral-900 text-white">
                LeadForge recommendation
              </option>
              <option value="score" className="bg-neutral-900 text-white">
                Opportunity score
              </option>
              <option value="recent_signal" className="bg-neutral-900 text-white">
                Most recent signal
              </option>
              <option value="urgency" className="bg-neutral-900 text-white">
                Follow-up urgency
              </option>
              <option value="recently_added" className="bg-neutral-900 text-white">
                Recently added
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Optional: Expanded More Filters Subpanel */}
      <AnimatePresence>
        {moreFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl liquid-glass-subtle border border-white/[0.1] p-4 text-xs font-ui space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-medium">Minimum Opportunity Score:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="5"
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                    className="accent-white cursor-pointer w-32"
                  />
                  <span className="font-mono text-white font-semibold">{minScoreFilter > 0 ? `${minScoreFilter}+` : 'All scores'}</span>
                </div>
              </div>

              {minScoreFilter > 0 && (
                <button
                  onClick={() => setMinScoreFilter(0)}
                  className="text-white/50 hover:text-white underline underline-offset-2 transition-colors self-start sm:self-auto"
                >
                  Reset filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 19. FLOATING BULK ACTIONS BAR (When opportunities are selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/95 border border-white/20 rounded-full px-5 py-2.5 shadow-2xl backdrop-blur-2xl flex items-center gap-3 sm:gap-4 text-xs font-ui"
          >
            <div className="flex items-center gap-2 pr-2 border-r border-white/10 text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{selectedIds.length} selected</span>
            </div>

            <button
              onClick={handleBulkReviewed}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark reviewed</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('tasks');
                setSelectedIds([]);
              }}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Assign follow-up</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={handleBulkDismiss}
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1 rounded-full text-white/40 hover:text-white ml-2"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UNDO DISMISS NOTICE */}
      <AnimatePresence>
        {undoNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl liquid-glass border border-white/20 p-4 flex items-center justify-between text-xs font-ui text-white/90"
          >
            <span>
              <span className="font-medium text-white">{undoNotice.name}</span> dismissed ({undoNotice.reason}).
            </span>
            <button
              onClick={() => undoDismiss(undoNotice.id)}
              className="text-white font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. OPPORTUNITY LIST: VERTICALLY STACKED LIQUID-GLASS CARDS */}
      <div className="space-y-4" id="opportunity-card-list">
        {visibleOpportunities.map((opp, idx) => {
          const isExpanded = expandedCardId === opp.id;
          const isSelected = selectedIds.includes(opp.id);
          const isDismissOpen = dismissingId === opp.id;

          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, filter: 'blur(7px)', y: 14 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.07,
                ease: 'easeOut',
              }}
              className={`group rounded-3xl liquid-glass border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'border-white/40 bg-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.06)]'
                  : 'border-white/[0.1] hover:border-white/[0.22] hover:bg-white/[0.04]'
              }`}
            >
              {/* Card Container Header & 5 Zones */}
              <div
                className="p-6 sm:p-7 cursor-pointer select-none"
                onClick={() => toggleExpand(opp.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Group: Selection Checkbox + ZONE 01 & ZONE 03 */}
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                    {/* Checkbox for Bulk Actions */}
                    <button
                      onClick={(e) => toggleSelectCard(opp.id, e)}
                      className={`w-5 h-5 rounded-md border mt-1 flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 hover:border-white/50 text-transparent'
                      }`}
                      title="Select opportunity"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="space-y-3 min-w-0 flex-1">
                      {/* ZONE 01 — Company Identity */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="font-ui font-medium text-lg sm:text-xl text-white group-hover:text-white transition-colors">
                            {opp.account?.name}
                          </h2>
                          <span className="text-xs font-ui text-white/50 font-light">
                            {opp.companyDescriptor}
                          </span>
                        </div>
                      </div>

                      {/* ZONE 03 — Why Now & Evidence Preview */}
                      <div className="space-y-2">
                        <p className="font-ui text-xs sm:text-sm text-white/85 font-normal leading-relaxed">
                          {opp.whyNowHeadline}
                        </p>

                        {/* Evidence Preview Chips & Freshness (Section 11) */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          <span className="text-[11px] font-ui text-white/40 flex items-center gap-1.5 mr-1">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span>Signal: {opp.signalFreshness}</span>
                          </span>

                          {opp.evidenceChips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOpportunityId(opp.id);
                                openOpportunityDetail(opp.id);
                              }}
                              className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 hover:border-white/30 text-[11px] font-ui text-white/70 hover:text-white transition-all flex items-center gap-1"
                              title="Inspect evidence in detail"
                            >
                              <span className="w-1 h-1 rounded-full bg-white/50" />
                              <span>{chip}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ZONE 04 — Recommended Action (Mobile layout / Quick Glance) */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-ui">
                        <div className="flex items-center gap-2 text-white/95">
                          <Sparkles className="w-3.5 h-3.5 text-white/80 shrink-0" />
                          <span className="font-medium">{opp.aiRecommendation}</span>
                        </div>
                        {/* Section 16: Small tertiary metadata confidence */}
                        <span className="text-[11px] text-white/40 font-light hidden sm:inline">
                          · {opp.confidenceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Group: ZONE 02 (Score) + ZONE 05 (User Actions) */}
                  <div className="flex sm:items-center justify-between lg:justify-end gap-6 shrink-0 pt-3 lg:pt-0 border-t border-white/[0.06] lg:border-t-0">
                    {/* ZONE 02 — Opportunity Score & Priority Label */}
                    <div className="text-left lg:text-right min-w-[90px]">
                      <div className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
                        {opp.score}
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-1 font-medium">
                        {opp.priorityLabel}
                      </div>
                    </div>

                    {/* ZONE 05 — User Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Open opportunity CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunityId(opp.id);
                          openOpportunityDetail(opp.id);
                        }}
                        className="px-3.5 py-2 rounded-full glass-pill hover:bg-white/[0.1] text-white text-xs font-ui font-medium transition-all flex items-center gap-1.5"
                        title="Open opportunity dossier"
                      >
                        <span>{opp.primaryActionLabel}</span>
                      </button>

                      {/* Contextual Action: Contact / Follow up / Research */}
                      {opp.secondaryActionLabel && (
                        <button
                          onClick={(e) => handlePrimaryAction(opp, opp.secondaryActionLabel!, e)}
                          className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-ui font-medium transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <span>{opp.secondaryActionLabel}</span>
                        </button>
                      )}

                      {/* Not now / Dismiss trigger (Section 20) */}
                      <div className="relative">
                        <button
                          onClick={(e) => handleOpenDismissMenu(opp.id, e)}
                          className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                          title="Not now / feedback"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        {/* Reason Selector Popover (Section 20) */}
                        <AnimatePresence>
                          {isDismissOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 6 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/20 rounded-2xl p-2 shadow-2xl z-30 space-y-1 text-xs font-ui backdrop-blur-xl"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-white/40 uppercase">
                                Not now reason
                              </div>
                              {[
                                'Wrong fit',
                                'Bad timing',
                                'Already contacted',
                                'Need more research',
                                'Other',
                              ].map((reason) => (
                                <button
                                  key={reason}
                                  onClick={() => confirmDismiss(opp.id, reason)}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  {reason}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Expand / Collapse Chevron */}
                      <button
                        onClick={(e) => toggleExpand(opp.id, e)}
                        className="p-1.5 text-white/40 hover:text-white transition-colors"
                        aria-label="Expand opportunity details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 18. EXPAND INTERACTION: SMOOTH INLINE HEIGHT/OPACITY ANIMATION */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="border-t border-white/[0.08] bg-white/[0.02] px-6 sm:px-8 py-6 space-y-6"
                  >
                    {/* Two-column expanded layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: 17. SCORE BREAKDOWN (Compact horizontal indicators) */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="text-xs font-ui font-medium uppercase tracking-wider text-white/50">
                          Score Breakdown
                        </div>

                        <div className="space-y-2.5 font-ui text-xs">
                          {/* Total Score */}
                          <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
                            <span className="text-white font-medium">Opportunity score</span>
                            <span className="font-mono font-semibold text-white">{opp.score}</span>
                          </div>

                          {/* ICP Fit */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-white/70">
                              <span>ICP Fit</span>
                              <span className="font-mono text-white/90">{opp.scoreBreakdown.fit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${opp.scoreBreakdown.fit}%` }}
                              />
                            </div>
                          </div>

                          {/* Timing */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-white/70">
                              <span>Timing</span>
                              <span className="font-mono text-white/90">{opp.scoreBreakdown.timing}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${opp.scoreBreakdown.timing}%` }}
                              />
                            </div>
                          </div>

                          {/* Intent */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-white/70">
                              <span>Intent</span>
                              <span className="font-mono text-white/90">{opp.scoreBreakdown.need}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${opp.scoreBreakdown.need}%` }}
                              />
                            </div>
                          </div>

                          {/* Data Confidence */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-white/70">
                              <span>Data confidence</span>
                              <span className="font-mono text-white/90">{opp.scoreBreakdown.evidenceQuality}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${opp.scoreBreakdown.evidenceQuality}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Evidence & Recommended Action Rationale */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="text-xs font-ui font-medium uppercase tracking-wider text-white/50">
                          Primary Target & Intelligence Rationale
                        </div>

                        {/* Contact preview */}
                        {opp.contact && (
                          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-xs font-ui font-medium text-white">
                                {opp.contact.name}
                              </div>
                              <div className="text-[11px] font-ui text-white/50 font-light">
                                {opp.contact.title}
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-white/40">{opp.contact.email}</span>
                          </div>
                        )}

                        {/* Strategic Rationale */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1 text-xs font-ui">
                          <div className="text-white/50 font-medium">Next Action Rationale:</div>
                          <p className="text-white/80 font-light leading-relaxed">
                            {opp.nextAction.reason}
                          </p>
                        </div>

                        {/* Deep link to Full Dossier */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setSelectedOpportunityId(opp.id);
                              openOpportunityDetail(opp.id);
                            }}
                            className="text-xs font-ui text-white hover:underline underline-offset-4 flex items-center gap-1 font-medium"
                          >
                            <span>Open complete dossier & evidence audit →</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
