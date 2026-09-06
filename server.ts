import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db/database';
import { AuthService } from './server/services/authService';
import { SampleDataService } from './server/services/sampleDataService';
import { AIGateway } from './server/services/aiGateway';
import { ResearchService } from './server/services/researchService';
import { OpportunityService } from './server/services/opportunityService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Extend Express Request type for authenticated context
export interface AuthenticatedRequest extends Request {
  user?: any;
  workspace?: any;
}

// Authentication Middleware
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-leadforge-token'] as string;
  if (customHeader) return customHeader.trim();
  return null;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = AuthService.validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  req.user = session.user;
  req.workspace = session.workspace;
  next();
}

function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const session = AuthService.validateSession(token);
    if (session) {
      req.user = session.user;
      req.workspace = session.workspace;
      return next();
    }
  }

  // Fallback to default or demo workspace if available
  const defaultWs = db.prepare('SELECT * FROM workspaces ORDER BY created_at ASC LIMIT 1').get() as any;
  if (defaultWs) {
    req.workspace = defaultWs;
    req.user = { id: 'usr-default', email: 'founder@leadforge.ai', name: 'Founder', role: 'founder' };
  }
  next();
}

// ----------------------------------------------------
// Health Check (Spec #32)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LeadForge AI Sales Intelligence Engine',
    version: '1.0.0-production',
    database: 'SQLite (WAL Mode, Relational Schema Active)',
    aiEngine: Boolean(process.env.GEMINI_API_KEY) ? 'Gemini 3.8 Flash Active' : 'Heuristic Engine Ready',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// Authentication Endpoints (Spec #3, #32)
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    const session = AuthService.register(email, password, name);
    res.status(201).json(session);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    const session = AuthService.login(email, password);
    res.json(session);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user,
    workspace: req.workspace,
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (token) {
    AuthService.logout(token);
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// Workspace Management (Spec #6, #32)
// ----------------------------------------------------
app.get('/api/workspace', requireAuth, (req: AuthenticatedRequest, res) => {
  const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.workspace.id) as any;
  res.json(ws || req.workspace);
});

