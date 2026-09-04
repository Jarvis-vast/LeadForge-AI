import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLeadForge } from '../context/LeadForgeContext';
import { Contact, OutreachDraft } from '../types';
import { DossierHeader } from './dossier/DossierHeader';
import { PipelineProgression } from './dossier/PipelineProgression';
import { EvidenceTimeline } from './dossier/EvidenceTimeline';
import { AITrustCard } from './dossier/AITrustCard';
import { ScoreBreakdownCard } from './dossier/ScoreBreakdownCard';
import { RecommendedActionCard } from './dossier/RecommendedActionCard';
import { PeopleCard } from './dossier/PeopleCard';
import { OutreachDossierCard } from './dossier/OutreachDossierCard';
import { ActivityCard } from './dossier/ActivityCard';
import { FollowUpCard } from './dossier/FollowUpCard';
import { IntelligenceRail } from './dossier/IntelligenceRail';
import { DismissModal } from './dossier/DismissModal';
import { ScheduleFollowUpModal } from './dossier/ScheduleFollowUpModal';
import { ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

export const OpportunityDetail: React.FC = () => {
  const {
    selectedOpportunityId,
    setSelectedOpportunityId,
    opportunities,
    accounts,
    contacts,
    evidence,
    drafts,
    tasks,
    activities,
    notes,
    addOpportunityNote,
    dismissOpportunity,
    updateOpportunityStage,
    updateOpportunityScore,
    saveOutreachDraft,
    approveOutreachDraft,
    generateOutreachWithAI,
    completeTask,
    snoozeTask,
    addTask,
    runResearchOnAccount,
    disputeEvidence,
    isAIWorking,
  } = useLeadForge();

  // Modals state
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isRefreshingResearch, setIsRefreshingResearch] = useState(false);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);

  // Selected opportunity resolution
  const opp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

  if (!opp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="font-ui text-sm text-white/50">
          No opportunity selected or opportunity was dismissed.
        </p>
        <button
          onClick={() => setSelectedOpportunityId(opportunities[0]?.id || null)}
          className="px-4 py-2 rounded-xl bg-white text-black text-xs font-ui font-medium cursor-pointer"
        >
          View queue
        </button>
      </div>
    );
  }

  const account =
    accounts.find((a) => a.id === opp.accountId) || {
      id: opp.accountId,
      name: 'Acme SaaS',
      domain: 'acme.io',
      industry: 'B2B SaaS',
      size: '51–100 employees',
      location: 'San Francisco, CA',
      source: 'AI Pipeline Discovery',
      description: 'Enterprise workflow software for growing revenue teams.',
      techStack: ['Next.js', 'PostgreSQL', 'Stripe', 'AWS', 'OpenAI'],
      createdAt: new Date().toISOString(),
    };

  const oppEvidence = evidence.filter((e) => e.opportunityId === opp.id);
  const oppContacts = contacts.filter((c) => c.accountId === account.id);
  const primaryContact = oppContacts.find((c) => c.id === opp.primaryContactId) || oppContacts[0];
  const oppDraft = drafts[opp.id];
  const oppTasks = tasks.filter((t) => t.opportunityId === opp.id);
  const oppActivities = activities.filter((a) => a.opportunityId === opp.id);
  const oppNotes = notes[opp.id] || [];

  // Action handlers
  const handleTakeNextAction = () => {
    // Scroll to or highlight outreach/next action
    const outreachSection = document.getElementById('outreach-section');
    if (outreachSection) {
      outreachSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerateOutreach = async () => {
    setIsGeneratingOutreach(true);
    await generateOutreachWithAI(opp.id, 'Founder Direct', 'Email');
    setIsGeneratingOutreach(false);
    const el = document.getElementById('outreach-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectContactForOutreach = (contact: Contact) => {
    saveOutreachDraft(opp.id, {
      subject: `Quick thought on ${account.name}'s enterprise expansion`,
      body: `Hi ${contact.name.split(' ')[0]},\n\nI noticed ${account.name} recently launched its enterprise tier while building out the team.\n\nWhen scaling to mid-market and enterprise deals, driving consistent high-intent pipeline without draining engineering or founder bandwidth is usually the key constraint.\n\nWe help B2B software companies build targeted outbound systems that consistently book qualified discovery conversations.\n\nWould you be open to a brief 10-minute exchange on how you're approaching outbound pipeline this quarter?\n\nBest,\nAlex`,
    });
    const el = document.getElementById('outreach-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUseDraft = (draft: OutreachDraft) => {
    approveOutreachDraft(opp.id);
  };

  const handleRefreshResearch = async () => {
    setIsRefreshingResearch(true);
    await runResearchOnAccount(opp.id);
    setIsRefreshingResearch(false);
  };

  const handleConfirmDismiss = (reason: string, note?: string) => {
    dismissOpportunity(opp.id, reason, note);
  };

  const handleScheduleFollowUp = (dueAt: string, title: string, reason: string) => {
    addTask({
      opportunityId: opp.id,
      accountName: account.name,
      title,
      dueAt,
      status: 'DUE',
      reason,
      assignee: 'Alex (You)',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24"
    >
      {/* 1. Opportunity Header */}
      <DossierHeader
        opportunity={opp}
        account={account}
        onTakeAction={handleTakeNextAction}
        onGenerateOutreach={handleGenerateOutreach}
        onScheduleFollowUp={() => setScheduleModalOpen(true)}
        onDismiss={() => setDismissModalOpen(true)}
      />

      {/* 2. Pipeline Progression */}
      <PipelineProgression
        currentStage={opp.stage}
        onSelectStage={(newStage) => updateOpportunityStage(opp.id, newStage)}
      />

      {/* 3. Two-Column Intelligence Dossier Layout (approx 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (~65%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 12: Next Best Action Card */}
          <RecommendedActionCard
            nextAction={opp.nextAction}
            onStartOutreach={handleTakeNextAction}
            onMarkComplete={() => {
              const activeTsk = oppTasks.find((t) => t.status === 'DUE');
              if (activeTsk) completeTask(activeTsk.id);
            }}
          />

          {/* Section 8 & 9: Why This Opportunity & Evidence Timeline */}
          <EvidenceTimeline
            evidence={oppEvidence}
            whyNow={opp.whyNow}
            onDispute={disputeEvidence}
          />

          {/* Section 10 & 32: AI Opportunity Explanation (AI Trust Rule) */}
          <AITrustCard confidence={opp.confidence ? Math.round(opp.confidence * 100) : 94} />

          {/* Section 11: Score Breakdown */}
          <ScoreBreakdownCard score={opp.score} breakdown={opp.scoreBreakdown} />

          {/* Section 13 & 14: People (Contacts & Contact Priority) */}
          <PeopleCard
            contacts={oppContacts}
            primaryContactId={opp.primaryContactId}
            onSelectContactForOutreach={handleSelectContactForOutreach}
          />

          {/* Section 15 & 16: Outreach Composer / Preview */}
          <div id="outreach-section">
            <OutreachDossierCard
              draft={oppDraft}
              accountName={account.name}
              contactName={primaryContact?.name || 'Alex Morgan'}
              onGenerateOutreach={handleGenerateOutreach}
              onSaveDraft={(data) => saveOutreachDraft(opp.id, data)}
              onUseDraft={handleUseDraft}
              isGenerating={isGeneratingOutreach}
            />
          </div>

          {/* Section 18: Follow-up Status */}
          <FollowUpCard
            tasks={oppTasks}
            onScheduleFollowUp={() => setScheduleModalOpen(true)}
            onCompleteTask={completeTask}
            onSnoozeTask={snoozeTask}
          />

          {/* Section 17: Activity Timeline */}
          <ActivityCard activities={oppActivities} />
        </div>

        {/* Intelligence Rail (~35%) */}
        <div className="lg:col-span-4 space-y-6">
          <IntelligenceRail
            account={account}
            opportunity={opp}
            evidence={oppEvidence}
            notes={oppNotes}
            onAddNote={(text) => addOpportunityNote(opp.id, text)}
            onRefreshResearch={handleRefreshResearch}
            onDismiss={() => setDismissModalOpen(true)}
            isRefreshing={isRefreshingResearch}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile View (Section 26 & 28 Responsive behavior) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 liquid-glass-strong border-t border-white/20 z-40 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="font-editorial italic text-2xl text-white">{opp.score}</span>
          <div className="text-left leading-none">
            <span className="text-[9px] font-mono uppercase text-white/50 block">Score</span>
            <span className="text-xs font-ui text-white font-medium truncate max-w-[120px] block">
              {account.name}
            </span>
          </div>
        </div>

        <button
          onClick={handleTakeNextAction}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-ui font-medium text-xs hover:bg-white/90 transition-all flex items-center gap-1.5 cursor-pointer shadow"
        >
          <span>Take next action</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modals */}
      <DismissModal
        isOpen={dismissModalOpen}
        accountName={account.name}
        onClose={() => setDismissModalOpen(false)}
        onConfirmDismiss={handleConfirmDismiss}
      />

      <ScheduleFollowUpModal
        isOpen={scheduleModalOpen}
        accountName={account.name}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleScheduleFollowUp}
      />
    </motion.div>
  );
};
