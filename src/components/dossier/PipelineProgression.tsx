import React from 'react';
import { OpportunityStage } from '../../types';
import { Check } from 'lucide-react';

interface PipelineProgressionProps {
  currentStage: OpportunityStage;
  onSelectStage: (stage: OpportunityStage) => void;
}

const STAGES: { key: OpportunityStage; label: string }[] = [
  { key: 'NEW', label: 'Discovered' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'REPLIED', label: 'Replied' },
  { key: 'MEETING_BOOKED', label: 'Meeting' },
  { key: 'QUOTED', label: 'Proposal' },
  { key: 'WON', label: 'Won' },
];

export const PipelineProgression: React.FC<PipelineProgressionProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  // fallback if current stage is intermediary like OUTREACH_DRAFTED
  const effectiveIndex = currentIndex !== -1 ? currentIndex : 1;

  return (
    <div className="liquid-glass rounded-xl p-4 border border-white/[0.08]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
          Pipeline Position
        </span>
        <span className="text-xs font-ui text-white/70">
          Current stage: <strong className="text-white font-medium">{STAGES[effectiveIndex]?.label || currentStage}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < effectiveIndex;
          const isCurrent = idx === effectiveIndex;

          return (
            <button
              key={stage.key}
              onClick={() => onSelectStage(stage.key)}
              className={`flex-1 min-w-[70px] sm:min-w-[80px] py-2 px-1.5 sm:px-2 rounded-lg text-center transition-all cursor-pointer relative group ${
                isCurrent
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : isPassed
                  ? 'liquid-glass text-white/90 hover:bg-white/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
              title={`Click to set stage to ${stage.label}`}
            >
              <div className="flex items-center justify-center gap-1">
                {isPassed && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                <span className="text-[11px] sm:text-xs font-ui truncate">{stage.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
