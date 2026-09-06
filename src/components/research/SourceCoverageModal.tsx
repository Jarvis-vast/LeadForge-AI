import React from 'react';
import { X, ShieldCheck, CheckCircle2, Globe, FileCode2, Users, Newspaper } from 'lucide-react';
import { Account } from '../../types';

interface SourceCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
}

export const SourceCoverageModal: React.FC<SourceCoverageModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  if (!isOpen) return null;

  const coverageItems = [
    {
      title: 'Company First-Party Web & Changelog',
      target: `${account.domain} & subdomains`,
      status: 'Fully Indexed',
      frequency: 'Every 24 hours',
      icon: <Globe className="w-4 h-4 text-white" />,
      coverage: '100%',
    },
    {
      title: 'Careers, Job Boards & ATS',
      target: `${account.domain}/careers, Greenhouse, Lever`,
      status: 'Live Webhooks',
      frequency: 'Real-time delta',
      icon: <Users className="w-4 h-4 text-white" />,
      coverage: '96%',
    },
    {
      title: 'Leadership & Executive Social Footprint',
      target: 'LinkedIn Company & Key Decision Makers',
      status: 'Indexed & Attributed',
      frequency: 'Bi-weekly crawl',
      icon: <Users className="w-4 h-4 text-white" />,
      coverage: '88%',
    },
    {
      title: 'Public Registries & Funding Filings',
      target: 'Crunchbase, SEC Edgar, Pitchbook APIs',
      status: 'Verified Match',
      frequency: 'Weekly sync',
      icon: <FileCode2 className="w-4 h-4 text-white" />,
      coverage: '94%',
    },
    {
      title: 'Industry Press & Syndication Feed',
      target: 'Google News, TechCrunch, PR Newswire',
      status: 'Keyword Filtered',
      frequency: 'Continuous pipeline',
      icon: <Newspaper className="w-4 h-4 text-white" />,
      coverage: '92%',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-xl rounded-2xl liquid-glass-strong border border-white/20 p-6 sm:p-7 space-y-6 text-white shadow-2xl relative font-ui"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
              SOURCE COVERAGE AUDIT
            </span>
            <h3 className="font-ui font-semibold text-lg sm:text-xl text-white tracking-tight">
              Intelligence Source Coverage for {account.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {coverageItems.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl liquid-glass border border-white/[0.08] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-white">
                  <div className="p-1 rounded bg-white/10">{item.icon}</div>
                  <span>{item.title}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {item.coverage}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50 font-mono pl-7">
                <span className="truncate max-w-[240px] text-white/70">{item.target}</span>
                <span className="text-white/40">{item.frequency}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-xs font-ui">
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Overall confidence score for this domain: <strong>94% First-Party Integrity</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
