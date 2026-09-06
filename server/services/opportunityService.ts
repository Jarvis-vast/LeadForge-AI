import crypto from 'node:crypto';
import { db } from '../db/database';

export class OpportunityService {
  /**
   * Retrieves all opportunities for a workspace, enriched with account, contacts, evidence, and scores
   */
  static getOpportunities(workspaceId: string, options?: { todayOnly?: boolean }) {
    const oppRows = db.prepare(`
      SELECT o.*,
             a.name as account_name,
             a.domain as account_domain,
             a.industry as account_industry,
             a.size as account_size,
             a.location as account_location,
             a.description as account_description,
             a.tech_stack as account_tech_stack,
             a.source as account_source
      FROM opportunities o
      JOIN accounts a ON a.id = o.account_id
      WHERE o.workspace_id = ?
      ORDER BY o.score DESC, o.updated_at DESC
    `).all(workspaceId) as any[];

    // Fetch evidence, tasks, and primary contacts for all opportunities in workspace
    const evidenceRows = db.prepare(`
      SELECT * FROM opportunity_evidence WHERE workspace_id = ?
    `).all(workspaceId) as any[];

    const taskRows = db.prepare(`
      SELECT * FROM tasks WHERE workspace_id = ?
    `).all(workspaceId) as any[];

    const contactRows = db.prepare(`
      SELECT * FROM contacts WHERE workspace_id = ?
    `).all(workspaceId) as any[];

    const scoreRows = db.prepare(`
      SELECT * FROM opportunity_scores ORDER BY calculated_at DESC
    `).all() as any[];

    return oppRows.map((opp) => {
      const oppEvidence = evidenceRows.filter((e) => e.opportunity_id === opp.id);
      const oppTasks = taskRows.filter((t) => t.opportunity_id === opp.id);
      const oppContacts = contactRows.filter((c) => c.account_id === opp.account_id);
      const latestScore = scoreRows.find((s) => s.opportunity_id === opp.id);

      // Multi-factor Today's Opportunities Dynamic Ranking (Spec #20)
      let dynamicScore = opp.score;
      const priorityReasons: string[] = [];

      const hasOverdue = oppTasks.some((t) => t.status === 'OVERDUE');
      const hasDueToday = oppTasks.some((t) => t.status === 'DUE') || opp.next_action_urgency === 'TODAY' || opp.next_action_urgency === 'IMMEDIATE';

      if (hasOverdue) {
        dynamicScore += 12;
        priorityReasons.push('Overdue follow-up deadline');
      } else if (hasDueToday) {
        dynamicScore += 8;
        priorityReasons.push('Action scheduled for today');
      }

      if (oppEvidence.length >= 2) {
        dynamicScore += 6;
        priorityReasons.push(`${oppEvidence.length} fresh market signals`);
      }

      if (opp.stage === 'QUALIFIED' || opp.stage === 'READY_TO_CONTACT') {
        dynamicScore += 4;
        priorityReasons.push('Strategic ICP match ready for action');
      }

      const scoreBreakdown = latestScore
        ? {
            fit: latestScore.fit_score,
            need: latestScore.need_score,
            timing: latestScore.timing_score,
            commercial: latestScore.commercial_score,
            evidenceQuality: latestScore.evidence_quality,
            confidence: latestScore.confidence,
          }
        : {
            fit: Math.min(100, opp.score + 2),
            need: Math.min(100, opp.score - 4),
            timing: opp.score,
            commercial: Math.min(100, opp.score - 2),
            evidenceQuality: 88,
            confidence: opp.next_action_confidence || 0.9,
          };

      return {
        id: opp.id,
        accountId: opp.account_id,
        account: {
          id: opp.account_id,
          name: opp.account_name,
          domain: opp.account_domain,
          industry: opp.account_industry,
          size: opp.account_size,
          location: opp.account_location,
          description: opp.account_description,
          techStack: opp.account_tech_stack ? JSON.parse(opp.account_tech_stack) : [],
          source: opp.account_source,
          createdAt: opp.created_at,
        },
        score: opp.score,
        dynamicScore: Math.min(100, dynamicScore),
        priority: opp.priority,
        priorityReasons: priorityReasons.length > 0 ? priorityReasons : ['Strategic ICP fit'],
        stage: opp.stage,
        whyNow: opp.why_now,
        summary: opp.summary || opp.account_description,
        scoreBreakdown,
        nextAction: {
          type: opp.next_action_type,
          label: opp.next_action_text,
          dueAt: opp.next_action_due_at || 'Today',
          urgency: opp.next_action_urgency,
          reason: opp.next_action_reason,
          confidence: opp.next_action_confidence || 0.88,
        },
        evidenceCount: oppEvidence.length,
        unreadSignalsCount: oppEvidence.length,
        updatedAt: opp.updated_at,
        createdAt: opp.created_at,
      };
    });
  }

