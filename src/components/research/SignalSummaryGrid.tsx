import React from 'react';
import { Briefcase, Box, Globe2, ExternalLink, ArrowUpRight } from 'lucide-react';

interface SignalSummaryItem {
  id: string;
  type: string;
  observation: string;
  freshness: string;
  sourceDomain: string;
  sourceUrl?: string;
  iconType: 'hiring' | 'product' | 'expansion';
}

interface SignalSummaryGridProps {
  signals?: SignalSummaryItem[];
  onSelectSignal?: (type: string) => void;
}

const defaultSignals: SignalSummaryItem[] = [
  {
    id: 'sig-01',
    type: 'Hiring',
    observation: '3 new sales roles',
    freshness: '2 days ago',
    sourceDomain: 'acme.io/careers',
    sourceUrl: 'https://acme.io/careers',
    iconType: 'hiring',
  },
  {
    id: 'sig-02',
    type: 'Product',
    observation: 'Enterprise launch',
    freshness: '6 days ago',
    sourceDomain: 'Company blog',
    sourceUrl: 'https://acme.io/blog/announcing-enterprise',
    iconType: 'product',
  },
  {
    id: 'sig-03',
    type: 'Expansion',
    observation: 'US market entry',
    freshness: '1 week ago',
    sourceDomain: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/company/acme-io',
    iconType: 'expansion',
  },
];

export const SignalSummaryGrid: React.FC<SignalSummaryGridProps> = ({
  signals = defaultSignals,
  onSelectSignal,
}) => {
  const getIcon = (type: 'hiring' | 'product' | 'expansion') => {
    switch (type) {
      case 'hiring':
        return <Briefcase className="w-3.5 h-3.5 text-white/70" />;
      case 'product':
        return <Box className="w-3.5 h-3.5 text-white/70" />;
      case 'expansion':
        return <Globe2 className="w-3.5 h-3.5 text-white/70" />;
    }
  };

  return (
    <div className="space-y-2 font-ui">
      <div className="flex items-center justify-between text-xs text-white/50 px-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider">
          DETECTED SIGNALS OVERVIEW
        </span>
        <span className="text-[11px] font-mono">3 Verified Indicators</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {signals.map((sig) => (
          <div
            key={sig.id}
            onClick={() => onSelectSignal && onSelectSignal(sig.type)}
            className="p-4 rounded-xl liquid-glass border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-white/[0.06]">
                    {getIcon(sig.iconType)}
                  </div>
                  <span className="font-medium text-white/90 text-xs tracking-tight">
                    {sig.type}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  {sig.freshness}
                </span>
              </div>

              <div className="text-sm font-semibold text-white tracking-tight pt-0.5 group-hover:text-white transition-colors">
                {sig.observation}
              </div>
            </div>

            {/* Small source indicator with subtle external link */}
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/40 font-mono">
              <span className="truncate max-w-[140px] text-white/50 group-hover:text-white/70 transition-colors">
                {sig.sourceDomain}
              </span>
              {sig.sourceUrl && (
                <a
                  href={sig.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white/30 hover:text-white transition-colors p-0.5"
                  title="Open source"
                >
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
