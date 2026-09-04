import React, { useState } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  accountName: string;
  onClose: () => void;
  onSchedule: (dueAt: string, title: string, reason: string) => void;
}

const PRESETS = [
  { label: 'Tomorrow morning', value: 'Tomorrow, 9:00 AM' },
  { label: 'In 3 days', value: 'In 3 days' },
  { label: 'Next Monday', value: 'Next Monday, 10:00 AM' },
  { label: 'In 2 weeks', value: 'In 2 weeks' },
];

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  accountName,
  onClose,
  onSchedule,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[1].value);
  const [customTitle, setCustomTitle] = useState(`Follow up with ${accountName}`);
  const [reason, setReason] = useState('Check for reply or send Day-3 follow up value-add note.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(selectedPreset, customTitle.trim(), reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md liquid-glass-strong rounded-2xl border border-white/20 p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1">
            SCHEDULE FOLLOW-UP
          </span>
          <h3 className="font-editorial italic text-2xl text-white">
            Set Follow-up for {accountName}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-white/50 block">
              When
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setSelectedPreset(p.value)}
                  className={`p-2.5 rounded-xl text-left text-xs font-ui transition-all border cursor-pointer ${
                    selectedPreset === p.value
                      ? 'bg-white text-black font-medium border-white shadow-sm'
                      : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-white/50 block">
              Task Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-ui focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-white/50 block">
              Objective / Trigger
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-ui focus:outline-none focus:border-white/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass text-white/70 hover:text-white hover:bg-white/10 text-xs font-ui border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-white text-black font-ui font-medium text-xs hover:bg-white/90 transition-colors cursor-pointer"
            >
              Schedule Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
