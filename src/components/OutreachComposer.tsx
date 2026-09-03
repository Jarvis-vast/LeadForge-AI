import React, { useState, useEffect } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import { OutreachDraft } from '../types';
import {
  X,
  Sparkles,
  Send,
  ShieldCheck,
  RotateCw,
  CheckCircle,
  Copy,
  ExternalLink,
  Sliders,
} from 'lucide-react';

export const OutreachComposer: React.FC = () => {
  const {
    outreachModalOpen,
    setOutreachModalOpen,
    selectedOpportunityId,
    opportunities,
    accounts,
    contacts,
    evidence,
    drafts,
    saveOutreachDraft,
    approveOutreachDraft,
    generateOutreachWithAI,
    isAIWorking,
    aiWorkingMessage,
  } = useLeadForge();

  const opp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];
  const account = accounts.find((a) => a.id === opp?.accountId);
  const contact = contacts.find((c) => c.id === opp?.primaryContactId);
  const oppEvidence = evidence.filter((e) => e.opportunityId === opp?.id);

  const currentDraft = opp ? drafts[opp.id] : undefined;

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState<OutreachDraft['tone']>('Founder Direct');
  const [channel, setChannel] = useState<OutreachDraft['channel']>('Email');
  const [copied, setCopied] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  useEffect(() => {
    if (currentDraft) {
      setSubject(currentDraft.subject || '');
      setBody(currentDraft.body || '');
      setTone(currentDraft.tone || 'Founder Direct');
      setChannel(currentDraft.channel || 'Email');
    } else if (opp && account) {
      // Initialize default draft template if none exists
      const defaultSub = `Quick thought on ${account.name}'s scaling velocity`;
      const defaultBody = `Hi ${contact?.name?.split(' ')[0] || 'there'},\n\nSaw that ${account.name} recently announced new product updates and opened senior engineering roles.\n\nWe specialize in helping high-growth technical teams accelerate execution without pulling internal leadership into hiring bottlenecks.\n\nWould it be useful if I sent over a 2-minute breakdown of how we solved this for a similar engineering team?\n\nBest,\nAlex`;
      setSubject(defaultSub);
      setBody(defaultBody);
    }
  }, [currentDraft, opp, account, contact]);

  if (!outreachModalOpen || !opp) return null;

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(10, Math.round((wordCount / 200) * 60));

  const handleSave = () => {
    saveOutreachDraft(opp.id, {
      subject,
      body,
      tone,
      channel,
      estimatedReadTimeSec: estimatedSeconds,
    });
  };

  const handleApprove = () => {
    handleSave();
    approveOutreachDraft(opp.id);
    setApprovedSuccess(true);
    setTimeout(() => {
      setApprovedSuccess(false);
      setOutreachModalOpen(false);
    }, 1200);
  };

  const handleRegenerate = async () => {
    await generateOutreachWithAI(opp.id, tone, channel);
  };

  const handleCopy = () => {
    const textToCopy = `${channel === 'Email' ? `Subject: ${subject}\n\n` : ''}${body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel-elevated border border-white/[0.15] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/10 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial italic text-2xl text-white">
                  Evidence-Grounded Outreach Composer
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  {channel}
                </span>
              </div>
              <p className="text-xs font-ui text-white/50">
                Crafting peer-to-peer message for {contact?.name} ({contact?.title} at {account?.name})
              </p>
            </div>
          </div>

          <button
            onClick={() => setOutreachModalOpen(false)}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Context (Evidence Left, Editor Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {/* Left 4 Cols: Grounded Evidence Rail */}
          <div className="md:col-span-4 p-5 space-y-4 bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-ui uppercase tracking-wider font-semibold text-white/60">
                Grounding Evidence
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {oppEvidence.length} verified
              </span>
            </div>

            <p className="text-xs font-ui text-white/50 leading-relaxed font-light">
              Every outreach claim must cite one of these verified signals. In V1, all external actions require explicit human review.
            </p>

            <div className="space-y-2.5">
              {oppEvidence.map((evi) => (
                <div
                  key={evi.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-ui space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="font-mono uppercase">{evi.claimType}</span>
                    <span>{evi.observedAt}</span>
                  </div>
                  <div className="text-white/90 font-medium leading-snug">
                    {evi.claim}
                  </div>
                  <div className="text-[11px] text-white/50 truncate font-light flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{evi.sourceDomain}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 8 Cols: Interactive Message Editor */}
          <div className="md:col-span-8 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Controls Bar: Channel & Tone */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-ui text-white/40">Channel:</span>
                  {(['Email', 'LinkedIn', 'Pitch Note'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={`px-3 py-1 rounded-full text-xs font-ui transition-all ${
                        channel === ch
                          ? 'glass-pill-active text-white'
                          : 'glass-pill text-white/50 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-ui text-white/40">Tone:</span>
                  {(['Founder Direct', 'Consultative', 'Concise', 'Case Study'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-ui transition-all ${
                        tone === t
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input (if Email) */}
              {channel === 'Email' && (
                <div>
                  <label className="text-xs font-ui text-white/50 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                    placeholder="Subject line..."
                  />
                </div>
              )}

              {/* Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-ui text-white/50">
                    Message Body
                  </label>
                  <div className="text-[11px] font-mono text-white/40">
                    {wordCount} words • ~{estimatedSeconds}s read time
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 leading-relaxed font-light transition-all resize-none"
                  placeholder="Draft your personalized message..."
                />
              </div>

              {/* Rationale display */}
              {currentDraft?.rationale && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs font-ui text-white/60">
                  <span className="font-semibold text-white/70 block text-[10px] uppercase tracking-wider mb-0.5">
                    AI Strategy Rationale:
                  </span>
                  {currentDraft.rationale}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isAIWorking}
                  className="px-3.5 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-xs font-ui text-white/80 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAIWorking ? 'animate-spin' : ''}`} />
                  <span>{isAIWorking ? 'Generating...' : 'Regenerate with AI'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] text-xs font-ui text-white/60 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSave();
                    setOutreachModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-full glass-pill text-xs font-ui text-white/70 hover:text-white transition-all"
                >
                  Save Draft
                </button>

                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center gap-1.5 shadow-md hover:shadow-white/20 transition-all"
                >
                  {approvedSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Approved & Logged!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Log Outbound</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
