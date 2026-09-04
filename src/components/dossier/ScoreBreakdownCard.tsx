import React from 'react';
import { ScoreBreakdown } from '../../types';

interface ScoreBreakdownCardProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  score,
  breakdown,
}) => {
  const factors = [
    { label: 'ICP Fit', value: breakdown.fit || 96, desc: 'Exact target industry & company scale' },
    { label: 'Timing', value: breakdown.timing || 92, desc: 'Recent product launch & key hire within 72h' },
    { label: 'Intent', value: breakdown.need || 93, desc: 'Public indicators of scaling pipeline' },
    { label: 'Data confidence', value: breakdown.evidenceQuality || 90, desc: 'Multiple corroborating public sources' },
  ];

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
            SCORE BREAKDOWN
          </span>
          <h3 className="font-editorial italic text-xl sm:text-2xl text-white mt-0.5">
            Opportunity Score Analysis
          </h3>
        </div>
        <div className="text-right">
          <span className="font-editorial italic text-3xl text-white">{score}</span>
          <span className="text-[10px] font-mono text-white/40 block">Composite</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {factors.map((item) => (
          <div key={item.label} className="p-3.5 rounded-xl liquid-glass border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs text-white/90 font-medium">{item.label}</span>
              <span className="font-mono text-xs text-white font-semibold">{item.value} / 100</span>
            </div>

            {/* Segmented bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${item.value}%` }}
              />
            </div>

            <p className="text-[11px] font-ui text-white/50 leading-tight">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {breakdown.riskPenalty > 0 && (
        <div className="p-3 rounded-xl liquid-glass border border-rose-500/20 text-xs font-ui text-rose-300 flex items-center justify-between">
          <span>Risk penalty applied</span>
          <span className="font-mono font-semibold">-{breakdown.riskPenalty} pts</span>
        </div>
      )}
    </div>
  );
};