  /**
   * Transition opportunity stage (Opportunity State Machine Spec #23)
   */
  static updateStage(opportunityId: string, newStage: string, workspaceId: string) {
    const opp = db.prepare('SELECT o.*, a.name as account_name FROM opportunities o JOIN accounts a ON a.id = o.account_id WHERE o.id = ? AND o.workspace_id = ?').get(opportunityId, workspaceId) as any;
    if (!opp) throw new Error('Opportunity not found');

    const oldStage = opp.stage;
    const now = new Date().toISOString();

    db.prepare('UPDATE opportunities SET stage = ?, updated_at = ? WHERE id = ?').run(newStage, now, opportunityId);

    // Record Activity
    db.prepare(`
      INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
      VALUES (?, ?, 'STAGE_CHANGED', ?, ?, ?, ?, 'Just now', ?)
    `).run(
      crypto.randomUUID(),
      workspaceId,
      `Pipeline Stage Advanced: ${opp.account_name}`,
      `Advanced from ${oldStage} → ${newStage}`,
      opportunityId,
      opp.account_name,
      now
    );

    return { id: opportunityId, oldStage, newStage };
  }

  /**
   * Recalculate score with full audit trail
   */
  static updateScore(opportunityId: string, breakdown: any, workspaceId: string) {
    const opp = db.prepare('SELECT o.*, a.name as account_name FROM opportunities o JOIN accounts a ON a.id = o.account_id WHERE o.id = ? AND o.workspace_id = ?').get(opportunityId, workspaceId) as any;
    if (!opp) throw new Error('Opportunity not found');

    const fit = Number(breakdown.fit) || 80;
    const need = Number(breakdown.need) || 80;
    const timing = Number(breakdown.timing) || 80;
    const commercial = Number(breakdown.commercial) || 80;
    const evidenceQuality = Number(breakdown.evidenceQuality) || 80;
    const confidence = Number(breakdown.confidence) || 0.9;

    const finalScore = Math.round(
      0.30 * fit + 0.25 * need + 0.20 * timing + 0.15 * commercial + 0.10 * evidenceQuality
    );

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO opportunity_scores (id, opportunity_id, fit_score, need_score, timing_score, commercial_score, evidence_quality, confidence, final_score, calculated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      opportunityId,
      fit,
      need,
      timing,
      commercial,
      evidenceQuality,
      confidence,
      finalScore,
      now
    );

    const oldScore = opp.score;
    db.prepare('UPDATE opportunities SET score = ?, updated_at = ? WHERE id = ?').run(finalScore, now, opportunityId);

    // Record Activity
    db.prepare(`
      INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
      VALUES (?, ?, 'SCORE_UPDATED', ?, ?, ?, ?, 'Just now', ?)
    `).run(
      crypto.randomUUID(),
      workspaceId,
      `Opportunity Score Adjusted: ${opp.account_name}`,
      `Score updated from ${oldScore} → ${finalScore}/100.`,
      opportunityId,
      opp.account_name,
      now
    );

    return { id: opportunityId, oldScore, finalScore, breakdown };
  }

