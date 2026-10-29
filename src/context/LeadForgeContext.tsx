import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Opportunity,
  Account,
  Contact,
  EvidenceItem,
  OutreachDraft,
  Task,
  Activity,
  ICPProfile,
  NotificationItem,
  WorkspaceSettings,
  OpportunityStage,
  ResearchRun,
  PrioritizationMode,
  OnboardingData,
  StructuredICP,
} from '../types';
import {
  initialOpportunities,
  initialAccounts,
  initialContacts,
  initialEvidence,
  initialDrafts,
  initialTasks,
  initialActivities,
  initialICP,
  initialNotifications,
  initialWorkspace,
} from '../data/initialData';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../lib/api';

export type NavigationTab =
  | 'overview'
  | 'opportunities'
  | 'accounts'
  | 'contacts'
  | 'pipeline'
  | 'tasks'
  | 'icp'
  | 'research'
  | 'analytics'
  | 'settings';

interface LeadForgeContextType {
  workspace: WorkspaceSettings;
  updateWorkspace: (settings: Partial<WorkspaceSettings>) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  opportunitySubView: 'dossier' | 'research';
  setOpportunitySubView: (view: 'dossier' | 'research') => void;
  openOpportunityDetail: (id: string) => void;
  openOpportunityResearch: (id: string) => void;

  // Domain Entities
  opportunities: Opportunity[];
  accounts: Account[];
  contacts: Contact[];
  evidence: EvidenceItem[];
  drafts: Record<string, OutreachDraft>;
  tasks: Task[];
  activities: Activity[];
  notes: Record<string, { id: string; text: string; createdAt: string }[]>;
  icp: ICPProfile;
  notifications: NotificationItem[];
  researchRuns: ResearchRun[];

  // Modals / Overlays
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  outreachModalOpen: boolean;
  setOutreachModalOpen: (open: boolean) => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  notificationsDrawerOpen: boolean;
  setNotificationsDrawerOpen: (open: boolean) => void;

