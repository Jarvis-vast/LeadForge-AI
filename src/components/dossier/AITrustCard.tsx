import React from 'react';
import { Sparkles, ShieldCheck, HelpCircle, ArrowRight, Eye, Cpu, Compass } from 'lucide-react';

interface AITrustCardProps {
  confidence?: number;
}

export const AITrustCard: React.FC<AITrustCardProps> = ({ confidence = 94 }) => {
  return (
    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-7 border border-white/15 space-y-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-white/[0.03] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
            LEADFORGE ANALYSIS
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>High confidence ({confidence}%)</span>
        </div>
      </div>

      {/* Rationale Heading and Summary */}
      <div className="space-y-2">
        <h3 className="font-editorial italic text-2xl sm:text-3xl text-white tracking-tight leading-tight">
          Why this ranks #1 today
        </h3>
        <p className="font-ui text-sm text-white/80 leading-relaxed max-w-3xl">
          The account strongly matches your ICP and has multiple recent growth signals. The combination of a new marketing leader, product expansion, and sales-team growth creates a timely opening for your service.
        </p>
      </div>

      {/* AI Trust Rule 3-Tier Categorization */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            INTELLIGENCE DECONSTRUCTION · AI TRUST PROTOCOL
          </span>
          <span className="text-[10px] font-ui text-white/40 hidden sm:inline">
            Separates verified facts from probabilistic projections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tier 1: Observed */}
          <div className="liquid-glass rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                  Observed
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase">Fact</span>
            </div>
            <p className="font-ui text-xs text-white/90 leading-relaxed">
              Acme launched an enterprise tier and hired a VP of Marketing (2 days ago).
            </p>
            <div className="text-[10px] font-ui text-white/40 pt-1 border-t border-white/[0.06]">
              Verified on careers & website
            </div>
          </div>

          {/* Tier 2: Inferred */}
          <div className="liquid-glass rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Inferred
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase">Interpretation</span>
            </div>
            <p className="font-ui text-xs text-white/90 leading-relaxed">
              The company is actively investing in enterprise pipeline and commercial demand generation.
            </p>
            <div className="text-[10px] font-ui text-white/40 pt-1 border-t border-white/[0.06]">
              Model confidence 92%
            </div>
          </div>

          {/* Tier 3: Recommended */}
          <div className="liquid-glass rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-200 font-semibold">
                  Recommended
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase">Suggested Action</span>
            </div>
            <p className="font-ui text-xs text-white/90 leading-relaxed">
              Contact founder Alex Morgan with a growth-focused conversation starter regarding enterprise outbound.
            </p>
            <div className="text-[10px] font-ui text-white/40 pt-1 border-t border-white/[0.06]">
              Action due today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
