export type OpportunityStage =
  | 'NEW'
  | 'RESEARCHING'
  | 'QUALIFIED'
  | 'PRIORITIZED'
  | 'READY'
  | 'OUTREACH_DRAFTED'
  | 'CONTACTED'
  | 'FOLLOW_UP_DUE'
  | 'REPLIED'
  | 'MEETING_BOOKED'
  | 'QUOTED'
  | 'WON'
  | 'LOST'
  | 'NURTURE';

export type PrioritizationMode = 'AI_DYNAMIC' | 'SCORE' | 'DEADLINES' | 'FRESH_SIGNALS';

export interface ScoreBreakdown {
  fit: number;
  need: number;
  timing: number;
  commercial: number;
  evidenceQuality: number;
  riskPenalty: number;
}

export interface NextAction {
  actionType: 'OUTREACH' | 'FOLLOW_UP' | 'RESEARCH' | 'DISCOVERY_CALL' | 'SEND_PROPOSAL';
  actionText: string;
  reason: string;
  dueAt: string;
  urgency: 'IMMEDIATE' | 'TODAY' | 'THIS_WEEK';
  confidence: number;
}

export interface EvidenceItem {
  id: string;
  opportunityId: string;
  accountId: string;
  claim: string;
  claimType: 'HIRING' | 'TECH_STACK' | 'FUNDING' | 'EXPANSION' | 'WEBSITE' | 'LEADERSHIP' | 'PRODUCT_LAUNCH';
  sourceUrl: string;
  sourceDomain: string;
  observedAt: string;
  capturedAt: string;
  confidence: number;
  whyItMatters: string;
  isDisputed?: boolean;
}

export interface Contact {
  id: string;
  accountId: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  isPrimary?: boolean;
}

export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  source: string;
  description: string;
  techStack: string[];
  createdAt: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  primaryContactId: string;
  stage: OpportunityStage;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  confidence: number;
  whyNow: string;
  nextAction: NextAction;
  tags: string[];
  lastResearchedAt: string;
  createdAt: string;
  updatedAt: string;
  // Dynamic AI Prioritization extensions
  dynamicScore?: number;
  priorityReasons?: string[];
  unreadSignalsCount?: number;
  approachingDeadlineHours?: number;
  interactionCount?: number;
}

export interface OutreachDraft {
  id: string;
  opportunityId: string;
  channel: 'Email' | 'LinkedIn' | 'Pitch Note';
  subject: string;
  body: string;
  citedEvidence: string[];
  rationale: string;
  status: 'DRAFT' | 'APPROVED' | 'LOGGED';
  tone: 'Founder Direct' | 'Consultative' | 'Concise' | 'Case Study';
  estimatedReadTimeSec: number;
  createdAt: string;
  approvedAt?: string;
}

export interface Task {
  id: string;
  opportunityId: string;
  accountName: string;
  title: string;
  dueAt: string;
  status: 'DUE' | 'OVERDUE' | 'COMPLETED' | 'SNOOZED';
  reason: string;
  assignee: string;
}

export interface Activity {
  id: string;
  opportunityId: string;
  type:
    | 'OPPORTUNITY_CREATED'
    | 'RESEARCH_COMPLETED'
    | 'SCORE_UPDATED'
    | 'OUTREACH_DRAFTED'
    | 'OUTREACH_APPROVED'
    | 'OUTREACH_SENT'
    | 'TASK_CREATED'
    | 'TASK_COMPLETED'
    | 'STAGE_CHANGED'
    | 'REPLY_RECEIVED'
    | 'MEETING_BOOKED'
    | 'NOTE_ADDED'
    | 'DISMISSED';
  actorType: 'AI' | 'USER';
  actorName: string;
  description: string;
  happenedAt: string;
  metadata?: Record<string, any>;
}

export interface ICPProfile {
  id: string;
  name: string;
  summary: string;
  naturalLanguageDefinition: string;
  criteria: {
    industries: string[];
    companySize: string[];
    geography: string[];
    buyerRoles: string[];
    buyingSignals: string[];
    exclusions: string[];
    inferredAssumptions: string[];
  };
  active: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'ACT_NOW' | 'FYI' | 'SYSTEM';
  title: string;
  description: string;
  opportunityId?: string;
  read: boolean;
  createdAt: string;
}

export interface ResearchRun {
  id: string;
  opportunityId: string;
  accountName: string;
  status: 'QUEUED' | 'RESEARCHING' | 'COMPLETE' | 'PARTIAL' | 'FAILED';
  currentStep: string;
  progressPercent: number;
  findingsCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface WorkspaceSettings {
  name: string;
  businessProfile: string;
  primaryService: string;
  teamSize: string;
  website: string;
  scoringWeights: {
    fit: number;
    timing: number;
    needSignal: number;
    evidenceQuality: number;
    relationship: number;
  };
}

export interface OnboardingData {
  workspaceName: string;
  whatYouSell: string;
  whoYouSellTo: string;
  geographies: string[];
  customGeography?: string;
  website?: string;
}

export interface StructuredICP {
  customerType: string;
  companySize: string[];
  industries: string[];
  geography: string[];
  decisionMakers: string[];
  businessPain: string;
  offerFit: string;
  confidence: number;
  reasoning: {
    number: string;
    title: string;
    description: string;
  }[];
  assumptions: {
    id: string;
    text: string;
    status: 'accepted' | 'pending';
  }[];
}
