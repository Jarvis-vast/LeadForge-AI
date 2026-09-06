import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'leadforge.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for production concurrency and relational integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    -- Profiles table (User identity)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'founder',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Sessions table (Auth tokens & expiration)
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    -- Organizations table
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'growth',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Workspaces table (Multi-tenancy partition)
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      website TEXT,
      description TEXT,
      currency TEXT DEFAULT 'USD',
      timezone TEXT DEFAULT 'America/New_York',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    -- Workspace Members table (RBAC & multi-tenant access control)
    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT NOT NULL,
      UNIQUE(workspace_id, user_id),
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    -- ICP Profiles table (Ideal Customer Profile)
    CREATE TABLE IF NOT EXISTS icp_profiles (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      summary TEXT,
      target_industries TEXT NOT NULL, -- JSON array
      company_sizes TEXT NOT NULL,     -- JSON array
      geographies TEXT NOT NULL,       -- JSON array
      buyer_roles TEXT NOT NULL,       -- JSON array
      buying_signals TEXT NOT NULL,    -- JSON array
      exclusions TEXT NOT NULL,        -- JSON array
      inferred_assumptions TEXT,       -- JSON array
      is_confirmed INTEGER DEFAULT 0,
      confidence REAL DEFAULT 0.92,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Accounts table (Researched companies)
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      domain TEXT,
      industry TEXT,
      size TEXT,
      location TEXT,
      description TEXT,
      tech_stack TEXT, -- JSON array
      source TEXT DEFAULT 'Manual Input',
      status TEXT DEFAULT 'ACTIVE',
      is_sample INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Contacts table (Decision makers & stakeholders)
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      linkedin_url TEXT,
      is_primary INTEGER DEFAULT 0,
      authority_level TEXT DEFAULT 'DECISION_MAKER',
      relevance_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- Opportunities table (Core business object)
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 70,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      stage TEXT NOT NULL DEFAULT 'DISCOVERED',
      why_now TEXT NOT NULL,
      summary TEXT,
      next_action_type TEXT NOT NULL,
      next_action_text TEXT NOT NULL,
      next_action_reason TEXT NOT NULL,
      next_action_urgency TEXT NOT NULL DEFAULT 'TODAY',
      next_action_due_at TEXT,
      next_action_confidence REAL DEFAULT 0.85,
      is_sample INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- Opportunity Scores breakdown & history
    CREATE TABLE IF NOT EXISTS opportunity_scores (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      fit_score INTEGER NOT NULL,
      need_score INTEGER NOT NULL,
      timing_score INTEGER NOT NULL,
      commercial_score INTEGER NOT NULL,
      evidence_quality INTEGER NOT NULL,
      confidence REAL NOT NULL,
      final_score INTEGER NOT NULL,
      calculated_at TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Signals table (Discrete market & corporate triggers)
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      signal_type TEXT NOT NULL, -- HIRING, TECH_STACK, FUNDING, EXPANSION, WEBSITE, LEADERSHIP
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source_url TEXT,
      detected_at TEXT NOT NULL,
      confidence REAL DEFAULT 0.9,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- Research Runs table
    CREATE TABLE IF NOT EXISTS research_runs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETE, FAILED
      current_step TEXT,
      progress_percent INTEGER DEFAULT 0,
      findings_count INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Research Sources table (Provenance tracking)
    CREATE TABLE IF NOT EXISTS research_sources (
      id TEXT PRIMARY KEY,
      research_run_id TEXT,
      account_id TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_title TEXT,
      source_domain TEXT,
      source_type TEXT NOT NULL, -- FIRST_PARTY, JOB_BOARD, SOCIAL, REGISTRY, NEWS
      status TEXT DEFAULT 'VERIFIED',
      retrieved_at TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- Opportunity Evidence table (OBSERVED, INFERRED, RECOMMENDED hierarchy)
    CREATE TABLE IF NOT EXISTS opportunity_evidence (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      claim TEXT NOT NULL,
      claim_type TEXT NOT NULL,
      evidence_level TEXT NOT NULL DEFAULT 'OBSERVED', -- OBSERVED, INFERRED, RECOMMENDED
      source_name TEXT NOT NULL,
      source_url TEXT,
      source_domain TEXT,
      observed_at TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.9,
      why_it_matters TEXT NOT NULL,
      is_disputed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- Outreach Drafts table
    CREATE TABLE IF NOT EXISTS outreach_drafts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      contact_id TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      tone TEXT NOT NULL DEFAULT 'FOUNDER_DIRECT',
      channel TEXT NOT NULL DEFAULT 'EMAIL',
      status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, APPROVED, SENT
      cited_evidence TEXT, -- JSON array
      rationale TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Follow-ups table
    CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      contact_id TEXT,
      reason TEXT NOT NULL,
      due_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, CANCELLED, RESCHEDULED
      completed_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      title TEXT NOT NULL,
      action_type TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DUE', -- DUE, OVERDUE, COMPLETED, SNOOZED
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Opportunity Notes table
    CREATE TABLE IF NOT EXISTS opportunity_notes (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Activities table (Real audit trail)
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL, -- RESEARCH_COMPLETED, SCORE_UPDATED, SIGNAL_DETECTED, OUTREACH_GENERATED, STAGE_CHANGED, FOLLOW_UP_SCHEDULED, NOTE_ADDED, ACCOUNT_CREATED
      title TEXT NOT NULL,
      detail TEXT NOT NULL,
      opportunity_id TEXT,
      account_name TEXT,
      timestamp TEXT NOT NULL,
      meta TEXT, -- JSON object
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT,
      type TEXT NOT NULL, -- OPPORTUNITY_ALERT, SIGNAL_DETECTED, SCORE_CHANGED, FOLLOW_UP_DUE, RESEARCH_COMPLETE
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      opportunity_id TEXT,
      read INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Integrations table (Placeholders & architecture)
    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      provider TEXT NOT NULL, -- GOOGLE, EMAIL, CALENDAR, LINKEDIN
      is_enabled INTEGER DEFAULT 0,
      config TEXT, -- JSON
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- AI Runs table (Observability & audit of model inferences)
    CREATE TABLE IF NOT EXISTS ai_runs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      operation TEXT NOT NULL, -- PARSE_ICP, RESEARCH, SCORE, NEXT_ACTION, OUTREACH
      model TEXT NOT NULL,
      prompt_tokens INTEGER,
      response_tokens INTEGER,
      latency_ms INTEGER,
      status TEXT NOT NULL, -- SUCCESS, FAILED, FALLBACK
      error_message TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Audit Logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members ON workspace_members(workspace_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_workspace ON accounts(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
    CREATE INDEX IF NOT EXISTS idx_opportunities_workspace ON opportunities(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
    CREATE INDEX IF NOT EXISTS idx_evidence_opportunity ON opportunity_evidence(opportunity_id);
    CREATE INDEX IF NOT EXISTS idx_signals_account ON signals(account_id);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_workspace ON follow_ups(workspace_id, status);
    CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_workspace ON notifications(workspace_id, read);
  `);
}

// Automatically initialize schema on module import
initDatabase();
