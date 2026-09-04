import React from 'react';
import { Activity } from '../../types';
import { Sparkles, CheckCircle2, Mail, Bot, User, Clock, ArrowRightLeft, FileText, XCircle } from 'lucide-react';

interface ActivityCardProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'RESEARCH_COMPLETED':
      return <Bot className="w-3.5 h-3.5 text-blue-400" />;
    case 'SCORE_UPDATED':
      return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
    case 'OUTREACH_DRAFTED':
    case 'OUTREACH_APPROVED':
    case 'OUTREACH_SENT':
      return <Mail className="w-3.5 h-3.5 text-emerald-400" />;
    case 'STAGE_CHANGED':
      return <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />;
    case 'NOTE_ADDED':
      return <FileText className="w-3.5 h-3.5 text-white/70" />;
    case 'DISMISSED':
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-white/50" />;
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => {
  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
            AUDIT TRAIL
          </span>
          <h3 className="font-editorial italic text-xl sm:text-2xl text-white mt-0.5">
            Activity History
          </h3>
        </div>
        <span className="text-xs font-ui text-white/40">
          {activities.length} recorded events
        </span>
      </div>

      <div className="relative pl-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-white/10">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3 group">
            {/* Timeline dot */}
            <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-black border border-white/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>

            <div className="flex-1 liquid-glass rounded-xl p-3 border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getActivityIcon(act.type)}
                  <span className="text-xs font-ui text-white font-medium">
                    {act.actorName}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-white/40">{act.happenedAt}</span>
              </div>
              <p className="text-xs font-ui text-white/70 leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