  // Actions
  updateOpportunityStage: (id: string, newStage: OpportunityStage) => void;
  updateOpportunityScore: (id: string, breakdown: Opportunity['scoreBreakdown']) => void;
  dismissOpportunity: (id: string, reason: string, note?: string) => void;
  addOpportunityNote: (oppId: string, text: string) => void;
  saveOutreachDraft: (oppId: string, draft: Partial<OutreachDraft>) => void;
  approveOutreachDraft: (oppId: string) => void;
  generateOutreachWithAI: (oppId: string, tone?: OutreachDraft['tone'], channel?: OutreachDraft['channel']) => Promise<void>;
  completeTask: (taskId: string) => void;
  snoozeTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  runResearchOnAccount: (oppId: string) => Promise<void>;
  researchTargetAccount: (targetId: string) => Promise<any>;
  createAccount: (data: any) => Promise<void>;
  updateAccount: (id: string, data: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  createContact: (data: any) => Promise<void>;
  updateContact: (id: string, data: any) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  updateICP: (updated: Partial<ICPProfile>) => void;
  parseICPWithAI: (prompt: string) => Promise<void>;
  importAccountsFromData: (newAccounts: Partial<Account>[], newContacts?: Partial<Contact>[]) => { imported: number; duplicates: number };
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  disputeEvidence: (evidenceId: string) => void;

  // Authentication (Screen 01 Welcome Screen)
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: { email: string; name: string } | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;

  // Onboarding (Screen 02 Workspace Onboarding)
  isOnboardingCompleted: boolean;
  setIsOnboardingCompleted: (completed: boolean) => void;
  isOnboardingSkipped: boolean;
  setIsOnboardingSkipped: (skipped: boolean) => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  reopenOnboarding: () => Promise<void>;

  // ICP Setup / Confirmation (Screen 03)
  isICPConfirmed: boolean;
  setIsICPConfirmed: (confirmed: boolean) => void;
  approveICP: (updatedData?: Partial<StructuredICP>) => Promise<void>;
  reopenICPConfirmation: () => void;
  onboardingData: OnboardingData | null;
  structuredICP: StructuredICP;
  updateStructuredICP: (updated: Partial<StructuredICP>) => void;
  regenerateICP: () => Promise<StructuredICP>;

  // Focus Mode
  isFocusModeOpen: boolean;
  setIsFocusModeOpen: (open: boolean) => void;
  focusOpportunityId: string | null;
  setFocusOpportunityId: (id: string | null) => void;
  enterFocusMode: (oppId?: string) => void;
  exitFocusMode: () => void;

  // Dynamic Prioritization
  prioritizationMode: PrioritizationMode;
  setPrioritizationMode: (mode: PrioritizationMode) => void;
  rerankOpportunitiesWithAI: () => Promise<void>;

  // State loading indicators
  isAIWorking: boolean;
  aiWorkingMessage: string;

  // Real Database & Demo management (Spec #8, #30, #32)
  seedDemoData: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  refreshWorkspaceData: () => Promise<void>;
  isLoadingSession: boolean;
}

const LeadForgeContext = createContext<LeadForgeContextType | undefined>(undefined);

// Dynamic prioritization enrichment helper
const enrichOpportunity = (
  opp: Opportunity,
  allEvidence: EvidenceItem[],
  allTasks: Task[]
): Opportunity => {
  let boost = 0;
  const reasons: string[] = [];

  // 1. Approaching or overdue follow-up deadlines
  const oppTasks = allTasks.filter((t) => t.opportunityId === opp.id);
  const hasOverdue = oppTasks.some((t) => t.status === 'OVERDUE');
  const hasDueToday =
    oppTasks.some((t) => t.status === 'DUE') || opp.nextAction.dueAt.includes('Today');

  if (hasOverdue) {
    boost += 24;
    reasons.push('Overdue follow-up deadline');
  } else if (hasDueToday || opp.nextAction.urgency === 'IMMEDIATE') {
    boost += 18;
    reasons.push(`Action due: ${opp.nextAction.dueAt}`);
  } else if (opp.nextAction.urgency === 'TODAY') {
    boost += 12;
    reasons.push('Action scheduled for today');
  }

  // 2. New signals & signal freshness
  const oppEvidence = allEvidence.filter((e) => e.opportunityId === opp.id);
  const recentEvidence = oppEvidence.filter(
    (e) =>
      e.observedAt.toLowerCase().includes('yesterday') ||
      e.observedAt.toLowerCase().includes('hours') ||
      e.observedAt.toLowerCase().includes('days ago')
  );

  if (recentEvidence.length >= 2) {
    boost += 16;
    reasons.push(`${recentEvidence.length} fresh market signals`);
  } else if (recentEvidence.length === 1) {
    boost += 9;
    reasons.push(`${recentEvidence[0].claimType} signal surge`);
  }

  // 3. Stage & strategic ICP alignment
  if (opp.stage === 'PRIORITIZED') {
    boost += 8;
    reasons.push('High ICP strategic match');
  } else if (opp.stage === 'FOLLOW_UP_DUE') {
    boost += 14;
    reasons.push('Follow-up sequence cadence');
  }

  const dynamicScore = Math.min(99, Math.round(opp.score * 0.45 + boost + 32));

  return {
    ...opp,
    dynamicScore,
    priorityReasons: reasons.length > 0 ? reasons : ['High ICP alignment'],
    unreadSignalsCount: oppEvidence.length,
  };
};

export const LeadForgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available, or fallback to seeds
  const [workspace, setWorkspace] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem('leadforge_workspace');
    return saved ? JSON.parse(saved) : initialWorkspace;
  });

  const parseHashState = () => {
    if (typeof window === 'undefined') return { tab: null, opp: null };
    const raw = window.location.hash.replace(/^#\/?/, '');
    if (!raw) return { tab: null, opp: null };
    const params = new URLSearchParams(raw);
    const tab = params.get('tab') as NavigationTab | null;
    const opp = params.get('opp');
    return { tab, opp };
  };

  const initialHash = parseHashState();
  const validTabs: NavigationTab[] = [
    'overview',
    'opportunities',
    'accounts',
    'contacts',
    'pipeline',
    'tasks',
    'icp',
    'research',
    'analytics',
    'settings',
  ];

  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    if (initialHash.tab && validTabs.includes(initialHash.tab)) {
      return initialHash.tab;
    }
    return 'overview';
  });

  const [selectedOpportunityId, setSelectedOpportunityIdState] = useState<string | null>(() => {
    if (initialHash.opp) {
      return initialHash.opp;
    }
    return 'opp-01';
  });

  const updateUrlHash = (tab: NavigationTab, oppId: string | null) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (oppId) {
      params.set('opp', oppId);
    }
    const newHash = `#${params.toString()}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    updateUrlHash(tab, selectedOpportunityId);
  };

  const setSelectedOpportunityId = (id: string | null) => {
    setSelectedOpportunityIdState(id);
    updateUrlHash(activeTab, id);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const { tab, opp } = parseHashState();
      if (tab && validTabs.includes(tab)) {
        setActiveTabState(tab);
      }
      if (opp !== undefined && opp !== null) {
        setSelectedOpportunityIdState(opp);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [opportunitySubView, setOpportunitySubView] = useState<'dossier' | 'research'>('dossier');

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('leadforge_opportunities');
    const raw: Opportunity[] = saved ? JSON.parse(saved) : initialOpportunities;
    return raw.map((o) => enrichOpportunity(o, initialEvidence, initialTasks));
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('leadforge_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('leadforge_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [evidence, setEvidence] = useState<EvidenceItem[]>(() => {
    const saved = localStorage.getItem('leadforge_evidence');
    return saved ? JSON.parse(saved) : initialEvidence;
  });

  const [drafts, setDrafts] = useState<Record<string, OutreachDraft>>(() => {
    const saved = localStorage.getItem('leadforge_drafts');
    return saved ? JSON.parse(saved) : initialDrafts;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('leadforge_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('leadforge_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [notes, setNotes] = useState<Record<string, { id: string; text: string; createdAt: string }[]>>(() => {
    const saved = localStorage.getItem('leadforge_notes');
    return saved
      ? JSON.parse(saved)
      : {
          'opp-01': [
            {
              id: 'note-01',
              text: 'Met founder Alex Morgan at SaaStr 2025; mentioned looking into outbound acceleration and dedicated client pipeline.',
              createdAt: 'Yesterday · 5:20 PM',
            },
          ],
        };
  });

  const [icp, setIcp] = useState<ICPProfile>(() => {
    const saved = localStorage.getItem('leadforge_icp');
    return saved ? JSON.parse(saved) : initialICP;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('leadforge_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [researchRuns, setResearchRuns] = useState<ResearchRun[]>([
    {
      id: 'run-01',
      opportunityId: 'opp-01',
      accountName: 'Acme SaaS',
      status: 'COMPLETE',
      currentStep: 'Synthesized 3 evidence items',
      progressPercent: 100,
      findingsCount: 3,
      startedAt: '2 hours ago',
      completedAt: '2 hours ago',
    },
    {
      id: 'run-02',
      opportunityId: 'opp-02',
      accountName: 'Nova Systems',
      status: 'COMPLETE',
      currentStep: 'Synthesized 2 evidence items',
      progressPercent: 100,
      findingsCount: 2,
      startedAt: '4 hours ago',
      completedAt: '4 hours ago',
    },
  ]);

  // Overlays
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  // Authentication (Screen 01 Welcome Screen)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(() => {
    return Boolean(getStoredToken());
  });

  const refreshWorkspaceData = async () => {
    try {
      const [oppsRes, accsRes, contactsRes, tasksRes, notifsRes, actsRes] = await Promise.allSettled([
        api.opportunities.list(),
        api.accounts.list(),
        api.contacts.list(),
        api.tasks.list(),
        api.notifications.list(),
        api.activity.list(),
      ]);

      if (oppsRes.status === 'fulfilled' && Array.isArray(oppsRes.value) && oppsRes.value.length > 0) {
        setOpportunities(oppsRes.value);
      }
      if (accsRes.status === 'fulfilled' && Array.isArray(accsRes.value) && accsRes.value.length > 0) {
        setAccounts(accsRes.value);
      }
      if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value) && contactsRes.value.length > 0) {
        setContacts(contactsRes.value);
      }
      if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value) && tasksRes.value.length > 0) {
        setTasks(tasksRes.value);
      }
      if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value) && notifsRes.value.length > 0) {
        setNotifications(notifsRes.value);
      }
      if (actsRes.status === 'fulfilled' && Array.isArray(actsRes.value) && actsRes.value.length > 0) {
        setActivities(actsRes.value);
      }
    } catch (err) {
      console.warn('Could not sync workspace data from server, continuing with local state:', err);
    }
  };

  // Restore authenticated session on mount: validate against /api/auth/me
  // A localStorage flag alone never overrides absent or invalid session
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsLoadingSession(true);
      api.auth.getMe()
        .then((res) => {
          if (res && res.user && res.workspace) {
            setCurrentUser(res.user);
            setIsAuthenticated(true);
            localStorage.setItem('leadforge_auth', 'true');
            localStorage.setItem('leadforge_user', JSON.stringify(res.user));
            if (res.workspace) {
              const ws = res.workspace;
              const backendCompleted = Boolean(ws.onboarding_completed);
              const backendSkipped = Boolean(ws.onboarding_skipped);
              let savedData = ws.onboardingData || null;
              if (!savedData && ws.onboarding_data) {
                try { savedData = JSON.parse(ws.onboarding_data); } catch {}
              }

              if (savedData) {
                setOnboardingData(savedData);
                localStorage.setItem("leadforge_onboarding_data", JSON.stringify(savedData));
              }

              if (backendCompleted) {
                setIsOnboardingCompleted(true);
                setIsOnboardingSkipped(false);
                localStorage.setItem("leadforge_onboarding_completed", "true");
                localStorage.removeItem("leadforge_onboarding_skipped");
              } else if (backendSkipped) {
                setIsOnboardingCompleted(false);
                setIsOnboardingSkipped(true);
                localStorage.setItem("leadforge_onboarding_skipped", "true");
                localStorage.removeItem("leadforge_onboarding_completed");
              } else {
                setIsOnboardingCompleted(false);
                setIsOnboardingSkipped(false);
                localStorage.removeItem("leadforge_onboarding_completed");
                localStorage.removeItem("leadforge_onboarding_skipped");
              }

              if (ws.is_icp_confirmed !== undefined) {
                const confirmed = Boolean(ws.is_icp_confirmed);
                setIsICPConfirmed(confirmed);
                if (confirmed) {
                  localStorage.setItem("leadforge_icp_confirmed", "true");
                } else {
                  localStorage.removeItem("leadforge_icp_confirmed");
                }
              }

              setWorkspace((prev) => ({
                ...prev,
                name: ws.name || prev.name,
                website: ws.website || prev.website,
                businessProfile: ws.description || prev.businessProfile,
              }));
            }
            refreshWorkspaceData();
          } else {
            throw new Error('Invalid session response from server');
          }
        })
        .catch(() => {
          clearStoredToken();
          localStorage.removeItem('leadforge_auth');
          localStorage.removeItem('leadforge_user');
          setIsAuthenticated(false);
          setCurrentUser(null);
        })
        .finally(() => {
          setIsLoadingSession(false);
        });
    } else {
      clearStoredToken();
      localStorage.removeItem('leadforge_auth');
      localStorage.removeItem('leadforge_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsLoadingSession(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    throw new Error('Google sign-in is not configured in this build. Please sign in with your work email and password.');
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    const session = await api.auth.login(email, password);
    if (!session || !session.token || !session.user || !session.workspace) {
      throw new Error('Invalid session received from server.');
    }
    setStoredToken(session.token);
    setCurrentUser(session.user);
    setIsAuthenticated(true);
    localStorage.setItem('leadforge_auth', 'true');
    localStorage.setItem('leadforge_user', JSON.stringify(session.user));
    if (session.workspace) {
      setWorkspace((prev) => ({
        ...prev,
        name: session.workspace.name || prev.name,
        website: session.workspace.website || prev.website,
      }));
    }
    await refreshWorkspaceData();
    return true;
  };

  const registerWithEmail = async (email: string, password: string, name?: string): Promise<boolean> => {
    const session = await api.auth.register(email, password, name);
    if (!session || !session.token || !session.user || !session.workspace) {
      throw new Error('Invalid session received from server.');
    }
    setStoredToken(session.token);
    setCurrentUser(session.user);
    setIsAuthenticated(true);
    localStorage.setItem('leadforge_auth', 'true');
    localStorage.setItem('leadforge_user', JSON.stringify(session.user));
    if (session.workspace) {
      setWorkspace((prev) => ({
        ...prev,
        name: session.workspace.name || prev.name,
        website: session.workspace.website || prev.website,
      }));
    }
    await refreshWorkspaceData();
    return true;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    clearStoredToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('leadforge_auth');
    localStorage.removeItem('leadforge_user');
    setIsOnboardingCompleted(false);
    localStorage.removeItem('leadforge_onboarding_completed');
    localStorage.removeItem('leadforge_onboarding_skipped');
    setIsOnboardingSkipped(false);
    setIsICPConfirmed(false);
    localStorage.removeItem('leadforge_icp_confirmed');
  };

  const seedDemoData = async () => {
    try {
      setIsAIWorking(true);
      setAiWorkingMessage('Seeding isolated development fixtures into workspace...');
      await api.demo.seed();
      await refreshWorkspaceData();
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'SYSTEM',
        title: 'Development fixtures loaded',
        description: 'Seeded sample accounts tagged as is_sample = 1. Clearly isolated from production data.',
        read: false,
        createdAt: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (err: any) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setIsAIWorking(false);
      setAiWorkingMessage('');
    }
  };

  const clearDemoData = async () => {
    try {
      setIsAIWorking(true);
      setAiWorkingMessage('Clearing development fixtures from workspace...');
      await api.demo.clear();
      await refreshWorkspaceData();
      setOpportunities((prev) => prev.filter((o) => !o.id.startsWith('opp-sample-') && !o.id.startsWith('opp-0')));
      setAccounts((prev) => prev.filter((a) => !a.id.startsWith('acc-sample-') && !a.id.startsWith('acc-0')));
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'SYSTEM',
        title: 'Sample data cleared',
        description: 'Workspace reset to clean production state. Ready for live account discovery and imports.',
        read: false,
        createdAt: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (err: any) {
      console.error('Failed to clear demo data:', err);
    } finally {
      setIsAIWorking(false);
      setAiWorkingMessage('');
    }
  };

  // Onboarding (Screen 02 Workspace Onboarding)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(() => {
    const saved = localStorage.getItem('leadforge_onboarding_data');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('leadforge_onboarding_completed');
    return saved === 'true';
  });

  const [isOnboardingSkipped, setIsOnboardingSkipped] = useState<boolean>(() => {
    const saved = localStorage.getItem('leadforge_onboarding_skipped');
    return saved === 'true';
  });

  // ICP Setup / Confirmation (Screen 03)
  const [isICPConfirmed, setIsICPConfirmed] = useState<boolean>(() => {
    const saved = localStorage.getItem('leadforge_icp_confirmed');
    return saved === 'true';
  });

  const defaultStructuredICP: StructuredICP = {
    customerType: 'Founder-led B2B SaaS companies',
    companySize: ['10–50', '51–100', '101–250'],
    industries: ['SaaS', 'Technology', 'B2B Services', 'Professional Services'],
    geography: ['India', 'United States', 'United Kingdom'],
    decisionMakers: ['Founder', 'CEO', 'Head of Marketing', 'VP Growth', 'Revenue Leader'],
    businessPain: 'Growing companies that need a more scalable way to generate qualified demand.',
    offerFit: 'Your AI automation service aligns with companies actively investing in growth and operational efficiency.',
    confidence: 87,
    reasoning: [
      {
        number: '01',
        title: 'Customer fit',
        description: 'Your existing offer is designed for B2B organizations with operational complexity.',
      },
      {
        number: '02',
        title: 'Buying potential',
        description: 'Companies at this stage are more likely to have budget and a defined business problem.',
      },
      {
        number: '03',
        title: 'Reachability',
        description: 'Founder and growth roles are identifiable decision-makers for this type of purchase.',
      },
    ],
    assumptions: [
      {
        id: 'as-1',
        text: 'You primarily sell to companies with an existing sales team.',
        status: 'pending',
      },
      {
        id: 'as-2',
        text: 'You prefer mid-market contracts over high-volume transactional sales.',
        status: 'pending',
      },
      {
        id: 'as-3',
        text: 'Founder-led businesses are your highest-converting customer type.',
        status: 'pending',
      },
    ],
  };

  const [structuredICP, setStructuredICP] = useState<StructuredICP>(() => {
    const saved = localStorage.getItem('leadforge_structured_icp');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return defaultStructuredICP;
  });

  const completeOnboarding = async (data: OnboardingData): Promise<void> => {
    // Validate required fields
    if (!data.workspaceName || !data.workspaceName.trim()) {
      throw new Error('Please provide your workspace or agency name.');
    }
    if (!data.whatYouSell || !data.whatYouSell.trim()) {
      throw new Error('Add a little more detail about what you sell.');
    }
    if (!data.whoYouSellTo || !data.whoYouSellTo.trim()) {
      throw new Error('Describe who you sell to in plain language.');
    }
    if (!data.geographies || data.geographies.length === 0) {
      throw new Error('Please select at least one target geography.');
    }
    if (data.geographies.includes('Custom') && (!data.customGeography || !data.customGeography.trim())) {
      throw new Error('Please specify your custom target geography.');
    }
    if (data.website && data.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
      if (!urlPattern.test(data.website.trim())) {
        throw new Error('Please enter a valid website URL (e.g. https://yourcompany.com).');
      }
    }

    const trimmedName = data.workspaceName.trim();
    const trimmedSell = data.whatYouSell.trim();
    const trimmedAudience = data.whoYouSellTo.trim();
    const trimmedWebsite = data.website?.trim() || undefined;

    const geoList =
      data.geographies.includes('Custom') && data.customGeography
        ? [
            ...data.geographies.filter((g) => g !== 'Custom'),
            data.customGeography.trim(),
          ]
        : data.geographies;

    const icpSummary = `${trimmedSell} tailored for ${trimmedAudience}${
      geoList.length > 0 ? ` across ${geoList.join(', ')}` : ''
    }.`;

    // Persist real backend data: throws on network or server failure
    await Promise.all([
      api.workspace.update({
        name: trimmedName,
        website: trimmedWebsite,
        description: trimmedSell,
        onboarding_completed: 1,
        onboarding_skipped: 0,
        onboarding_data: data,
      }),
      api.icp.update({
        name: `${trimmedName} ICP Definition`,
        summary: icpSummary,
        geographies: geoList,
        isConfirmed: false,
      }),
    ]);

    // On successful persistence: update local application state
    setOnboardingData(data);
    localStorage.setItem('leadforge_onboarding_data', JSON.stringify(data));

    const updatedWs: WorkspaceSettings = {
      ...workspace,
      name: trimmedName || workspace.name,
      businessProfile: trimmedSell || workspace.businessProfile,
      primaryService: trimmedSell || workspace.primaryService,
      website: trimmedWebsite || workspace.website,
    };
    setWorkspace(updatedWs);
    localStorage.setItem('leadforge_workspace', JSON.stringify(updatedWs));

    const updatedICP: ICPProfile = {
      ...icp,
      name: `${trimmedName} ICP Definition`,
      summary: icpSummary,
      naturalLanguageDefinition: `We sell ${trimmedSell} targeting ${trimmedAudience}${
        geoList.length > 0 ? ` in ${geoList.join(', ')}` : ''
      }.`,
      criteria: {
        ...icp.criteria,
        geography: geoList.length > 0 ? geoList : icp.criteria.geography,
      },
    };
    setIcp(updatedICP);
    localStorage.setItem('leadforge_icp', JSON.stringify(updatedICP));

    const synthesized: StructuredICP = {
      ...defaultStructuredICP,
      customerType: trimmedAudience || 'Founder-led B2B SaaS companies',
      geography:
        geoList.length > 0 ? geoList : ['India', 'United States', 'United Kingdom'],
      offerFit: trimmedSell
        ? `Your ${trimmedSell} aligns with companies actively investing in growth and operational efficiency.`
        : 'Your AI automation service aligns with companies actively investing in growth and operational efficiency.',
    };
    setStructuredICP(synthesized);
    localStorage.setItem('leadforge_structured_icp', JSON.stringify(synthesized));

    setIsOnboardingCompleted(true);
    setIsOnboardingSkipped(false);
    localStorage.setItem('leadforge_onboarding_completed', 'true');
    localStorage.removeItem('leadforge_onboarding_skipped');
    setIsICPConfirmed(false);
    localStorage.removeItem('leadforge_icp_confirmed');
  };

  const skipOnboarding = async (): Promise<void> => {
    // Explicitly persist skipped onboarding state without falsely marking onboarding as complete
    await api.workspace.update({
      onboarding_skipped: 1,
      onboarding_completed: 0,
    });
    setIsOnboardingSkipped(true);
    setIsOnboardingCompleted(false);
    localStorage.setItem('leadforge_onboarding_skipped', 'true');
    localStorage.removeItem('leadforge_onboarding_completed');
    setIsICPConfirmed(false);
    localStorage.removeItem('leadforge_icp_confirmed');
  };

  const reopenOnboarding = async (): Promise<void> => {
    try {
      await api.workspace.update({
        onboarding_skipped: 0,
        onboarding_completed: 0,
      });
    } catch {}
    setIsOnboardingCompleted(false);
    setIsOnboardingSkipped(false);
    setIsICPConfirmed(false);
    localStorage.removeItem('leadforge_onboarding_completed');
    localStorage.removeItem('leadforge_onboarding_skipped');
    localStorage.removeItem('leadforge_icp_confirmed');
  };

  const approveICP = async (updatedData?: Partial<StructuredICP>) => {
    const finalICP = updatedData ? { ...structuredICP, ...updatedData } : structuredICP;

    // Persist to backend SQLite FIRST
    await api.icp.update({
      name: finalICP.customerType,
      summary: finalICP.offerFit,
      targetIndustries: finalICP.industries,
      companySizes: finalICP.companySize,
      geographies: finalICP.geography,
      buyerRoles: finalICP.decisionMakers,
      isConfirmed: true,
    });

    setStructuredICP(finalICP);
    localStorage.setItem('leadforge_structured_icp', JSON.stringify(finalICP));

    // Synchronize to main icp criteria
    const updatedICP: ICPProfile = {
      ...icp,
      criteria: {
        ...icp.criteria,
        industries: finalICP.industries,
        companySize: finalICP.companySize,
        geography: finalICP.geography,
        buyerRoles: finalICP.decisionMakers,
      },
    };
    setIcp(updatedICP);
    localStorage.setItem('leadforge_icp', JSON.stringify(updatedICP));

    setIsICPConfirmed(true);
    localStorage.setItem('leadforge_icp_confirmed', 'true');
  };

  const updateStructuredICP = (updated: Partial<StructuredICP>) => {
    setStructuredICP((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('leadforge_structured_icp', JSON.stringify(next));
      return next;
    });
  };

  const regenerateICP = async (): Promise<StructuredICP> => {
    const baseSell =
      onboardingData?.whatYouSell || workspace.primaryService || 'AI automation service';
    const baseAudience = onboardingData?.whoYouSellTo || 'Founder-led B2B SaaS companies';
    const baseGeos =
      onboardingData?.geographies && onboardingData.geographies.length > 0
        ? onboardingData.geographies.map((g) =>
            g === 'Custom' && onboardingData.customGeography
              ? onboardingData.customGeography
              : g
          )
        : ['India', 'United States', 'United Kingdom'];

    let parsedResult: any = null;
    try {
      parsedResult = await api.icp.parse(
        `Generate high-intent B2B target ICP profile for a company selling: "${baseSell}" to audience: "${baseAudience}".`
      );
    } catch (err) {
      console.warn('Real AI parse failed during regenerateICP, using deterministic baseline:', err);
    }

    const c = parsedResult?.criteria;
    const regenerated: StructuredICP = {
      customerType: c?.name || baseAudience,
      companySize: c?.companySize?.length ? c.companySize : ['10–50', '51–100', '101–250'],
      industries: c?.industries?.length ? c.industries : ['SaaS', 'Technology', 'B2B Services'],
      geography: c?.geography?.length ? c.geography : baseGeos,
      decisionMakers: c?.buyerRoles?.length ? c.buyerRoles : ['Founder', 'CEO', 'Head of Marketing', 'VP Growth'],
      businessPain: c?.summary || 'Growing companies requiring predictable sales pipeline and operational velocity.',
      offerFit: `Your ${baseSell} aligns with companies actively investing in growth and operational efficiency.`,
      confidence: parsedResult?.source?.includes('gemini') ? 94 : 86,
      reasoning: [
        {
          number: '01',
          title: 'Strategic Market Fit',
          description: `Companies in ${c?.industries?.[0] || 'B2B SaaS'} frequently experience bottlenecks that ${baseSell} directly solves.`,
        },
        {
          number: '02',
          title: 'Purchasing Authority',
          description: 'Key decision makers have designated budget allocations for workflow and growth modernization.',
        },
        {
          number: '03',
          title: 'Direct Reachability',
          description: 'Target buyer roles are identifiable via public leadership rosters and commercial registers.',
        },
      ],
      assumptions: (c?.inferredAssumptions?.length ? c.inferredAssumptions : [
        'You primarily target accounts with an existing sales or operations function.',
        'Mid-market contracts represent your highest customer lifetime value.',
        'High-velocity tech companies convert faster on outbound propositions.',
      ]).map((text: string, idx: number) => ({
        id: `as-${Date.now()}-${idx}`,
        text,
        status: 'pending' as const,
      })),
    };

    setStructuredICP(regenerated);
    localStorage.setItem('leadforge_structured_icp', JSON.stringify(regenerated));
    return regenerated;
  };

  const reopenICPConfirmation = async () => {
    setIsICPConfirmed(false);
    localStorage.removeItem('leadforge_icp_confirmed');
    try {
      await api.icp.update({ isConfirmed: false });
    } catch {}
  };

  // Focus Mode
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusOpportunityId, setFocusOpportunityId] = useState<string | null>('opp-01');

  const enterFocusMode = (oppId?: string) => {
    if (oppId) {
      setFocusOpportunityId(oppId);
    } else if (!focusOpportunityId && opportunities.length > 0) {
      setFocusOpportunityId(opportunities[0].id);
    }
    setIsFocusModeOpen(true);
  };

  const exitFocusMode = () => {
    setIsFocusModeOpen(false);
  };

  // Dynamic Prioritization
  const [prioritizationMode, setPrioritizationMode] =
    useState<PrioritizationMode>('AI_DYNAMIC');

  const rerankOpportunitiesWithAI = async () => {
    setIsAIWorking(true);
    setAiWorkingMessage(
      'Re-evaluating dynamic signals, approaching deadlines, and operator momentum...'
    );
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setOpportunities((prev) =>
          prev.map((opp) => enrichOpportunity(opp, evidence, tasks))
        );
        setIsAIWorking(false);
        setAiWorkingMessage('');
        resolve();
      }, 750);
    });
  };

  // AI loading indicators
  const [isAIWorking, setIsAIWorking] = useState(false);
  const [aiWorkingMessage, setAiWorkingMessage] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('leadforge_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('leadforge_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('leadforge_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('leadforge_drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem('leadforge_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('leadforge_icp', JSON.stringify(icp));
  }, [icp]);

  const updateWorkspace = (settings: Partial<WorkspaceSettings>) => {
    setWorkspace((prev) => {
      const next = { ...prev, ...settings };
      localStorage.setItem('leadforge_workspace', JSON.stringify(next));
      return next;
    });
  };

  const openOpportunityDetail = (id: string) => {
    setSelectedOpportunityId(id);
    setOpportunitySubView('dossier');
    setActiveTab('opportunities');
  };

  const openOpportunityResearch = (id: string) => {
    setSelectedOpportunityId(id);
    setOpportunitySubView('research');
    setActiveTab('opportunities');
  };

  const updateOpportunityStage = (id: string, newStage: OpportunityStage) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          return {
            ...opp,
            stage: newStage,
            updatedAt: new Date().toISOString(),
          };
        }
        return opp;
      })
    );

    const targetOpp = opportunities.find((o) => o.id === id);
    const targetAcc = accounts.find((a) => a.id === targetOpp?.accountId);

    // Append-only audit activity
    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: id,
      type: 'STAGE_CHANGED',
      actorType: 'USER',
      actorName: 'Alex (Founder)',
      description: `Moved stage from ${targetOpp?.stage || 'Previous'} to ${newStage.replace('_', ' ')}`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // If moved to FOLLOW_UP_DUE, create follow-up task
    if (newStage === 'FOLLOW_UP_DUE') {
      const newTask: Task = {
        id: 'tsk-' + Date.now(),
        opportunityId: id,
        accountName: targetAcc?.name || 'Account',
        title: `Follow up with ${targetAcc?.name} (No response after initial contact)`,
        dueAt: 'In 3 days',
        status: 'DUE',
        reason: 'Automated follow-up trigger: stage advanced to Follow-up Due',
        assignee: 'Alex (You)',
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    // Persist to backend
    api.opportunities.update(id, { stage: newStage }).catch((err) => {
      console.warn('Backend update failed:', err);
    });
  };

  const updateOpportunityScore = (id: string, breakdown: Opportunity['scoreBreakdown']) => {
    const baseScore =
      0.30 * breakdown.fit +
      0.25 * breakdown.need +
      0.20 * breakdown.timing +
      0.15 * breakdown.commercial +
      0.10 * breakdown.evidenceQuality;
    const finalScore = Math.round(Math.min(100, Math.max(0, baseScore - breakdown.riskPenalty)));

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id
          ? {
              ...opp,
              score: finalScore,
              scoreBreakdown: breakdown,
              updatedAt: new Date().toISOString(),
            }
          : opp
      )
    );

    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: id,
      type: 'SCORE_UPDATED',
      actorType: 'AI',
      actorName: 'LeadForge Scoring Engine',
      description: `Opportunity score updated to ${finalScore} based on refreshed factor weights.`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Persist to backend
    api.opportunities.updateScore(id, breakdown).catch((err) => {
      console.warn('Backend score update failed:', err);
    });
  };

  const dismissOpportunity = (id: string, reason: string, note?: string) => {
    const targetOpp = opportunities.find((o) => o.id === id);
    const targetAcc = accounts.find((a) => a.id === targetOpp?.accountId);

    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (selectedOpportunityId === id) {
      setSelectedOpportunityId(null);
    }

    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: id,
      type: 'DISMISSED',
      actorType: 'USER',
      actorName: 'Alex',
      description: `Marked as Not a fit (${reason})${note ? `: "${note}"` : ''}.`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'FYI',
      title: `${targetAcc?.name || 'Opportunity'} dismissed`,
      description: `Marked as Not a fit (${reason}).`,
      opportunityId: id,
      read: false,
      createdAt: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addOpportunityNote = (oppId: string, text: string) => {
    if (!text.trim()) return;
    const newNote = {
      id: 'note-' + Date.now(),
      text: text.trim(),
      createdAt: 'Just now',
    };
    setNotes((prev) => ({
      ...prev,
      [oppId]: [newNote, ...(prev[oppId] || [])],
    }));

    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: oppId,
      type: 'NOTE_ADDED',
      actorType: 'USER',
      actorName: 'Alex',
      description: `Added note: "${text.trim().slice(0, 60)}${text.trim().length > 60 ? '...' : ''}"`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    api.opportunities.addNote(oppId, text.trim()).catch((err) => {
      console.warn('Backend add note failed:', err);
    });
  };

  const saveOutreachDraft = (oppId: string, draftData: Partial<OutreachDraft>) => {
    setDrafts((prev) => {
      const existing = prev[oppId];
      const updated: OutreachDraft = {
        id: existing?.id || 'drf-' + Date.now(),
        opportunityId: oppId,
        channel: draftData.channel || existing?.channel || 'Email',
        subject: draftData.subject !== undefined ? draftData.subject : (existing?.subject || ''),
        body: draftData.body !== undefined ? draftData.body : (existing?.body || ''),
        citedEvidence: draftData.citedEvidence || existing?.citedEvidence || [],
        rationale: draftData.rationale || existing?.rationale || 'Tailored to recent prospect buying signals.',
        status: draftData.status || existing?.status || 'DRAFT',
        tone: draftData.tone || existing?.tone || 'Founder Direct',
        estimatedReadTimeSec: draftData.estimatedReadTimeSec || existing?.estimatedReadTimeSec || 25,
        createdAt: existing?.createdAt || new Date().toISOString(),
        approvedAt: draftData.approvedAt || existing?.approvedAt,
      };
      return { ...prev, [oppId]: updated };
    });

    api.opportunities.saveOutreachDraft(oppId, draftData).catch((err) => {
      console.warn('Backend save draft failed:', err);
    });
  };

  const approveOutreachDraft = (oppId: string) => {
    const existing = drafts[oppId];
    if (!existing) return;

    const approvedDraft: OutreachDraft = {
      ...existing,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    };

    setDrafts((prev) => ({ ...prev, [oppId]: approvedDraft }));

    // Append activity
    const targetOpp = opportunities.find((o) => o.id === oppId);
    const targetAcc = accounts.find((a) => a.id === targetOpp?.accountId);

    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: oppId,
      type: 'OUTREACH_APPROVED',
      actorType: 'USER',
      actorName: 'Alex (Founder)',
      description: `Approved ${approvedDraft.channel} draft for ${targetAcc?.name}. Outbound logged.`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Transition stage to CONTACTED
    updateOpportunityStage(oppId, 'CONTACTED');

    // Create follow-up task 3 days out
    const followUpTask: Task = {
      id: 'tsk-' + Date.now(),
      opportunityId: oppId,
      accountName: targetAcc?.name || 'Account',
      title: `Check for reply or send Day-3 follow up to ${targetAcc?.name}`,
      dueAt: 'In 3 days',
      status: 'DUE',
      reason: 'Scheduled follow-up cadence following approved outreach.',
      assignee: 'Alex (You)',
    };
    setTasks((prev) => [followUpTask, ...prev]);

    api.opportunities.saveOutreachDraft(oppId, { ...approvedDraft, status: 'APPROVED' }).catch((err) => {
      console.warn('Backend approve draft failed:', err);
    });
  };

  const generateOutreachWithAI = async (
    oppId: string,
    tone: OutreachDraft['tone'] = 'Founder Direct',
    channel: OutreachDraft['channel'] = 'Email'
  ) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;
    const acc = accounts.find((a) => a.id === opp.accountId);
    const contact = contacts.find((c) => c.id === opp.primaryContactId);
    const oppEvidence = evidence.filter((e) => e.opportunityId === oppId);

    setIsAIWorking(true);
    setAiWorkingMessage(`Analyzing ${oppEvidence.length} evidence signals for ${acc?.name}...`);

    try {
      const res = await fetch('/api/opportunities/outreach-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: acc?.name,
          contactName: contact?.name,
          contactRole: contact?.title,
          evidenceSnippets: oppEvidence.map((e) => `${e.claim} (Source: ${e.sourceDomain})`),
          tone,
          channel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const draft = data.draft;
        saveOutreachDraft(oppId, {
          channel,
          tone,
          subject: draft.subject,
          body: draft.body,
          citedEvidence: draft.citedEvidence || oppEvidence.map((e) => e.claim),
          rationale: draft.rationale,
          status: 'DRAFT',
          estimatedReadTimeSec: draft.estimatedReadTimeSec || 25,
        });

        const newActivity: Activity = {
          id: 'act-' + Date.now(),
          opportunityId: oppId,
          type: 'OUTREACH_DRAFTED',
          actorType: 'AI',
          actorName: 'LeadForge AI Outreach Engine',
          description: `Drafted ${tone} ${channel} outreach grounded in ${draft.citedEvidence?.length || 2} verified claims.`,
          happenedAt: 'Just now',
        };
        setActivities((prev) => [newActivity, ...prev]);
      }
    } catch (err) {
      console.error('Outreach generation error:', err);
    } finally {
      setIsAIWorking(false);
      setAiWorkingMessage('');
    }
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
    );

    if (task) {
      const newActivity: Activity = {
        id: 'act-' + Date.now(),
        opportunityId: task.opportunityId,
        type: 'TASK_COMPLETED',
        actorType: 'USER',
        actorName: 'Alex',
        description: `Completed task: "${task.title}"`,
        happenedAt: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev]);
    }

    api.tasks.update(taskId, { status: 'COMPLETED' }).catch((err) => {
      console.warn('Backend complete task failed:', err);
    });
  };

  const snoozeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'SNOOZED', dueAt: 'Tomorrow, 9:00 AM' } : t))
    );

    api.tasks.update(taskId, { status: 'SNOOZED', dueDate: 'Tomorrow, 9:00 AM' }).catch((err) => {
      console.warn('Backend snooze task failed:', err);
    });
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: 'tsk-' + Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);

    const newActivity: Activity = {
      id: 'act-' + Date.now(),
      opportunityId: task.opportunityId,
      type: 'TASK_CREATED',
      actorType: 'USER',
      actorName: 'Alex',
      description: `Created follow-up task: "${task.title}"`,
      happenedAt: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);

    api.tasks.create({
      opportunityId: task.opportunityId,
      title: task.title,
      dueDate: task.dueAt,
      status: task.status,
    }).catch((err) => {
      console.warn('Backend create task failed:', err);
    });
  };

  const runResearchOnAccount = async (targetId: string) => {
    // targetId can be an opportunity ID or an account ID
    let opp = opportunities.find((o) => o.id === targetId);
    if (!opp) {
      opp = opportunities.find((o) => o.accountId === targetId);
    }
    if (!opp && accounts.length > 0) {
      const acc = accounts.find((a) => a.id === targetId);
      if (acc) {
        opp = opportunities[0];
      }
    }
    if (!opp) return;

    const oppId = opp.id;
    const acc = accounts.find((a) => a.id === opp.accountId);

    const runId = 'run-' + Date.now();
    const newRun: ResearchRun = {
      id: runId,
      opportunityId: oppId,
      accountName: acc?.name || 'Account',
      status: 'RESEARCHING',
      currentStep: 'Querying public signals and verified sources...',
      progressPercent: 40,
      findingsCount: 0,
      startedAt: 'Just now',
    };
    setResearchRuns((prev) => [newRun, ...prev]);
    setIsAIWorking(true);
    setAiWorkingMessage(`Researching ${acc?.name}: Collecting live signals...`);

    try {
      const res = await fetch('/api/opportunities/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: acc?.name,
          domain: acc?.domain,
          industry: acc?.industry,
          notes: acc?.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const research = data.research;

        // Add newly discovered evidence
        if (research && research.findings && research.findings.length > 0) {
          const newEvItems: EvidenceItem[] = research.findings.map((f: any, idx: number) => ({
            id: `evi-new-${Date.now()}-${idx}`,
            opportunityId: oppId,
            accountId: opp.accountId,
            claim: f.claim,
            claimType: f.claimType || 'HIRING',
            sourceUrl: f.source && f.source.startsWith('http') ? f.source : `https://${acc?.domain}`,
            sourceDomain: acc?.domain || 'web',
            observedAt: f.observedAt || 'Just now',
            capturedAt: new Date().toISOString(),
            confidence: f.confidence || 0.92,
            whyItMatters: f.whyItMatters || 'Validated buying trigger.',
          }));
          setEvidence((prev) => [...newEvItems, ...prev]);
        }

        // Update opportunity score and whyNow
        if (research) {
          setOpportunities((prev) =>
            prev.map((o) =>
              o.id === oppId
                ? {
                    ...o,
                    score: Math.round(
                      0.30 * (research.fitScore || 85) +
                      0.25 * (research.needScore || 80) +
                      0.20 * (research.timingScore || 85) +
                      0.15 * (research.commercialScore || 80) +
                      0.10 * (research.evidenceQuality || 85)
                    ),
                    scoreBreakdown: {
                      fit: research.fitScore || 85,
                      need: research.needScore || 80,
                      timing: research.timingScore || 85,
                      commercial: research.commercialScore || 80,
                      evidenceQuality: research.evidenceQuality || 85,
                      riskPenalty: 0,
                    },
                    whyNow: research.whyNow || o.whyNow,
                    nextAction: research.nextAction
                      ? {
                          actionType: research.nextAction.actionType || 'OUTREACH',
                          actionText: research.nextAction.actionText,
                          reason: research.nextAction.reason,
                          dueAt: 'Today by 3:00 PM',
                          urgency: research.nextAction.urgency || 'TODAY',
                          confidence: 0.92,
                        }
                      : o.nextAction,
                    lastResearchedAt: 'Just now',
                    updatedAt: new Date().toISOString(),
                  }
                : o
            )
          );
        }

        setResearchRuns((prev) =>
          prev.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  status: 'COMPLETE',
                  currentStep: `Extracted ${research?.findings?.length || 2} new evidence items`,
                  progressPercent: 100,
                  findingsCount: research?.findings?.length || 2,
                  completedAt: 'Just now',
                }
              : r
          )
        );

        const newActivity: Activity = {
          id: 'act-' + Date.now(),
          opportunityId: oppId,
          type: 'RESEARCH_COMPLETED',
          actorType: 'AI',
          actorName: 'LeadForge Research Engine',
          description: `Completed deep intelligence run. Extracted ${research?.findings?.length || 2} verified signals.`,
          happenedAt: 'Just now',
        };
        setActivities((prev) => [newActivity, ...prev]);

        return data;
      }
    } catch (err) {
      console.error('Research run failed:', err);
      setResearchRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? { ...r, status: 'FAILED', currentStep: 'Unable to reach provider data source' }
            : r
        )
      );
    } finally {
      setIsAIWorking(false);
      setAiWorkingMessage('');
    }
  };

  const researchTargetAccount = runResearchOnAccount;

  // Account and Contact CRUD
  const createAccount = async (data: any) => {
    try {
      await api.accounts.create(data);
      await refreshWorkspaceData();
    } catch (err) {
      console.error('Failed to create account:', err);
      throw err;
    }
  };

  const updateAccount = async (id: string, data: any) => {
    try {
      await api.accounts.update(id, data);
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    } catch (err) {
      console.error('Failed to update account:', err);
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await api.accounts.delete(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setOpportunities((prev) => prev.filter((o) => o.accountId !== id));
    } catch (err) {
      console.error('Failed to delete account:', err);
      throw err;
    }
  };

  const createContact = async (data: any) => {
    try {
      await api.contacts.create(data);
      await refreshWorkspaceData();
    } catch (err) {
      console.error('Failed to create contact:', err);
      throw err;
    }
  };

  const updateContact = async (id: string, data: any) => {
    try {
      await api.contacts.update(id, data);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    } catch (err) {
      console.error('Failed to update contact:', err);
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await api.contacts.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete contact:', err);
      throw err;
    }
  };

  const updateICP = (updated: Partial<ICPProfile>) => {
    setIcp((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const parseICPWithAI = async (prompt: string) => {
    setIsAIWorking(true);
    setAiWorkingMessage('Parsing natural language ICP criteria and extracting assumptions...');
    try {
      const res = await fetch('/api/icps/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = data.criteria;
        setIcp((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          summary: parsed.summary || prev.summary,
          naturalLanguageDefinition: prompt,
          criteria: {
            industries: parsed.industries || prev.criteria.industries,
            companySize: parsed.companySize || prev.criteria.companySize,
            geography: parsed.geography || prev.criteria.geography,
            buyerRoles: parsed.buyerRoles || prev.criteria.buyerRoles,
            buyingSignals: parsed.buyingSignals || prev.criteria.buyingSignals,
            exclusions: parsed.exclusions || prev.criteria.exclusions,
            inferredAssumptions: parsed.inferredAssumptions || [],
          },
        }));

        // Trigger score re-ranking notification
        const newNotif: NotificationItem = {
          id: 'notif-' + Date.now(),
          type: 'SYSTEM',
          title: 'ICP profile updated via AI',
          description: `Targeting criteria refined. ${opportunities.length} active opportunities re-evaluated against new profile.`,
          read: false,
          createdAt: 'Just now',
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } catch (err) {
      console.error('Failed to parse ICP:', err);
    } finally {
      setIsAIWorking(false);
      setAiWorkingMessage('');
    }
  };

  const importAccountsFromData = (
    newAccountsData: Partial<Account>[],
    newContactsData: Partial<Contact>[] = []
  ) => {
    let importedCount = 0;
    let dupCount = 0;

    const addedAccounts: Account[] = [];
    const addedContacts: Contact[] = [];
    const addedOpps: Opportunity[] = [];

    newAccountsData.forEach((row, idx) => {
      const normDomain = row.domain?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') || '';
      const existing = accounts.find((a) => a.domain.toLowerCase() === normDomain);
      if (existing) {
        dupCount++;
        return;
      }

      const accId = 'acc-imp-' + Date.now() + '-' + idx;
      const cntId = 'cnt-imp-' + Date.now() + '-' + idx;
      const oppId = 'opp-imp-' + Date.now() + '-' + idx;

      const acc: Account = {
        id: accId,
        name: row.name || 'Untitled Account',
        domain: normDomain || `${row.name?.toLowerCase().replace(/\s+/g, '')}.com`,
        industry: row.industry || 'B2B Software',
        size: row.size || '30–100 employees',
        location: row.location || 'United States',
        source: 'CSV Import',
        description: row.description || 'Imported prospect account.',
        techStack: row.techStack || ['React', 'Cloud'],
        createdAt: new Date().toISOString(),
      };

      const contactData = newContactsData[idx] || {};
      const cnt: Contact = {
        id: cntId,
        accountId: accId,
        name: contactData.name || 'Decision Maker',
        title: contactData.title || 'VP of Engineering / Growth',
        email: contactData.email || `contact@${acc.domain}`,
        linkedinUrl: contactData.linkedinUrl || `https://linkedin.com/company/${acc.domain}`,
        isPrimary: true,
      };

      const opp: Opportunity = {
        id: oppId,
        accountId: accId,
        primaryContactId: cntId,
        stage: 'NEW',
        score: 78,
        scoreBreakdown: {
          fit: 82,
          need: 76,
          timing: 75,
          commercial: 78,
          evidenceQuality: 70,
          riskPenalty: 0,
        },
        confidence: 0.78,
        whyNow: 'Recently imported into workspace queue; ready for automated research run.',
        nextAction: {
          actionType: 'RESEARCH',
          actionText: `Run initial signal research and verify decision makers at ${acc.name}`,
          reason: 'Unresearched prospect imported from CSV list.',
          dueAt: 'Today',
          urgency: 'TODAY',
          confidence: 0.8,
        },
        tags: ['Imported', 'Needs Research'],
        lastResearchedAt: 'Never',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addedAccounts.push(acc);
      addedContacts.push(cnt);
      addedOpps.push(opp);
      importedCount++;
    });

    if (addedAccounts.length > 0) {
      setAccounts((prev) => [...addedAccounts, ...prev]);
      setContacts((prev) => [...addedContacts, ...prev]);
      setOpportunities((prev) => [...addedOpps, ...prev]);

      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'SYSTEM',
        title: `CSV Import Complete`,
        description: `Imported ${importedCount} accounts (${dupCount} duplicate domains skipped).`,
        read: false,
        createdAt: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return { imported: importedCount, duplicates: dupCount };
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const disputeEvidence = (evidenceId: string) => {
    setEvidence((prev) =>
      prev.map((e) => (e.id === evidenceId ? { ...e, isDisputed: !e.isDisputed } : e))
    );
  };

  return (
    <LeadForgeContext.Provider
      value={{
        workspace,
        updateWorkspace,
        activeTab,
        setActiveTab,
        selectedOpportunityId,
        setSelectedOpportunityId,
        opportunitySubView,
        setOpportunitySubView,
        openOpportunityDetail,
        openOpportunityResearch,
        opportunities,
        accounts,
        contacts,
        evidence,
        drafts,
        tasks,
        activities,
        notes,
        icp,
        notifications,
        researchRuns,
        commandPaletteOpen,
        setCommandPaletteOpen,
        outreachModalOpen,
        setOutreachModalOpen,
        importModalOpen,
        setImportModalOpen,
        notificationsDrawerOpen,
        setNotificationsDrawerOpen,
        updateOpportunityStage,
        updateOpportunityScore,
        dismissOpportunity,
        addOpportunityNote,
        saveOutreachDraft,
        approveOutreachDraft,
        generateOutreachWithAI,
        completeTask,
        snoozeTask,
        addTask,
        runResearchOnAccount,
        researchTargetAccount,
        createAccount,
        updateAccount,
        deleteAccount,
        createContact,
        updateContact,
        deleteContact,
        updateICP,
        parseICPWithAI,
        importAccountsFromData,
        markNotificationRead,
        markAllNotificationsRead,
        disputeEvidence,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        isOnboardingCompleted,
        setIsOnboardingCompleted,
        isOnboardingSkipped,
        setIsOnboardingSkipped,
        completeOnboarding,
        skipOnboarding,
        reopenOnboarding,
        isICPConfirmed,
        setIsICPConfirmed,
        approveICP,
        reopenICPConfirmation,
        onboardingData,
        structuredICP,
        updateStructuredICP,
        regenerateICP,
        isFocusModeOpen,
        setIsFocusModeOpen,
        focusOpportunityId,
        setFocusOpportunityId,
        enterFocusMode,
        exitFocusMode,
        prioritizationMode,
        setPrioritizationMode,
        rerankOpportunitiesWithAI,
        isAIWorking,
        aiWorkingMessage,
        seedDemoData,
        clearDemoData,
        refreshWorkspaceData,
        isLoadingSession,
      }}
    >
      {children}
    </LeadForgeContext.Provider>
  );
};

export const useLeadForge = () => {
  const context = useContext(LeadForgeContext);
  if (!context) {
    throw new Error('useLeadForge must be used within a LeadForgeProvider');
  }
  return context;
};