app.patch('/api/workspace', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, website, description, currency, timezone } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE workspaces
    SET name = COALESCE(?, name),
        website = COALESCE(?, website),
        description = COALESCE(?, description),
        currency = COALESCE(?, currency),
        timezone = COALESCE(?, timezone),
        updated_at = ?
    WHERE id = ?
  `).run(name, website, description, currency, timezone, now, req.workspace.id);

  const updated = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.workspace.id);
  res.json(updated);
});

// ----------------------------------------------------
// ICP Endpoints (Spec #32)
// ----------------------------------------------------
app.get('/api/icp', requireAuth, (req: AuthenticatedRequest, res) => {
  const profile = db.prepare('SELECT * FROM icp_profiles WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 1').get(req.workspace.id) as any;
  if (!profile) {
    return res.json(null);
  }

  res.json({
    id: profile.id,
    name: profile.name,
    summary: profile.summary,
    targetIndustries: JSON.parse(profile.target_industries || '[]'),
    companySizes: JSON.parse(profile.company_sizes || '[]'),
    geographies: JSON.parse(profile.geographies || '[]'),
    buyerRoles: JSON.parse(profile.buyer_roles || '[]'),
    buyingSignals: JSON.parse(profile.buying_signals || '[]'),
    exclusions: JSON.parse(profile.exclusions || '[]'),
    inferredAssumptions: JSON.parse(profile.inferred_assumptions || '[]'),
    isConfirmed: Boolean(profile.is_confirmed),
    confidence: profile.confidence,
    updatedAt: profile.updated_at,
  });
});

app.patch('/api/icp', requireAuth, (req: AuthenticatedRequest, res) => {
  const {
    name,
    summary,
    targetIndustries,
    companySizes,
    geographies,
    buyerRoles,
    buyingSignals,
    exclusions,
    inferredAssumptions,
    isConfirmed,
  } = req.body;
  const now = new Date().toISOString();

  let profile = db.prepare('SELECT id FROM icp_profiles WHERE workspace_id = ?').get(req.workspace.id) as any;
  const profileId = profile?.id || crypto.randomUUID();

  if (profile) {
    db.prepare(`
      UPDATE icp_profiles
      SET name = COALESCE(?, name),
          summary = COALESCE(?, summary),
          target_industries = COALESCE(?, target_industries),
          company_sizes = COALESCE(?, company_sizes),
          geographies = COALESCE(?, geographies),
          buyer_roles = COALESCE(?, buyer_roles),
          buying_signals = COALESCE(?, buying_signals),
          exclusions = COALESCE(?, exclusions),
          inferred_assumptions = COALESCE(?, inferred_assumptions),
          is_confirmed = COALESCE(?, is_confirmed),
          updated_at = ?
      WHERE id = ?
    `).run(
      name,
      summary,
      targetIndustries ? JSON.stringify(targetIndustries) : null,
      companySizes ? JSON.stringify(companySizes) : null,
      geographies ? JSON.stringify(geographies) : null,
      buyerRoles ? JSON.stringify(buyerRoles) : null,
      buyingSignals ? JSON.stringify(buyingSignals) : null,
      exclusions ? JSON.stringify(exclusions) : null,
      inferredAssumptions ? JSON.stringify(inferredAssumptions) : null,
      isConfirmed !== undefined ? (isConfirmed ? 1 : 0) : null,
      now,
      profileId
    );
  } else {
    db.prepare(`
      INSERT INTO icp_profiles (
        id, workspace_id, name, summary, target_industries, company_sizes, geographies,
        buyer_roles, buying_signals, exclusions, inferred_assumptions, is_confirmed, confidence, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.92, ?, ?)
    `).run(
      profileId,
      req.workspace.id,
      name || 'Target ICP',
      summary || '',
      JSON.stringify(targetIndustries || []),
      JSON.stringify(companySizes || []),
      JSON.stringify(geographies || []),
      JSON.stringify(buyerRoles || []),
      JSON.stringify(buyingSignals || []),
      JSON.stringify(exclusions || []),
      JSON.stringify(inferredAssumptions || []),
      isConfirmed ? 1 : 0,
      now,
      now
    );
  }

  res.json({ success: true, profileId });
});

// ICP Parsing with AI
const handleICPParse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required' });
    }
    const workspaceId = req.workspace?.id || 'ws-default';
    const result = await AIGateway.parseICP(prompt, workspaceId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse ICP' });
  }
};
app.post('/api/icp/parse', optionalAuth, handleICPParse);
app.post('/api/icps/parse', optionalAuth, handleICPParse);

// ----------------------------------------------------
// Accounts Endpoints (Spec #32)
// ----------------------------------------------------
app.get('/api/accounts', requireAuth, (req: AuthenticatedRequest, res) => {
  const accounts = db.prepare(`
    SELECT a.*, COUNT(DISTINCT c.id) as contact_count, COUNT(DISTINCT o.id) as opportunity_count
    FROM accounts a
    LEFT JOIN contacts c ON c.account_id = a.id
    LEFT JOIN opportunities o ON o.account_id = a.id
    WHERE a.workspace_id = ?
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `).all(req.workspace.id) as any[];

  res.json(
    accounts.map((acc) => ({
      ...acc,
      techStack: acc.tech_stack ? JSON.parse(acc.tech_stack) : [],
    }))
  );
});

app.post('/api/accounts', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const result = OpportunityService.createAccount(req.workspace.id, req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create account.' });
  }
});

app.get('/api/accounts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ? AND workspace_id = ?').get(req.params.id, req.workspace.id) as any;
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json({
    ...account,
    techStack: account.tech_stack ? JSON.parse(account.tech_stack) : [],
  });
});

app.patch('/api/accounts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, domain, industry, size, location, description, status } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE accounts
    SET name = COALESCE(?, name),
        domain = COALESCE(?, domain),
        industry = COALESCE(?, industry),
        size = COALESCE(?, size),
        location = COALESCE(?, location),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `).run(name, domain, industry, size, location, description, status, now, req.params.id, req.workspace.id);

  res.json({ success: true });
});

