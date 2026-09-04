import React, { useState, useRef, useEffect } from 'react';
import { Opportunity, Account } from '../../types';
import { Sparkles, MoreHorizontal, ArrowRight, Mail, CheckCircle2, Clock, Calendar, ArrowRightLeft, XCircle, Share2 } from 'lucide-react';

interface DossierHeaderProps {
  opportunity: Opportunity;
  account: Account;
  onTakeAction: () => void;
  onGenerateOutreach: () => void;
  onScheduleFollowUp: () => void;
  onDismiss: () => void;
}

export const DossierHeader: React.FC<DossierHeaderProps> = ({
  opportunity,
  account,
  onTakeAction,
  onGenerateOutreach,
  onScheduleFollowUp,
  onDismiss,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleShareDossier = () => {
    navigator.clipboard.writeText(`${window.location.origin}?opp=${opportunity.id}`);
    setCopiedNotification(true);
    setMenuOpen(false);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="liquid-glass rounded-2xl p-5 sm:p-7 relative overflow-hidden border border-white/[0.08]">
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-white/[0.02] blur-3xl pointer-events-none -z-10" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Identity & Chips */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-white/10 text-white border border-white/15">
              ICP Match
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-white/[0.06] text-white/80 border border-white/10">
              New Signal
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-white/[0.06] text-white/80 border border-white/10">
              High Priority
            </span>
          </div>

          <div>
            <h1 className="font-editorial italic text-3xl sm:text-4xl text-white tracking-tight leading-none">
              {account.name}
            </h1>
            <p className="font-ui text-sm text-white/60 mt-1 flex items-center gap-2">
              <span>{account.industry}</span>
              <span className="text-white/20">·</span>
              <a
                href={`https://${account.domain}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors underline decoration-white/30 underline-offset-2"
              >
                {account.domain}
              </a>
              <span className="text-white/20">·</span>
              <span className="text-white/40">{account.size}</span>
            </p>
          </div>
        </div>

        {/* Right: Score and Action Cluster */}
        <div className="flex items-center gap-6 sm:gap-8 flex-wrap lg:flex-nowrap justify-between lg:justify-end border-t lg:border-t-0 border-white/[0.06] pt-4 lg:pt-0">
          {/* Score Badge */}
          <div className="flex items-baseline gap-3">
            <div className="text-right">
              <span className="font-editorial italic text-5xl sm:text-6xl text-white leading-none tracking-tight block">
                {opportunity.score}
              </span>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                  Opportunity Score
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="text-left border-l border-white/10 pl-3 hidden sm:block">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 block">
                High Priority
              </span>
              <span className="text-[11px] font-ui text-white/40 block mt-0.5">
                Updated 2h ago
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onTakeAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-ui font-medium text-xs sm:text-sm hover:bg-white/90 transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <span>Take next action</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGenerateOutreach}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl liquid-glass text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xs sm:text-sm font-ui cursor-pointer border border-white/10 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/70" />
              <span>Outreach</span>
            </button>

            {/* Dropdown menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl liquid-glass text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl liquid-glass-strong border border-white/15 py-1.5 shadow-2xl z-30 font-ui text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      onScheduleFollowUp();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-white/50" />
                    <span>Add follow-up</span>
                  </button>

                  <button
                    onClick={handleShareDossier}
                    className="w-full px-3.5 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white/50" />
                    <span>Export dossier link</span>
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  <button
                    onClick={() => {
                      onDismiss();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Mark as Not a fit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {copiedNotification && (
        <div className="absolute bottom-2 right-6 px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dossier link copied</span>
        </div>
      )}
    </div>
  );
};
