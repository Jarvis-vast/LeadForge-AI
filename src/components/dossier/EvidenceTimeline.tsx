import React from 'react';
import { EvidenceItem } from '../../types';
import { EvidenceCard } from '../EvidenceCard';
import { AlertTriangle, Layers, Rocket, Briefcase, TrendingUp, Building2 } from 'lucide-react';

interface EvidenceTimelineProps {
  evidence: EvidenceItem[];
  whyNow: string;
  onDispute: (id: string) => void;
}

const getSignalIcon = (claimType: EvidenceItem['claimType']) => {
  switch (claimType) {
    case 'PRODUCT_LAUNCH':
      return <Rocket className="w-3.5 h-3.5 text-white/70" />;
    case 'HIRING':
      return <Briefcase className="w-3.5 h-3.5 text-white/70" />;
    case 'EXPANSION':
      return <TrendingUp className="w-3.5 h-3.5 text-white/70" />;
    case 'TECH_STACK':
      return <Layers className="w-3.5 h-3.5 text-white/70" />;
    default:
      return <Building2 className="w-3.5 h-3.5 text-white/70" />;
  }
};

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({
  evidence,
  whyNow,
  onDispute,
}) => {
  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6">
      {/* Why this opportunity statement */}
      <div className="space-y-2 border-b border-white/[0.06] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
          WHY THIS OPPORTUNITY
        </span>
        <h2 className="font-editorial italic text-2xl sm:text-3xl text-white tracking-tight leading-snug">
          There is a reason to act now.
        </h2>
        <p className="font-ui text-sm text-white/75 leading-relaxed max-w-3xl">
          {whyNow ||
            'Acme SaaS matches your target customer profile and has several recent signals that suggest an active growth initiative.'}
        </p>
      </div>

      {/* Evidence Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              EVIDENCE TIMELINE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/70">
              {evidence.length} verified signals
            </span>
          </div>
          <span className="text-[11px] font-ui text-white/40">
            Chronological audit trail
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-white/15">
          {evidence.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-6 top-3 w-[23px] h-[23px] rounded-full flex items-center justify-center border transition-all z-10 ${
                  item.isDisputed
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    : 'bg-black/90 border-white/20 text-white/80 group-hover:border-white/50'
                }`}
              >
                {item.isDisputed ? (
                  <AlertTriangle className="w-2.5 h-2.5" />
                ) : (
                  getSignalIcon(item.claimType)
                )}
              </div>

              {/* Enhanced Evidence Card */}
              <EvidenceCard
                evidence={item}
                onDispute={onDispute}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