app.delete('/api/accounts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM accounts WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// Contacts Endpoints (Spec #32)
// ----------------------------------------------------
app.get('/api/contacts', requireAuth, (req: AuthenticatedRequest, res) => {
  const contacts = db.prepare(`
    SELECT c.*, a.name as account_name, a.domain as account_domain
    FROM contacts c
    JOIN accounts a ON a.id = c.account_id
    WHERE c.workspace_id = ?
    ORDER BY c.is_primary DESC, c.created_at DESC
  `).all(req.workspace.id) as any[];

  res.json(
    contacts.map((c) => ({
      id: c.id,
      accountId: c.account_id,
      accountName: c.account_name,
      accountDomain: c.account_domain,
      name: c.name,
      title: c.title,
      email: c.email,
      phone: c.phone,
      linkedinUrl: c.linkedin_url,
      isPrimary: Boolean(c.is_primary),
      authorityLevel: c.authority_level,
      relevanceNotes: c.relevance_notes,
      createdAt: c.created_at,
    }))
  );
});

app.post('/api/contacts', requireAuth, (req: AuthenticatedRequest, res) => {
  const { accountId, name, title, email, phone, linkedinUrl, isPrimary, relevanceNotes } = req.body;
  if (!accountId || !name || !title) {
    return res.status(400).json({ error: 'accountId, name, and title are required.' });
  }

  const id = `cnt-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO contacts (id, workspace_id, account_id, name, title, email, phone, linkedin_url, is_primary, relevance_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.workspace.id, accountId, name, title, email || null, phone || null, linkedinUrl || null, isPrimary ? 1 : 0, relevanceNotes || null, now, now);

  res.status(201).json({ id, success: true });
});

app.patch('/api/contacts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, title, email, phone, linkedinUrl, isPrimary, relevanceNotes } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE contacts
    SET name = COALESCE(?, name),
        title = COALESCE(?, title),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        linkedin_url = COALESCE(?, linkedin_url),
        is_primary = COALESCE(?, is_primary),
        relevance_notes = COALESCE(?, relevance_notes),
        updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `).run(name, title, email, phone, linkedinUrl, isPrimary !== undefined ? (isPrimary ? 1 : 0) : null, relevanceNotes, now, req.params.id, req.workspace.id);

  res.json({ success: true });
});

app.delete('/api/contacts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// Opportunities Endpoints (Spec #20, #32)
// ----------------------------------------------------
app.get('/api/opportunities', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = OpportunityService.getOpportunities(req.workspace.id);
  res.json(list);
});

app.get('/api/opportunities/today', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = OpportunityService.getOpportunities(req.workspace.id, { todayOnly: true });
  res.json(list);
});

app.get('/api/opportunities/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = OpportunityService.getOpportunities(req.workspace.id);
  const opp = list.find((o) => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(opp);
});

app.patch('/api/opportunities/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { stage, scoreBreakdown, whyNow, summary } = req.body;

    if (stage) {
      OpportunityService.updateStage(req.params.id, stage, req.workspace.id);
    }
    if (scoreBreakdown) {
      OpportunityService.updateScore(req.params.id, scoreBreakdown, req.workspace.id);
    }

    if (whyNow || summary) {
      db.prepare(`
        UPDATE opportunities
        SET why_now = COALESCE(?, why_now),
            summary = COALESCE(?, summary),
            updated_at = ?
        WHERE id = ? AND workspace_id = ?
      `).run(whyNow, summary, new Date().toISOString(), req.params.id, req.workspace.id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update opportunity' });
  }
});

