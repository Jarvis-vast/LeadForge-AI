import React, { useState } from 'react';
import { Account, Opportunity, EvidenceItem, Contact } from '../../types';
import { Building2, ExternalLink, Globe, MapPin, Users, Layers, ShieldCheck, RefreshCw, Plus, FileText, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { PrimaryContactCard } from './PrimaryContactCard';

interface IntelligenceRailProps {
  account: Account;
  opportunity: Opportunity;
  evidence: EvidenceItem[];
  notes: { id: string; text: string; createdAt: string }[];
  onAddNote: (text: string) => void;
  onRefreshResearch: () => void;
  onDismiss: () => void;
  isRefreshing?: boolean;
  onViewResearch?: () => void;
  primaryContact?: Contact | null;
  onSelectContactForOutreach?: (contact: Contact) => void;
}

export const IntelligenceRail: React.FC<IntelligenceRailProps> = ({
  account,
  opportunity,
  evidence,
  notes,
  onAddNote,
  onRefreshResearch,
  onDismiss,
  isRefreshing = false,
  onViewResearch,
  primaryContact,
  onSelectContactForOutreach,
}) => {
  const [newNoteText, setNewNoteText] = useState('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Summary */}
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            COMPANY PROFILE
          </span>
          <a
            href={`https://${account.domain}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-ui text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            <span>{account.domain}</span>
            <ExternalLink className="w-3 h-3 text-white/40" />
          </a>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-editorial italic text-2xl text-white">
              {account.name}
            </h4>
            <p className="font-ui text-xs text-white/70 mt-1 leading-relaxed">
              {account.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-ui pt-1">
            <div className="liquid-glass p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-white/40 block">Industry</span>
              <span className="text-white font-medium truncate block mt-0.5">{account.industry}</span>
            </div>
            <div className="liquid-glass p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-white/40 block">Company Size</span>
              <span className="text-white font-medium truncate block mt-0.5">{account.size}</span>
            </div>
            <div className="liquid-glass p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-white/40 block">Location</span>
              <span className="text-white font-medium truncate block mt-0.5">{account.location}</span>
            </div>
            <div className="liquid-glass p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-white/40 block">Source</span>
              <span className="text-white font-medium truncate block mt-0.5">{account.source || 'AI Ingestion'}</span>
            </div>
          </div>

          {/* Tech Stack */}
          {account.techStack && account.techStack.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                Observed Tech Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {account.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded text-[11px] font-ui bg-white/[0.04] text-white/70 border border-white/[0.08]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Contact Card */}
      <PrimaryContactCard
        contact={primaryContact}
        opportunity={opportunity}
        account={account}
        onSelectContactForOutreach={onSelectContactForOutreach}
      />

      {/* 3. Signals Overview */}
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            DETECTED SIGNALS
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Active</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Product launch', 'VP Marketing Hire', 'Team growth', 'Enterprise push'].map((sig) => (
            <span
              key={sig}
              className="px-2.5 py-1 rounded-lg text-xs font-ui bg-white/[0.06] text-white/80 border border-white/10"
            >
              {sig}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Research Status & Data Confidence */}
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            RESEARCH STATUS
          </span>
          <span className="text-[11px] font-ui text-white/40">Updated 2h ago</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-ui">
            <span className="text-white/60">Sources reviewed</span>
            <span className="font-mono text-white font-medium">7 sources</span>
          </div>
          <div className="flex items-center justify-between text-xs font-ui">
            <span className="text-white/60">Active signals</span>
            <span className="font-mono text-white font-medium">{evidence.length} verified</span>
          </div>
          <div className="flex items-center justify-between text-xs font-ui">
            <span className="text-white/60">Data confidence</span>
            <span className="font-mono text-emerald-400 font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>High (94%)</span>
            </span>
          </div>

          <p className="text-[11px] font-ui text-white/50 leading-relaxed pt-1">
            Most key company, executive, and intent data points have fresh corroborating evidence.
          </p>

          <button
            onClick={onRefreshResearch}
            disabled={isRefreshing}
            className="w-full mt-2 py-2 px-3 rounded-xl liquid-glass text-xs font-ui text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing research…' : 'Refresh research'}</span>
          </button>

          {onViewResearch && (
            <button
              onClick={onViewResearch}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-ui text-white/90 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Evidence Workspace →</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Notes Section */}
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            YOUR NOTES
          </span>
          <span className="text-[11px] font-mono text-white/40">{notes?.length || 0}</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveNote} className="space-y-2">
          <textarea
            rows={3}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add context from calls, referrals, or your own research…"
            className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-ui placeholder:text-white/30 focus:outline-none focus:border-white/40 leading-relaxed resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-ui font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Save note
            </button>
          </div>
        </form>

        {/* Notes List */}
        {notes && notes.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-white/[0.04]">
            {notes.map((n) => (
              <div key={n.id} className="liquid-glass p-3 rounded-xl border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Alex</span>
                  <span>{n.createdAt}</span>
                </div>
                <p className="text-xs font-ui text-white/80 leading-relaxed">
                  {n.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Dismiss / Not a fit Action */}
      <div className="pt-2">
        <button
          onClick={onDismiss}
          className="w-full py-2.5 px-4 rounded-xl liquid-glass text-xs font-ui text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Mark as Not a fit</span>
        </button>
      </div>
    </div>
  );
};
