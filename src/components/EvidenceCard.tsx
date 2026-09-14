import React from 'react';
import { EvidenceItem } from '../types';
import {
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Rocket,
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Flag,
  Globe,
} from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  companyName?: string;
  onDispute?: (id: string) => void;
  compact?: boolean;
}

export const getSignalIcon = (claimType: EvidenceItem['claimType']) => {
  switch (claimType) {
    case 'PRODUCT_LAUNCH':
      return <Rocket className="w-3.5 h-3.5 text-white/80" />;
    case 'HIRING':
      return <Briefcase className="w-3.5 h-3.5 text-white/80" />;
    case 'EXPANSION':
      return <TrendingUp className="w-3.5 h-3.5 text-white/80" />;
    case 'TECH_STACK':
      return <Layers className="w-3.5 h-3.5 text-white/80" />;
    default:
      return <Globe className="w-3.5 h-3.5 text-white/80" />;
  }
};

export const formatSignalCategory = (claimType: EvidenceItem['claimType']) => {
  switch (claimType) {
    case 'PRODUCT_LAUNCH':
      return 'Product Release';
    case 'HIRING':
      return 'Hiring Velocity';
    case 'EXPANSION':
      return 'Market Expansion';
    case 'TECH_STACK':
      return 'Tech Stack Modernization';
    default:
      return 'Verified Buying Signal';
  }
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  companyName,
  onDispute,
  compact = false,
}) => {
  const confidencePercent = Math.round((evidence.confidence || 0.88) * 100);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
        evidence.isDisputed
          ? 'bg-rose-950/20 border-rose-500/30'
          : 'liquid-glass-subtle border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
      } ${compact ? 'p-4 space-y-3' : 'p-5 sm:p-6 space-y-4 shadow-sm'}`}
    >
      {/* Top Header: Signal Badge & Freshness */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Signal Category Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/90 text-[11px] font-ui font-medium">
            {getSignalIcon(evidence.claimType)}
            <span>{formatSignalCategory(evidence.claimType)}</span>
          </div>

          {companyName && (
            <span className="text-xs font-ui text-white/40">
              for <span className="text-white/80 font-medium">{companyName}</span>
            </span>
          )}
        </div>

        {/* Date / Freshness Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-ui text-white/50 shrink-0">
          <Calendar className="w-3 h-3 text-white/30" />
          <span>{evidence.observedAt || 'Recently observed'}</span>
        </div>
      </div>

      {/* Field 1 & 2: Signal Headline & What Was Observed */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Signal & Observation
        </div>
        <h4 className="font-ui font-semibold text-sm sm:text-base text-white leading-snug">
          {evidence.claim}
        </h4>
        {evidence.whyItMatters && (
          <p className="font-ui font-light text-xs text-white/70 leading-relaxed pt-0.5">
            <span className="text-white/40 font-normal">Impact: </span>
            {evidence.whyItMatters}
          </p>
        )}
      </div>

      {/* Subtle Divider */}
      <div className="border-t border-white/[0.06] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-ui">
        {/* Field 3: Source */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-white/40 text-[11px]">Source:</span>
          {evidence.sourceUrl ? (
            <a
              href={evidence.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white underline decoration-white/20 underline-offset-2 transition-colors flex items-center gap-1 text-[11px] truncate max-w-[180px]"
            >
              <span>{evidence.sourceDomain || 'Public Source'}</span>
              <ExternalLink className="w-2.5 h-2.5 text-white/40 shrink-0" />
            </a>
          ) : (
            <span className="text-white/70 text-[11px]">
              {evidence.sourceDomain || 'Verified Public Registry'}
            </span>
          )}
        </div>

        {/* Verification Status & Dispute Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-1 text-[10px] font-mono text-white/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400/80" />
            <span>{confidencePercent}% trust</span>
          </div>

          {onDispute && (
            <button
              onClick={() => onDispute(evidence.id)}
              className={`text-[11px] font-ui transition-colors inline-flex items-center gap-1 ${
                evidence.isDisputed
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title={evidence.isDisputed ? 'Unmark disputed' : 'Dispute signal'}
            >
              <Flag className="w-3 h-3" />
              <span>{evidence.isDisputed ? 'Disputed' : 'Dispute'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
