import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AIInterpretationPanelProps {
  interpretation?: string;
  recommendedResponse?: string;
  confidenceText?: string;
  onViewNextAction: () => void;
}

export const AIInterpretationPanel: React.FC<AIInterpretationPanelProps> = ({
  interpretation = 'This account is becoming more attractive because multiple independent signals point toward active growth.',
  recommendedResponse = 'Start a conversation around scaling acquisition as the company expands its commercial team.',
  confidenceText = 'Supported by multiple recent signals.',
  onViewNextAction,
}) => {
  return (
    <div className="p-6 rounded-2xl liquid-glass-strong border border-white/15 space-y-5 font-ui">
      {/* 22. Heading: What this means (Instrument Serif Italic) */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
          AI INTERPRETATION
        </span>
        <h3 className="font-editorial italic text-2xl text-white tracking-tight">
          What this means
        </h3>
      </div>

      {/* Concise Interpretation */}
      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
        {interpretation}
      </p>

      {/* Recommended Response */}
      <div className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-1 bg-white/[0.02]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
          Recommended Response
        </span>
        <p className="text-xs text-white/85 leading-relaxed font-medium">
          {recommendedResponse}
        </p>
      </div>

      {/* 23. Evidence Confidence */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-white/40 block">
            Confidence
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
            <span>High</span>
          </div>
        </div>

        <span className="text-[11px] text-white/50 font-mono text-right max-w-[160px]">
          {confidenceText}
        </span>
      </div>

      {/* Primary CTA: View next action -> */}
      <button
        onClick={onViewNextAction}
        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-white/90 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      >
        <span>View next action</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
