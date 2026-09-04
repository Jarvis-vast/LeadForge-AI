import React, { useState } from 'react';
import { NextAction } from '../../types';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface RecommendedActionCardProps {
  nextAction: NextAction;
  onStartOutreach: () => void;
  onMarkComplete?: () => void;
}

export const RecommendedActionCard: React.FC<RecommendedActionCardProps> = ({
  nextAction,
  onStartOutreach,
  onMarkComplete,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    if (onMarkComplete) onMarkComplete();
  };

  return (
    <div className="liquid-glass-strong rounded-2xl p-6 sm:p-7 border border-white/20 space-y-4 relative overflow-hidden">
      {/* Background soft aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
          NEXT BEST ACTION
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/80 border border-white/10">
          <Clock className="w-3 h-3 text-white/50" />
          <span>Due today</span>
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-editorial italic text-2xl sm:text-3xl text-white tracking-tight leading-snug">
          {nextAction?.actionText || 'Contact the founder.'}
        </h3>
        <p className="font-ui text-sm text-white/75 leading-relaxed max-w-2xl">
          {nextAction?.reason ||
            'The recent product launch gives you a natural conversation starter, and the account closely matches your target customer profile.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onStartOutreach}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-ui font-medium text-xs sm:text-sm hover:bg-white/90 transition-all shadow cursor-pointer active:scale-[0.98]"
        >
          <span>Start outreach</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-xs sm:text-sm transition-colors border cursor-pointer ${
            isCompleted
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10 border-white/10'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-white/40'}`} />
          <span>{isCompleted ? 'Action logged as completed' : 'Mark complete'}</span>
        </button>
      </div>
    </div>
  );
};
