import React, { useState } from 'react';
import { OutreachDraft } from '../../types';
import { Sparkles, Copy, Check, Edit3, Trash2, Send, RotateCw, CheckCircle2 } from 'lucide-react';

interface OutreachDossierCardProps {
  draft?: OutreachDraft;
  accountName: string;
  contactName: string;
  onGenerateOutreach: () => void;
  onSaveDraft: (draft: Partial<OutreachDraft>) => void;
  onUseDraft: (draft: OutreachDraft) => void;
  isGenerating?: boolean;
}

export const OutreachDossierCard: React.FC<OutreachDossierCardProps> = ({
  draft,
  accountName,
  contactName,
  onGenerateOutreach,
  onSaveDraft,
  onUseDraft,
  isGenerating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(draft?.subject || '');
  const [editedBody, setEditedBody] = useState(draft?.body || '');
  const [copied, setCopied] = useState(false);

  // Sync edits when draft updates
  React.useEffect(() => {
    if (draft) {
      setEditedSubject(draft.subject);
      setEditedBody(draft.body);
    }
  }, [draft]);

  const handleCopy = () => {
    if (!draft) return;
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onUseDraft(draft);
  };

  const handleSaveEdit = () => {
    onSaveDraft({
      subject: editedSubject,
      body: editedBody,
    });
    setIsEditing(false);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
            OUTREACH
          </span>
          <h3 className="font-editorial italic text-xl sm:text-2xl text-white mt-0.5">
            Personalized Conversation Starter
          </h3>
        </div>

        {draft && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-white/40 uppercase">
              {draft.channel} · {draft.tone}
            </span>
          </div>
        )}
      </div>

      {!draft ? (
        <div className="py-8 text-center space-y-3 liquid-glass rounded-xl border border-white/[0.04]">
          <p className="font-ui text-sm text-white/60">
            No outreach draft generated for {accountName} yet.
          </p>
          <button
            onClick={onGenerateOutreach}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-ui text-xs sm:text-sm font-medium hover:bg-white/90 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Drafting outreach…' : 'Generate personalized outreach'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Draft Preview / Editor */}
          <div className="liquid-glass rounded-xl p-4 sm:p-5 border border-white/10 space-y-3">
            {/* Subject */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                Subject
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none focus:border-white/40"
                />
              ) : (
                <div className="font-ui text-sm font-medium text-white">
                  {draft.subject}
                </div>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Body */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                Message Body
              </span>
              {isEditing ? (
                <textarea
                  rows={9}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white font-ui focus:outline-none focus:border-white/40 leading-relaxed font-sans"
                />
              ) : (
                <div className="font-ui text-sm text-white/85 whitespace-pre-line leading-relaxed">
                  {draft.body}
                </div>
              )}
            </div>

            {/* Cited evidence footer */}
            {draft.citedEvidence && draft.citedEvidence.length > 0 && (
              <div className="pt-2 border-t border-white/[0.04] text-[11px] font-ui text-white/50 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase text-white/30">Grounding:</span>
                {draft.citedEvidence.map((ev, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/[0.04] text-white/70 border border-white/[0.06]">
                    {ev}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-ui font-medium text-xs sm:text-sm hover:bg-white/90 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Use draft</span>
                  </>
                )}
              </button>

              <button
                onClick={onGenerateOutreach}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-white/80 hover:text-white hover:bg-white/10 transition-colors font-ui text-xs sm:text-sm border border-white/10 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Regenerating…' : 'Regenerate'}</span>
              </button>

              {isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors font-ui text-xs sm:text-sm cursor-pointer"
                >
                  Save changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-white/70 hover:text-white hover:bg-white/10 transition-colors font-ui text-xs sm:text-sm border border-white/10 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <span className="text-[11px] font-ui text-white/40">
              ~{draft.estimatedReadTimeSec || 25}s read time
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
