import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Box,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Flag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidenceTimelineViewProps {
  evidenceItems: EvidenceItem[];
  onDisputeEvidence?: (id: string) => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const EvidenceTimelineView: React.FC<EvidenceTimelineViewProps> = ({
  evidenceItems,
  onDisputeEvidence,
  selectedFilter: externalFilter,
  onFilterChange: externalFilterChange,
}) => {
  const [internalFilter, setInternalFilter] = useState('All');
  const [sortOption, setSortOption] = useState<'relevant' | 'recent' | 'confidence'>('relevant');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'evi-01': true, // Expanded by default for rich initial preview
  });

  const activeFilter = externalFilter !== undefined ? externalFilter : internalFilter;
  const setActiveFilter = (filter: string) => {
    if (externalFilterChange) {
      externalFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  const filterOptions = [
    'All',
    'Hiring',
    'Product',
    'Funding',
    'Expansion',
    'Leadership',
    'Technology',
    'Market',
  ];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter & Sort
  const displayedItems = useMemo(() => {
    let list = [...evidenceItems];

    if (activeFilter !== 'All') {
      const matchKey = activeFilter.toUpperCase();
      list = list.filter((item) => {
        if (matchKey === 'HIRING' && item.claimType === 'HIRING') return true;
        if (matchKey === 'PRODUCT' && item.claimType === 'PRODUCT_LAUNCH') return true;
        if (matchKey === 'EXPANSION' && item.claimType === 'EXPANSION') return true;
        if (matchKey === 'LEADERSHIP' && item.claimType === 'LEADERSHIP') return true;
        if (matchKey === 'TECHNOLOGY' && item.claimType === 'TECH_STACK') return true;
        if (matchKey === 'FUNDING' && item.claimType === 'FUNDING') return true;
        if (item.claim.toLowerCase().includes(activeFilter.toLowerCase())) return true;
        return false;
      });
    }

    if (sortOption === 'recent') {
      // Sort roughly by observed order
      return list;
    } else if (sortOption === 'confidence') {
      return list.sort((a, b) => b.confidence - a.confidence);
    }
    // default 'relevant'
    return list;
  }, [evidenceItems, activeFilter, sortOption]);

  const getKicker = (item: EvidenceItem) => {
    switch (item.claimType) {
      case 'HIRING':
        return item.claim.toLowerCase().includes('sales') ? 'TEAM SIGNAL' : 'HIRING SIGNAL';
      case 'PRODUCT_LAUNCH':
        return 'PRODUCT SIGNAL';
      case 'TECH_STACK':
        return 'TECHNOLOGY SIGNAL';
      case 'LEADERSHIP':
        return 'LEADERSHIP SIGNAL';
      case 'EXPANSION':
        return 'EXPANSION SIGNAL';
      default:
        return 'OBSERVED SIGNAL';
    }
  };

  const getIcon = (item: EvidenceItem) => {
    if (item.claimType === 'HIRING') {
      return item.claim.toLowerCase().includes('sales') ? (
        <Users className="w-3.5 h-3.5 text-white/80" />
      ) : (
        <Briefcase className="w-3.5 h-3.5 text-white/80" />
      );
    }
    if (item.claimType === 'PRODUCT_LAUNCH') {
      return <Box className="w-3.5 h-3.5 text-white/80" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-white/80" />;
  };

  return (
    <div className="space-y-6 font-ui">
      {/* 9. Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Evidence
          </h3>
          <p className="text-xs text-white/60 font-light">
            Observed signals and supporting sources
          </p>
        </div>

        {/* 17. Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40 font-mono text-[11px]">Sort:</span>
          <div className="inline-flex rounded-lg liquid-glass p-0.5 border border-white/10">
            <button
              onClick={() => setSortOption('relevant')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortOption === 'relevant'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Most relevant
            </button>
            <button
              onClick={() => setSortOption('recent')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortOption === 'recent'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Most recent
            </button>
            <button
              onClick={() => setSortOption('confidence')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sortOption === 'confidence'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Highest confidence
            </button>
          </div>
        </div>
      </div>

      {/* 16. Research Filters (Monochrome Pill Filters) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'liquid-glass border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* 9. Vertical Evidence Timeline */}
      <div className="space-y-4 relative">
        {displayedItems.length === 0 ? (
          <div className="p-8 rounded-2xl liquid-glass border border-white/[0.08] text-center space-y-2">
            <p className="text-sm text-white/80 font-medium">No signals matching filter &ldquo;{activeFilter}&rdquo;</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="text-xs text-white underline hover:text-white/80"
            >
              Show all evidence
            </button>
          </div>
        ) : (
          displayedItems.map((item, index) => {
            const isExpanded = !!expandedIds[item.id];
            const kicker = getKicker(item);

            return (
              <React.Fragment key={item.id}>
                {/* Evidence Item Card */}
                <div
                  className={`rounded-2xl liquid-glass border transition-all ${
                    item.isDisputed
                      ? 'border-red-500/40 bg-red-500/[0.03]'
                      : isExpanded
                      ? 'border-white/20 bg-white/[0.04]'
                      : 'border-white/[0.08] hover:border-white/15'
                  }`}
                >
                  {/* Top Bar / Header of Card */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-5 sm:p-6 cursor-pointer space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-white/10">
                          {getIcon(item)}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                          {kicker}
                        </span>
                        <span className="text-white/30 text-[10px]">·</span>
                        {/* 10, 11, 12. Strict Trust Badge: Observed */}
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-medium">
                          {item.badge || 'Observed'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                        <span>{item.observedAt}</span>
                        <div className="flex items-center gap-1 text-white/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{Math.round(item.confidence * 100)}%</span>
                        </div>
                        <div className="p-1 text-white/40 hover:text-white transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Headline / Primary Statement */}
                    <div>
                      <h4 className="font-ui font-semibold text-base sm:text-lg text-white tracking-tight leading-snug">
                        {item.headline || item.claim}
                      </h4>
                    </div>

                    {/* 10. Observation & Why It Matters Preview */}
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="text-white/80 font-normal leading-relaxed">
                        <span className="text-white/40 font-mono text-[11px] uppercase mr-2">
                          Observation:
                        </span>
                        {item.observation || item.claim}
                      </div>

                      <div className="text-white/60 font-light leading-relaxed">
                        <span className="text-white/40 font-mono text-[11px] uppercase mr-2">
                          Why it matters:
                        </span>
                        {item.whyItMatters}
                      </div>
                    </div>

                    {/* Source summary link */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-white/50 font-mono text-[11px]">
                        <span>Source:</span>
                        <span className="text-white/70">{item.sourceDomain}</span>
                      </div>

                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors font-medium cursor-pointer"
                      >
                        <span>Open source</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* 18. Expanded Evidence Details */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/[0.06] space-y-4 text-xs font-ui bg-black/20 rounded-b-2xl">
                      {/* Context Excerpt */}
                      <div className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                          Verified Context Excerpt
                        </span>
                        <p className="text-xs text-white/85 font-mono leading-relaxed italic bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                          &ldquo;{item.excerpt || item.claim}&rdquo;
                        </p>
                      </div>

                      {/* Detail attributes grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-white/50 pt-1">
                        <div>
                          <span className="text-white/30 block">First Detected</span>
                          <span className="text-white/80">{item.observedAt}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block">Domain Integrity</span>
                          <span className="text-white/80">First-Party Verified</span>
                        </div>
                        <div>
                          <span className="text-white/30 block">Model Confidence</span>
                          <span className="text-emerald-400">
                            {(item.confidence * 100).toFixed(0)}% Certainty
                          </span>
                        </div>
                        <div>
                          <span className="text-white/30 block">Provenance</span>
                          <span className="text-white/80">Public Web Crawler</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass border border-white/15 text-white hover:bg-white/10 transition-colors font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open source in new tab ↗</span>
                        </a>

                        <button
                          onClick={() => onDisputeEvidence && onDisputeEvidence(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                            item.isDisputed
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'text-white/40 hover:text-red-400 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          <span>{item.isDisputed ? 'Evidence Disputed' : 'Flag / Dispute signal'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 13. LEADFORGE INFERENCE BLOCK (rendered between evidence items) */}
                {index === 0 && (
                  <div className="p-5 sm:p-6 rounded-2xl liquid-glass border border-white/15 bg-white/[0.02] space-y-3 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 font-semibold">
                          LEADFORGE INFERENCE
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full liquid-glass border border-white/15 text-[10px] font-mono text-white/80">
                        Inferred Synthesis
                      </span>
                    </div>

                    <p className="font-ui text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                      The combination of marketing leadership hiring, enterprise-product expansion, and sales-team growth suggests a broader commercial growth initiative.
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-white/[0.06] text-white/50 font-mono">
                      <span>Based on 3 observed signals</span>
                      <div className="flex items-center gap-1.5 text-white/80">
                        <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                        <span>Confidence: High</span>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