// ----------------------------------------------------
// Research Pipeline Endpoints (Spec #10, #32)
// ----------------------------------------------------
app.post('/api/opportunities/:id/research', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await ResearchService.runOpportunityResearch(req.params.id, req.workspace.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to research opportunity' });
  }
});

app.get('/api/opportunities/:id/research', requireAuth, (req: AuthenticatedRequest, res) => {
  const runs = db.prepare(`
    SELECT * FROM research_runs WHERE opportunity_id = ? AND workspace_id = ? ORDER BY started_at DESC
  `).all(req.params.id, req.workspace.id);

  const sources = db.prepare(`
    SELECT s.* FROM research_sources s
    JOIN opportunities o ON o.account_id = s.account_id
    WHERE o.id = ? AND o.workspace_id = ?
    ORDER BY s.retrieved_at DESC
  `).all(req.params.id, req.workspace.id);

  const evidence = db.prepare(`
    SELECT * FROM opportunity_evidence WHERE opportunity_id = ? AND workspace_id = ? ORDER BY created_at DESC
  `).all(req.params.id, req.workspace.id);

  res.json({ runs, sources, evidence });
});

// General research endpoint for on-demand inspection
app.post('/api/opportunities/research', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { accountName, domain, industry, notes } = req.body;
    const wsId = req.workspace?.id || 'ws-default';
    const { research } = await AIGateway.researchAccount(accountName, domain, industry, notes, wsId);
    res.json({ research, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Research error' });
  }
});

// ----------------------------------------------------
// Scoring & Next Action Endpoints (Spec #17, #19, #32)
// ----------------------------------------------------
app.post('/api/opportunities/:id/score', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const result = OpportunityService.updateScore(req.params.id, req.body, req.workspace.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Legacy scoring calculator endpoint
app.post('/api/opportunities/score', (req, res) => {
  const { fit = 80, need = 75, timing = 70, commercial = 70, evidenceQuality = 80, riskPenalty = 0 } = req.body;
  const baseScore =
    0.30 * Number(fit) +
    0.25 * Number(need) +
    0.20 * Number(timing) +
    0.15 * Number(commercial) +
    0.10 * Number(evidenceQuality);
  const finalScore = Math.round(Math.min(100, Math.max(0, baseScore - Number(riskPenalty))));
  res.json({ score: finalScore });
});

// ----------------------------------------------------
// Outreach Endpoints (Spec #25, #32)
// ----------------------------------------------------
app.post('/api/opportunities/:id/outreach', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { contactId, tone, channel } = req.body;
    const opp = db.prepare('SELECT o.*, a.name as account_name FROM opportunities o JOIN accounts a ON a.id = o.account_id WHERE o.id = ? AND o.workspace_id = ?').get(req.params.id, req.workspace.id) as any;
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    let contact = null;
    if (contactId) {
      contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as any;
    } else {
      contact = db.prepare('SELECT * FROM contacts WHERE account_id = ? ORDER BY is_primary DESC LIMIT 1').get(opp.account_id) as any;
    }

    const evidenceRows = db.prepare('SELECT claim FROM opportunity_evidence WHERE opportunity_id = ? LIMIT 4').all(req.params.id) as any[];
    const evidenceSnippets = evidenceRows.map((e) => e.claim);

    const { draft } = await AIGateway.generateOutreach(
      opp.account_name,
      contact?.name || 'Founder',
      contact?.title || 'Leader',
      evidenceSnippets,
      tone || 'Founder Direct',
      channel || 'Email',
      req.workspace.id
    );

    // Save Draft
    const draftId = `draft-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO outreach_drafts (id, workspace_id, opportunity_id, contact_id, subject, body, tone, channel, status, cited_evidence, rationale, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
    `).run(
      draftId,
      req.workspace.id,
      req.params.id,
      contact?.id || null,
      draft.subject,
      draft.body,
      tone || 'Founder Direct',
      channel || 'Email',
      JSON.stringify(draft.citedEvidence || []),
      draft.rationale || 'Personalized from verified signals',
      now,
      now
    );

    res.json({ draftId, draft });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate outreach' });
  }
});

