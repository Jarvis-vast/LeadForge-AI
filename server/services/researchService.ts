import crypto from 'node:crypto';
import { db } from '../db/database';
import { AIGateway } from './aiGateway';

export class ResearchService {
  /**
   * Fetches public web content safely with timeout, redirect handling, and clear error classification
   */
  static async retrievePublicSource(domain?: string): Promise<{
    url: string;
    content?: string;
    status: 'VERIFIED' | 'UNAVAILABLE' | 'UNVERIFIED' | 'PARTIAL';
    errorReason?: string;
    statusCode?: number;
  }> {
    if (!domain || !domain.trim()) {
      return {
        url: 'https://unknown',
        status: 'UNAVAILABLE',
        errorReason: 'No domain provided for account.',
      };
    }

    const cleanDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const url = `https://${cleanDomain}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'LeadForge Research Scanner/1.0 (+https://leadforge.ai/bot; bot@leadforge.ai)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          url,
          status: 'UNAVAILABLE',
          statusCode: response.status,
          errorReason: `HTTP ${response.status} ${response.statusText || 'Error'}`,
        };
      }

      const text = await response.text();
      // Safe HTML extraction: clean text, extract title and description
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      const metaDescMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

      const cleanedText = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4500);

      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = metaDescMatch ? metaDescMatch[1].trim() : '';

      return {
        url,
        content: `Title: ${title}\nDescription: ${description}\nSnippet: ${cleanedText}`,
        status: cleanedText.length > 50 ? 'VERIFIED' : 'PARTIAL',
        statusCode: response.status,
      };
    } catch (err: any) {
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      const reason = isAbort
        ? 'Connection timed out after 5000ms'
        : err.message || 'DNS lookup failed or host unreachable';

      return {
        url,
        content: undefined,
        status: 'UNAVAILABLE',
        errorReason: reason,
      };
    }
  }

  /**
   * Complete real research run for an opportunity
   */
  static async runOpportunityResearch(opportunityId: string, workspaceId: string) {
    const opp = db.prepare(`
      SELECT o.*, a.name as account_name, a.domain, a.industry, a.description as account_description
      FROM opportunities o
      JOIN accounts a ON a.id = o.account_id
      WHERE o.id = ? AND o.workspace_id = ?
    `).get(opportunityId, workspaceId) as any;

    if (!opp) {
      throw new Error('Opportunity not found');
    }

    const runId = `run-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // 1. Create Research Run record
    db.prepare(`
      INSERT INTO research_runs (id, workspace_id, opportunity_id, account_name, status, current_step, progress_percent, started_at)
      VALUES (?, ?, ?, ?, 'RUNNING', 'Connecting to public web source...', 20, ?)
    `).run(runId, workspaceId, opportunityId, opp.account_name, now);

    try {
      // 2. Fetch public source
      const retrieved = await this.retrievePublicSource(opp.domain);
      const sourceUrl = retrieved?.url || (opp.domain ? `https://${opp.domain}` : 'Public Domain');
      const sourceDomain = opp.domain || 'domain-unspecified';
      const isUnavailable = retrieved.status === 'UNAVAILABLE';

      // Record source with actual observed status
      db.prepare(`
        INSERT INTO research_sources (id, research_run_id, account_id, source_url, source_title, source_domain, source_type, status, retrieved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        runId,
        opp.account_id,
        sourceUrl,
        isUnavailable
          ? `${opp.account_name} (Unreachable: ${retrieved.errorReason})`
          : `${opp.account_name} Web Source`,
        sourceDomain,
        'FIRST_PARTY',
        retrieved.status,
        now
      );

      // Clear old evidence for this opportunity
      db.prepare('DELETE FROM opportunity_evidence WHERE opportunity_id = ?').run(opportunityId);

      const insertEvidence = db.prepare(`
        INSERT INTO opportunity_evidence (
          id, workspace_id, opportunity_id, account_id, claim, claim_type, evidence_level,
          source_name, source_url, source_domain, observed_at, confidence, why_it_matters, is_disputed, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `);

      if (isUnavailable) {
        // DO NOT generate fake research findings!
        // Record honest unverified evidence
        insertEvidence.run(
          crypto.randomUUID(),
          workspaceId,
          opportunityId,
          opp.account_id,
          `Website could not be accessed (${retrieved.errorReason || 'Unavailable'}). Live signals unverified.`,
          'VERIFICATION',
          'UNVERIFIED',
          'LeadForge Research Scanner',
          sourceUrl,
          sourceDomain,
          'Just now',
          0.45,
          'Requires manual verification before initiating outreach. Source was inaccessible during research scan.',
          now
        );

        // Conservative baseline score with confidence penalty
        const fit = 68;
        const need = 60;
        const timing = 55;
        const commercial = 60;
        const evidenceQuality = 35;
        const confidence = 0.45;

        const finalScore = Math.round(
          0.30 * fit + 0.25 * need + 0.20 * timing + 0.15 * commercial + 0.10 * evidenceQuality
        );

        db.prepare(`
          INSERT INTO opportunity_scores (id, opportunity_id, fit_score, need_score, timing_score, commercial_score, evidence_quality, confidence, final_score, calculated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), opportunityId, fit, need, timing, commercial, evidenceQuality, confidence, finalScore, now);

        const nextAction = {
          actionType: 'verify_domain',
          actionText: `Manually verify domain and status for ${opp.account_name}`,
          reason: `Automated web scan could not access ${sourceDomain} (${retrieved.errorReason})`,
          urgency: 'THIS_WEEK',
          confidence: 0.5,
        };

        const oldScore = opp.score;
        db.prepare(`
          UPDATE opportunities
          SET score = ?, priority = 'LOW',
              why_now = ?, summary = ?,
              next_action_type = ?, next_action_text = ?, next_action_reason = ?, next_action_urgency = ?,
              next_action_confidence = ?, updated_at = ?
          WHERE id = ?
        `).run(
          finalScore,
          `Web source unverified (${retrieved.errorReason}). Conservative baseline applied.`,
          `${opp.account_name} domain ${sourceDomain} was unreachable during scan (${retrieved.errorReason}). Manual verification needed.`,
          nextAction.actionType,
          nextAction.actionText,
          nextAction.reason,
          nextAction.urgency,
          confidence,
          now,
          opportunityId
        );

        db.prepare(`
          INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
          VALUES (?, ?, 'RESEARCH_COMPLETED', ?, ?, ?, ?, 'Just now', ?)
        `).run(
          crypto.randomUUID(),
          workspaceId,
          `Research Completed: ${opp.account_name} (Partial)`,
          `Target domain ${sourceDomain} unreachable (${retrieved.errorReason}). Baseline score set to ${finalScore}.`,
          opportunityId,
          opp.account_name,
          now
        );

        db.prepare(`
          UPDATE research_runs
          SET status = 'PARTIAL', current_step = 'Web source unreachable. Recorded unverified baseline.',
              progress_percent = 100, findings_count = 1, completed_at = ?
          WHERE id = ?
        `).run(now, runId);

        return {
          runId,
          score: finalScore,
          findingsCount: 1,
          status: 'PARTIAL',
          sourceStatus: 'UNAVAILABLE',
          errorReason: retrieved.errorReason,
          research: {
            summary: `Web source unreachable for ${opp.account_name} (${retrieved.errorReason}).`,
            whyNow: 'Pending manual website verification.',
            fitScore: fit,
            needScore: need,
            timingScore: timing,
            commercialScore: commercial,
            evidenceQuality,
            confidence,
            findings: [
              {
                claim: `Target domain ${sourceDomain} unreachable (${retrieved.errorReason}).`,
                claimType: 'VERIFICATION',
                evidenceLevel: 'UNVERIFIED',
                source: sourceDomain,
                observedAt: 'Just now',
                confidence: 0.45,
                whyItMatters: 'Requires manual verification before outreach.',
              },
            ],
            nextAction,
          },
        };
      }

      // 3. Web source successfully retrieved -> Analyze with AIGateway
      db.prepare(`
        UPDATE research_runs
        SET current_step = 'Synthesizing evidence from verified source', progress_percent = 70
        WHERE id = ?
      `).run(runId);

      const { research, source: aiSource, isFallback } = await AIGateway.researchAccount(
        opp.account_name,
        opp.domain,
        opp.industry,
        retrieved.content,
        workspaceId
      );

      const findings = research.findings || [];
      if (findings.length === 0) {
        insertEvidence.run(
          crypto.randomUUID(),
          workspaceId,
          opportunityId,
          opp.account_id,
          'Verified website content retrieved; no anomalous trigger detected.',
          'MONITORING',
          'OBSERVED',
          'LeadForge Research Scanner',
          sourceUrl,
          sourceDomain,
          'Just now',
          0.85,
          'Baseline profile confirmed from first-party web presence.',
          now
        );
      } else {
        for (const finding of findings) {
          insertEvidence.run(
            crypto.randomUUID(),
            workspaceId,
            opportunityId,
            opp.account_id,
            finding.claim,
            finding.claimType || 'MARKET',
            finding.evidenceLevel || 'OBSERVED',
            finding.source || `${sourceDomain}`,
            sourceUrl,
            sourceDomain,
            finding.observedAt || 'Recently',
            finding.confidence || 0.9,
            finding.whyItMatters || 'Validated strategic trigger.',
            now
          );
        }
      }

      // 4. Update Opportunity Score & Breakdown
      const fit = research.fitScore || 85;
      const need = research.needScore || 80;
      const timing = research.timingScore || 82;
      const commercial = research.commercialScore || 80;
      const evidenceQuality = research.evidenceQuality || 88;
      const confidence = research.confidence || 0.9;

      const finalScore = Math.round(
        0.30 * fit + 0.25 * need + 0.20 * timing + 0.15 * commercial + 0.10 * evidenceQuality
      );

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

      const nextAction = research.nextAction || {
        actionType: 'contact_founder',
        actionText: `Contact founder regarding strategic growth and velocity`,
        reason: 'Recommended based on verified company alignment',
        urgency: 'TODAY',
        confidence: 0.88,
      };

      const oldScore = opp.score;
      db.prepare(`
        UPDATE opportunities
        SET score = ?, priority = ?, why_now = ?, summary = ?,
            next_action_type = ?, next_action_text = ?, next_action_reason = ?, next_action_urgency = ?,
            next_action_confidence = ?, updated_at = ?
        WHERE id = ?
      `).run(
        finalScore,
        finalScore >= 90 ? 'HIGH' : finalScore >= 75 ? 'MEDIUM' : 'LOW',
        research.whyNow || opp.why_now,
        research.summary || opp.summary,
        nextAction.actionType,
        nextAction.actionText,
        nextAction.reason,
        nextAction.urgency || 'TODAY',
        confidence,
        now,
        opportunityId
      );

      // Record Activity
      db.prepare(`
        INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
        VALUES (?, ?, 'RESEARCH_COMPLETED', ?, ?, ?, ?, 'Just now', ?)
      `).run(
        crypto.randomUUID(),
        workspaceId,
        `Research Completed: ${opp.account_name}`,
        `Verified source from ${sourceDomain}. Score updated: ${oldScore} → ${finalScore}.`,
        opportunityId,
        opp.account_name,
        now
      );

      // Complete Research Run
      db.prepare(`
        UPDATE research_runs
        SET status = 'COMPLETE', current_step = 'Synthesized evidence & updated score',
            progress_percent = 100, findings_count = ?, completed_at = ?
        WHERE id = ?
      `).run(findings.length, now, runId);

      return {
        runId,
        score: finalScore,
        findingsCount: findings.length,
        status: 'COMPLETE',
        sourceStatus: retrieved.status,
        research,
        aiSource,
        isFallback: Boolean(isFallback),
      };
    } catch (err: any) {
      db.prepare(`
        UPDATE research_runs
        SET status = 'FAILED', error_message = ?, completed_at = ?
        WHERE id = ?
      `).run(err.message, now, runId);
      throw err;
    }
  }
}
