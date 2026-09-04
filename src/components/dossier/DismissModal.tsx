import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

interface DismissModalProps {
  isOpen: boolean;
  accountName: string;
  onClose: () => void;
  onConfirmDismiss: (reason: string, note?: string) => void;
}

const REASONS = [
  'Wrong ICP',
  'Bad timing',
  'Already working with competitor',
  'Duplicate account',
  'Insufficient information',
  'Other',
];

export const DismissModal: React.FC<DismissModalProps> = ({
  isOpen,
  accountName,
  onClose,
  onConfirmDismiss,
}) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [optionalNote, setOptionalNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDismiss(selectedReason, optionalNote.trim() || undefined);
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
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 block mb-1">
            DISMISS OPPORTUNITY
          </span>
          <h3 className="font-editorial italic text-2xl text-white">
            Mark {accountName} as Not a Fit?
          </h3>
          <p className="text-xs font-ui text-white/60 mt-1">
            This will archive the opportunity and inform LeadForge's ranking model.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-white/50 block">
              Select Reason
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`p-2.5 rounded-xl text-left text-xs font-ui transition-all border cursor-pointer ${
                    selectedReason === r
                      ? 'bg-white text-black font-medium border-white shadow-sm'
                      : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-white/50 block">
              Optional Note for Model Calibration
            </label>
            <textarea
              rows={2}
              value={optionalNote}
              onChange={(e) => setOptionalNote(e.target.value)}
              placeholder="e.g. They just signed a 2-year contract with an alternative..."
              className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-ui placeholder:text-white/30 focus:outline-none focus:border-white/40 resize-none"
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
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-ui font-medium text-xs transition-colors cursor-pointer"
            >
              Confirm Dismissal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
