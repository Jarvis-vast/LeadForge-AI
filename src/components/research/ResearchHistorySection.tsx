import React from 'react';
import { History, CheckCircle2, Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  badge?: string;
}

const defaultHistory: HistoryEntry[] = [
  {
    id: 'hist-01',
    timestamp: 'Today · 10:24 AM',
    title: 'Full research completed',
    detail: '7 sources analyzed, 3 active signals extracted, ICP fit score verified at 94.',
    badge: 'Latest',
  },
  {
    id: 'hist-02',
    timestamp: 'Yesterday · 6:42 PM',
    title: 'Signal refresh completed',
    detail: 'Automated delta crawl detected 1 new job opening for VP of Marketing on careers portal.',
  },
  {
    id: 'hist-03',
    timestamp: 'Aug 31 · 11:03 AM',
    title: 'Initial account research',
    detail: 'Account created and initialized from inbound domain search. Tech stack detected.',
  },
];

export const ResearchHistorySection: React.FC<{ history?: HistoryEntry[] }> = ({
  history = defaultHistory,
}) => {
  return (
    <div className="pt-6 border-t border-white/[0.08] space-y-4 font-ui">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white/50" />
          <h3 className="text-base font-semibold text-white tracking-tight">
            Research history
          </h3>
        </div>
        <span className="text-[11px] font-mono text-white/40">Audit Log</span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="pl-8 relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs"
          >
            {/* Timeline node */}
            <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-black border-2 border-white/40 flex items-center justify-center" />

            <div className="space-y-0.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs">
                  {entry.title}
                </span>
                {entry.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/10 text-white/80">
                    {entry.badge}
                  </span>
                )}
              </div>
              <p className="text-white/60 font-light text-[11px] leading-relaxed">
                {entry.detail}
              </p>
            </div>

            <div className="text-[11px] font-mono text-white/40 shrink-0">
              {entry.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
