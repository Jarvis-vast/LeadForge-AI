import React from 'react';
import { EvidenceItem } from '../../types';
import { ExternalLink, Flag, AlertTriangle, CheckCircle2, Sparkles, Building2, Briefcase, Rocket, TrendingUp, Layers } from 'lucide-react';

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

const formatSignalLabel = (claimType: EvidenceItem['claimType']) => {
  switch (claimType) {
    case 'PRODUCT_LAUNCH':
      return 'Product launch';
    case 'HIRING':
      return 'Hiring signal';
    case 'EXPANSION':
      return 'Team growth';
    case 'TECH_STACK':
      return 'Tech stack';
    default:
      return 'Company signal';
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
                className={`absolute -left-6 top-1 w-[23px] h-[23px] rounded-full flex items-center justify-center border transition-all ${
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

              {/* Item Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  item.isDisputed
                    ? 'liquid-glass border-rose-500/30 bg-rose-950/10'
                    : 'liquid-glass border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                      {formatSignalLabel(item.claimType)}
                    </span>
                    <span className="text-xs font-ui text-white/40">·</span>
                    <span className="text-xs font-ui text-white/40">{item.observedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDispute(item.id)}
                      className={`text-[11px] font-ui transition-colors inline-flex items-center gap-1 cursor-pointer ${
                        item.isDisputed
                          ? 'text-rose-400 hover:text-rose-300'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                      title={item.isDisputed ? 'Unmark disputed' : 'Dispute claim'}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{item.isDisputed ? 'Disputed' : 'Dispute'}</span>
                    </button>
                  </div>
                </div>

                {/* Observation claim */}
                <p className="font-ui text-sm text-white font-medium mb-2 leading-relaxed">
                  {item.claim}
                </p>

                {/* Why it matters */}
                {item.whyItMatters && (
                  <div className="text-xs font-ui text-white/70 bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04] mb-3 flex items-start gap-2">
                    <span className="text-white/40 font-mono text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
                      Why it matters:
                    </span>
                    <span className="text-white/80">{item.whyItMatters}</span>
                  </div>
                )}

                {/* Source link & freshness */}
                <div className="flex items-center justify-between text-[11px] font-ui text-white/40 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <span>Source:</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/60 hover:text-white underline decoration-white/20 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{item.sourceDomain || 'acme.io'}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-white/40">
                    <CheckCircle2 className="w-3 h-3 text-white/30" />
                    <span>Confidence {Math.round(item.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
