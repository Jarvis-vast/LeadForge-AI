import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const FocusModeModal: React.FC = () => {
  const {
    isFocusModeOpen,
    exitFocusMode,
    focusOpportunityId,
    setFocusOpportunityId,
    opportunities,
    accounts,
    contacts,
    evidence,
    openOpportunityDetail,
    setOutreachModalOpen,
    setSelectedOpportunityId,
    updateOpportunityStage,
    completeTask,
    tasks,
  } = useLeadForge();

  // Filter top active opportunities for the sprint queue
  const activeOpportunities = opportunities
    .filter((o) => o.stage !== 'WON' && o.stage !== 'LOST')
    .sort((a, b) => (b.dynamicScore || b.score) - (a.dynamicScore || a.score))
    .slice(0, 5);

  const currentOppIndex = activeOpportunities.findIndex(
    (o) => o.id === focusOpportunityId
  );
  const currentOpp =
    activeOpportunities[currentOppIndex !== -1 ? currentOppIndex : 0] ||
    activeOpportunities[0];

  const currentAccount = accounts.find((a) => a.id === currentOpp?.accountId);
  const currentContact = contacts.find((c) => c.id === currentOpp?.primaryContactId);
  const currentEvidence = evidence.filter((e) => e.opportunityId === currentOpp?.id);

  // Timer State (default 15 minutes = 900s)
  const [initialSeconds, setInitialSeconds] = useState(900);
  const [secondsLeft, setSecondsLeft] = useState(900);
  const [isRunning, setIsRunning] = useState(false);
  const [actionDoneNotification, setActionDoneNotification] = useState(false);

  // Sync focus id if not set
  useEffect(() => {
    if (isFocusModeOpen && !focusOpportunityId && activeOpportunities.length > 0) {
      setFocusOpportunityId(activeOpportunities[0].id);
    }
  }, [isFocusModeOpen, focusOpportunityId, activeOpportunities, setFocusOpportunityId]);

  // Timer countdown tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFocusModeOpen) return;
      if (e.key === 'Escape') {
        exitFocusMode();
      } else if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        goToPrev();
      }
    },
    [isFocusModeOpen, exitFocusMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isFocusModeOpen || !currentOpp) return null;

  const goToNext = () => {
    const nextIdx = (currentOppIndex + 1) % activeOpportunities.length;
    setFocusOpportunityId(activeOpportunities[nextIdx].id);
  };

  const goToPrev = () => {
    const prevIdx =
      (currentOppIndex - 1 + activeOpportunities.length) % activeOpportunities.length;
    setFocusOpportunityId(activeOpportunities[prevIdx].id);
  };

  const handleExecuteAction = () => {
    setSelectedOpportunityId(currentOpp.id);
    if (currentOpp.nextAction.actionType === 'OUTREACH') {
      setOutreachModalOpen(true);
    } else {
      openOpportunityDetail(currentOpp.id);
      exitFocusMode();
    }
  };

  const handleMarkActionComplete = () => {
    // Complete any pending tasks related to this opp
    const relatedTask = tasks.find(
      (t) => t.opportunityId === currentOpp.id && (t.status === 'DUE' || t.status === 'OVERDUE')
    );
    if (relatedTask) {
      completeTask(relatedTask.id);
    }

    // Advance stage if applicable
    if (currentOpp.stage === 'PRIORITIZED') {
      updateOpportunityStage(currentOpp.id, 'READY');
    }

    setActionDoneNotification(true);
    setTimeout(() => {
      setActionDoneNotification(false);
      if (activeOpportunities.length > 1) {
        goToNext();
      }
    }, 1200);
  };

  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 select-none overflow-y-auto">
        {/* Deep Dimming Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={exitFocusMode}
          className="fixed inset-0 bg-black/92 backdrop-blur-xl"
        />

        {/* Ambient Subtle Radial Glow behind active card */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[120px]" />
        </div>

        {/* Central Focus Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-3xl rounded-[28px] liquid-glass-strong border border-white/[0.16] shadow-2xl p-6 sm:p-8 md:p-10 space-y-6"
        >
          {/* Top Bar: Mode indicator, Timer, Exit */}
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            {/* Left: Sprint Queue progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-white text-[11px] font-ui tracking-wider uppercase">
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Focus Sprint</span>
              </div>
              <span className="text-xs font-mono text-white/50">
                Opportunity {currentOppIndex + 1} of {activeOpportunities.length}
              </span>
            </div>

            {/* Center/Right: Interactive Countdown Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.10]">
                <Clock className="w-3.5 h-3.5 text-white/60" />
                <span className="font-mono text-sm sm:text-base font-semibold text-white tracking-wider">
                  {formatTime(secondsLeft)}
                </span>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
                  title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsLeft(initialSeconds);
                  }}
                  className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSecondsLeft((prev) => prev + 300)}
                  className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-mono"
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>

              {/* Close / Exit Button */}
              <button
                onClick={exitFocusMode}
                className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Exit Focus Mode (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Linear subtle timer progress */}
          <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden -mt-3">
            <div
              className="bg-white/80 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>

          {/* Opportunity Header Spotlight */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-ui font-semibold text-2xl sm:text-3xl text-white tracking-tight">
                  {currentAccount?.name}
                </h2>
                <a
                  href={`https://${currentAccount?.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-ui text-white/50 hover:text-white flex items-center gap-1"
                >
                  <span>{currentAccount?.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60 font-ui flex-wrap pt-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/80">
                  {currentAccount?.industry}
                </span>
                <span>•</span>
                <span>{currentAccount?.size}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/70" />
                  {currentEvidence.length} verified signals
                </span>
                {currentContact && (
                  <>
                    <span>•</span>
                    <span className="text-white/60">
                      Target: {currentContact.name} ({currentContact.title})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Score Block */}
            <div className="shrink-0 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-right self-start">
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-editorial italic text-3xl sm:text-4xl text-white leading-none">
                  {currentOpp.score}
                </span>
                <span className="text-xs text-white/40 font-ui">/100</span>
              </div>
              <div className="text-[10px] font-ui uppercase tracking-wider text-white/50 mt-1">
                Opp Score
              </div>
            </div>
          </div>

          {/* Section 1: "Why this opportunity matters" */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-ui font-medium uppercase tracking-wider text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Why it matters right now</span>
            </div>
            <p className="font-ui text-sm sm:text-base text-white/90 leading-relaxed font-light">
              {currentOpp.whyNow}
            </p>

            {/* Signal pill snippets */}
            {currentEvidence.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {currentEvidence.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="text-[11px] font-ui text-white/60 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="truncate max-w-xs">{ev.claim}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: "Recommended Action" HERO CARD */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.05] border border-white/[0.18] space-y-4 shadow-lg luminous-edge">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-black font-ui font-semibold text-[11px] uppercase tracking-wider">
                  Recommended Action
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  Due: {currentOpp.nextAction.dueAt}
                </span>
              </div>
              <span className="text-[11px] font-ui px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/[0.12]">
                Urgency: {currentOpp.nextAction.urgency}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-ui font-medium text-base sm:text-lg text-white leading-snug">
                {currentOpp.nextAction.actionText}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-ui font-light">
                {currentOpp.nextAction.reason}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteAction}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-ui font-medium text-xs hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md"
                >
                  <span>Execute Recommended Action</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleMarkActionComplete}
                  className="px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 active:scale-[0.98] text-white font-ui text-xs transition-all flex items-center gap-1.5 border border-white/[0.12]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                  <span>Mark Done & Advance</span>
                </button>
              </div>

              <button
                onClick={() => {
                  openOpportunityDetail(currentOpp.id);
                  exitFocusMode();
                }}
                className="text-xs font-ui text-white/50 hover:text-white transition-colors flex items-center gap-1 self-end sm:self-auto"
              >
                <span>Open Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action completion toast indicator */}
          <AnimatePresence>
            {actionDoneNotification && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 rounded-xl bg-white/[0.10] border border-white/20 text-center text-xs font-ui text-white flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Action completed. Advancing to next priority pursuit...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Controls: Queue Navigation & Keyboard Shortcuts */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs font-ui text-white/40">
            {/* Prev / Next Queue navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="p-1.5 rounded-full glass-pill hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Previous Opportunity (Ctrl+Left)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {activeOpportunities.map((opp, idx) => (
                  <button
                    key={opp.id}
                    onClick={() => setFocusOpportunityId(opp.id)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentOppIndex
                        ? 'w-6 bg-white'
                        : 'w-2 bg-white/20 hover:bg-white/50'
                    }`}
                    title={`Opportunity ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-1.5 rounded-full glass-pill hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Next Opportunity (Ctrl+Right)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-white/35">
              <span>Space: Play/Pause</span>
              <span>•</span>
              <span>Esc: Exit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
