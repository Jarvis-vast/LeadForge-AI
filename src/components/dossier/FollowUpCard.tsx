import React from 'react';
import { Task } from '../../types';
import { Calendar, Clock, CheckCircle2, MoreVertical, Plus } from 'lucide-react';

interface FollowUpCardProps {
  tasks: Task[];
  onScheduleFollowUp: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  tasks,
  onScheduleFollowUp,
  onCompleteTask,
  onSnoozeTask,
}) => {
  const activeTask = tasks.find((t) => t.status === 'DUE' || t.status === 'OVERDUE');

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
            CADENCE & TIMING
          </span>
          <h3 className="font-editorial italic text-xl sm:text-2xl text-white mt-0.5">
            Follow-Up Status
          </h3>
        </div>

        <button
          onClick={onScheduleFollowUp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass text-white/70 hover:text-white hover:bg-white/10 text-xs font-ui border border-white/10 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add follow-up</span>
        </button>
      </div>

      {activeTask ? (
        <div className="p-4 rounded-xl liquid-glass-strong border border-white/15 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Scheduled: {activeTask.dueAt}</span>
                </span>
                <span className="text-xs font-ui text-white/40">Assignee: {activeTask.assignee}</span>
              </div>
              <h4 className="font-ui text-sm font-semibold text-white leading-snug">
                {activeTask.title}
              </h4>
              <p className="font-ui text-xs text-white/60">
                <span className="text-white/40">Reason:</span> {activeTask.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            <button
              onClick={() => onCompleteTask(activeTask.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>

            <button
              onClick={() => onSnoozeTask(activeTask.id)}
              className="px-3 py-1.5 rounded-lg liquid-glass text-white/70 hover:text-white hover:bg-white/10 text-xs font-ui border border-white/10 transition-colors cursor-pointer"
            >
              Reschedule (+1 day)
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl liquid-glass border border-white/[0.04] text-center space-y-2">
          <p className="font-ui text-xs text-white/50">
            No active follow-up scheduled for this opportunity.
          </p>
          <button
            onClick={onScheduleFollowUp}
            className="text-xs font-ui text-white underline decoration-white/30 hover:decoration-white transition-colors cursor-pointer"
          >
            Set a reminder or follow-up deadline →
          </button>
        </div>
      )}
    </div>
  );
};