  /**
   * Create a new Account & automatically initialize an Opportunity
   */
  static createAccount(workspaceId: string, accountData: any) {
    const accountId = `acc-${crypto.randomUUID().slice(0, 8)}`;
    const oppId = `opp-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const techStack = Array.isArray(accountData.techStack)
      ? JSON.stringify(accountData.techStack)
      : typeof accountData.techStack === 'string'
      ? JSON.stringify(accountData.techStack.split(',').map((s: string) => s.trim()))
      : '[]';

    db.prepare(`
      INSERT INTO accounts (id, workspace_id, name, domain, industry, size, location, description, tech_stack, source, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `).run(
      accountId,
      workspaceId,
      accountData.name,
      accountData.domain || '',
      accountData.industry || 'Technology & Digital Services',
      accountData.size || '20-100 employees',
      accountData.location || 'United States',
      accountData.description || `Target account: ${accountData.name}`,
      techStack,
      accountData.source || 'Manual Creation',
      now,
      now
    );

    // Create Primary Contact if provided
    if (accountData.contactName) {
      const contactId = `cnt-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO contacts (id, workspace_id, account_id, name, title, email, phone, linkedin_url, is_primary, authority_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'DECISION_MAKER', ?, ?)
      `).run(
        contactId,
        workspaceId,
        accountId,
        accountData.contactName,
        accountData.contactRole || 'Founder / CEO',
        accountData.email || '',
        accountData.phone || '',
        accountData.linkedinUrl || '',
        now,
        now
      );
    }

    // Initialize Opportunity
    const initialScore = 78;
    db.prepare(`
      INSERT INTO opportunities (
        id, workspace_id, account_id, score, priority, stage, why_now, summary,
        next_action_type, next_action_text, next_action_reason, next_action_urgency,
        next_action_due_at, next_action_confidence, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 'MEDIUM', 'DISCOVERED', ?, ?, 'contact_founder', ?, 'Initial discovery touchpoint for high-intent account', 'TODAY', 'Today', 0.85, ?, ?)
    `).run(
      oppId,
      workspaceId,
      accountId,
      initialScore,
      `New prospect account added to workspace pipeline.`,
      accountData.description || `${accountData.name} commercial account.`,
      `Conduct initial research and draft tailored outreach note`,
      now,
      now
    );

    // Initial Evidence
    db.prepare(`
      INSERT INTO opportunity_evidence (
        id, workspace_id, opportunity_id, account_id, claim, claim_type, evidence_level,
        source_name, source_url, source_domain, observed_at, confidence, why_it_matters, is_disputed, created_at
      )
      VALUES (?, ?, ?, ?, ?, 'INTENT', 'OBSERVED', 'LeadForge Account Ingestion', ?, ?, 'Today', 0.95, 'Account added to pipeline for sales development.', 0, ?)
    `).run(
      crypto.randomUUID(),
      workspaceId,
      oppId,
      accountId,
      `Account ${accountData.name} added to pipeline.`,
      accountData.domain ? `https://${accountData.domain}` : 'Account Registry',
      accountData.domain || '',
      now
    );

    // Activity
    db.prepare(`
      INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
      VALUES (?, ?, 'ACCOUNT_CREATED', ?, ?, ?, ?, 'Just now', ?)
    `).run(
      crypto.randomUUID(),
      workspaceId,
      `Account Created: ${accountData.name}`,
      `Ingested new account into workspace. Initial opportunity prioritized.`,
      oppId,
      accountData.name,
      now
    );

    return { accountId, opportunityId: oppId };
  }

  /**
   * Real CSV Import with parsing and duplicate deduplication (Spec #26)
   */
  static importCSV(workspaceId: string, rows: any[]) {
    let imported = 0;
    let duplicates = 0;

    for (const row of rows) {
      const name = row.companyName || row.name || row['Company Name'] || row.Company;
      if (!name) continue;

      const domain = row.domain || row.website || row.Website || row.Domain || '';
      // Check duplicate
      const existing = db.prepare(`
        SELECT id FROM accounts WHERE workspace_id = ? AND (LOWER(name) = LOWER(?) OR (domain != '' AND LOWER(domain) = LOWER(?)))
      `).get(workspaceId, name, domain);

      if (existing) {
        duplicates++;
        continue;
      }

      this.createAccount(workspaceId, {
        name,
        domain,
        industry: row.industry || row.Industry || 'Technology',
        size: row.size || row.Size || '10-50 employees',
        location: row.location || row.Location || 'United States',
        description: row.description || row.Notes || row.notes || `Imported prospect: ${name}`,
        contactName: row.contactName || row['Contact Name'] || row.contact_name,
        contactRole: row.contactRole || row['Contact Role'] || row.title || row.Title,
        email: row.email || row.Email,
        linkedinUrl: row.linkedinUrl || row['LinkedIn URL'] || row.linkedin,
        source: 'CSV Import',
      });

      imported++;
    }

    return { imported, duplicates };
  }
}