app.post('/api/opportunities/outreach-draft', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { accountName, contactName, contactRole, evidenceSnippets, tone, channel } = req.body;
    const wsId = req.workspace?.id || 'ws-default';
    const result = await AIGateway.generateOutreach(
      accountName,
      contactName,
      contactRole,
      evidenceSnippets || [],
      tone,
      channel,
      wsId
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Outreach generation error' });
  }
});

// ----------------------------------------------------
// Follow-ups & Tasks Endpoints (Spec #21, #32)
// ----------------------------------------------------
app.get('/api/follow-ups', requireAuth, (req: AuthenticatedRequest, res) => {
  const followUps = db.prepare(`
    SELECT f.*, o.account_id, a.name as account_name, c.name as contact_name, c.email as contact_email
    FROM follow_ups f
    JOIN opportunities o ON o.id = f.opportunity_id
    JOIN accounts a ON a.id = o.account_id
    LEFT JOIN contacts c ON c.id = f.contact_id
    WHERE f.workspace_id = ?
    ORDER BY f.due_at ASC
  `).all(req.workspace.id) as any[];

  res.json(followUps);
});

app.post('/api/follow-ups', requireAuth, (req: AuthenticatedRequest, res) => {
  const { opportunityId, contactId, reason, dueAt } = req.body;
  const id = `flw-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO follow_ups (id, workspace_id, opportunity_id, contact_id, reason, due_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
  `).run(id, req.workspace.id, opportunityId, contactId || null, reason, dueAt, now);

  res.status(201).json({ id, success: true });
});

app.patch('/api/follow-ups/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { status, dueAt } = req.body;
  const now = new Date().toISOString();
  const completedAt = status === 'COMPLETED' ? now : null;

  db.prepare(`
    UPDATE follow_ups
    SET status = COALESCE(?, status),
        due_at = COALESCE(?, due_at),
        completed_at = COALESCE(?, completed_at)
    WHERE id = ? AND workspace_id = ?
  `).run(status, dueAt, completedAt, req.params.id, req.workspace.id);

  res.json({ success: true });
});

app.get('/api/tasks', requireAuth, (req: AuthenticatedRequest, res) => {
  const tasks = db.prepare(`
    SELECT t.*, o.account_id, a.name as account_name
    FROM tasks t
    JOIN opportunities o ON o.id = t.opportunity_id
    JOIN accounts a ON a.id = o.account_id
    WHERE t.workspace_id = ?
    ORDER BY t.created_at DESC
  `).all(req.workspace.id);

  res.json(tasks);
});

// ----------------------------------------------------
// Activity Timeline (Spec #22, #32)
// ----------------------------------------------------
app.get('/api/activity', requireAuth, (req: AuthenticatedRequest, res) => {
  const activities = db.prepare(`
    SELECT * FROM activities WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.workspace.id);

  res.json(activities);
});

// ----------------------------------------------------
// Notifications (Spec #28)
// ----------------------------------------------------
app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 30
  `).all(req.workspace.id);

  res.json(notifications);
});

app.patch('/api/notifications/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND workspace_id = ?').run(req.params.id, req.workspace.id);
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE workspace_id = ?').run(req.workspace.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// CSV Import Endpoint (Spec #26)
// ----------------------------------------------------
app.post('/api/import/csv', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'Rows array required' });
    }
    const result = OpportunityService.importCSV(req.workspace.id, rows);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Import failed' });
  }
});

// ----------------------------------------------------
// Sample / Demo Workspace Seed & Clear (Spec #8)
// ----------------------------------------------------
app.post('/api/demo/seed', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const result = SampleDataService.seedSampleData(req.workspace.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/clear', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    SampleDataService.clearSampleData(req.workspace.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Vite Middleware & Static Production Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadForge production server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
