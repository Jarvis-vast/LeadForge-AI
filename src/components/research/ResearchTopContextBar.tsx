import React from 'react';
import { Account, Opportunity } from '../../types';
import { ArrowLeft, Clock, Globe, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResearchTopContextBarProps {
  account: Account;
  opportunity: Opportunity;
  onBackToOpportunities: () => void;
  onBackToDossier: () => void;
  freshnessText?: string;
  statusText?: string;
}

export const ResearchTopContextBar: React.FC<ResearchTopContextBarProps> = ({
  account,
  opportunity,
  onBackToOpportunities,
  onBackToDossier,
  freshnessText = 'Updated 2h ago',
  statusText = 'Research complete',
}) => {
  return (
    <div className="w-full border-b border-white/[0.08] pb-4 pt-1 space-y-3 font-ui">
      {/* 3. Top Context Bar: Breadcrumbs (small Barlow text) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/60 font-light">
          <button
            onClick={onBackToOpportunities}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Opportunities
          </button>
          <span className="text-white/30">/</span>
          <button
            onClick={onBackToDossier}
            className="text-white/80 hover:text-white transition-colors cursor-pointer font-medium"
          >
            {account.name}
          </button>
          <span className="text-white/30">/</span>
          <span className="text-white font-medium">Research</span>
        </div>

        {/* Action to switch back to Dossier */}
        <button
          onClick={onBackToDossier}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Opportunity Dossier</span>
        </button>
      </div>

      {/* Context Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
              Company
            </span>
            <h3 className="font-ui font-semibold text-sm sm:text-base text-white tracking-tight">
              {account.name}
            </h3>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
              Domain
            </span>
            <a
              href={`https://${account.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs sm:text-sm text-white/70 hover:text-white inline-flex items-center gap-1 font-mono transition-colors"
            >
              <span>{account.domain}</span>
            </a>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
              Status
            </span>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{statusText}</span>
            </div>
          </div>
        </div>

        {/* Subtle freshness indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass border border-white/10 text-[11px] text-white/60 font-mono">
          <Clock className="w-3 h-3 text-white/40" />
          <span>{freshnessText}</span>
        </div>
      </div>
    </div>
  );
};
