import crypto from 'node:crypto';
import { db } from '../db/database';

export class SampleDataService {
  static seedSampleData(workspaceId: string, userId?: string) {
    const now = new Date().toISOString();

    // Remove any previous sample data for this workspace first
    this.clearSampleData(workspaceId);

    const sampleAccounts = [
      {
        id: `acc-sample-${crypto.randomUUID().slice(0, 8)}`,
        name: 'Acme SaaS',
        domain: 'acme.io',
        industry: 'B2B SaaS / Enterprise Automation',
        size: '85 employees',
        location: 'San Francisco, CA',
        description: 'AI-first customer success workflow orchestration platform for mid-market software companies.',
        techStack: ['React', 'Next.js', 'PostgreSQL', 'Tailwind', 'Stripe', 'OpenAI'],
        source: 'Sample Fixtures',
        status: 'ACTIVE',
      },
      {
        id: `acc-sample-${crypto.randomUUID().slice(0, 8)}`,
        name: 'Nova Systems',
        domain: 'novasystems.tech',
        industry: 'Cybersecurity & Cloud Infrastructure',
        size: '140 employees',
        location: 'Austin, TX',
        description: 'Zero-trust network architecture and real-time posture defense for cloud-native engineering orgs.',
        techStack: ['AWS', 'Kubernetes', 'Go', 'Datadog', 'Terraform', 'React'],
        source: 'Sample Fixtures',
        status: 'ACTIVE',
      },
      {
        id: `acc-sample-${crypto.randomUUID().slice(0, 8)}`,
        name: 'PulseMetrics',
        domain: 'pulsemetrics.io',
        industry: 'Product Analytics & Retention',
        size: '52 employees',
        location: 'New York, NY',
        description: 'Product-led analytics and behavioral funnel automation for high-volume consumer mobile apps.',
        techStack: ['Snowflake', 'BigQuery', 'TypeScript', 'Node.js', 'Segment'],
        source: 'Sample Fixtures',
        status: 'ACTIVE',
      },
      {
        id: `acc-sample-${crypto.randomUUID().slice(0, 8)}`,
        name: 'Kova Health',
        domain: 'kovahealth.com',
        industry: 'Digital Health & Care Operations',
        size: '64 employees',
        location: 'Boston, MA',
        description: 'HIPAA-compliant telehealth scheduling, provider credentialing, and asynchronous patient messaging.',
        techStack: ['GCP', 'PostgreSQL', 'Python', 'React Native', 'Twilio'],
        source: 'Sample Fixtures',
        status: 'ACTIVE',
      },
      {
        id: `acc-sample-${crypto.randomUUID().slice(0, 8)}`,
        name: 'Lumina Commerce',
        domain: 'luminacommerce.com',
        industry: 'Headless E-Commerce Tech',
        size: '38 employees',
        location: 'Seattle, WA',
        description: 'Composable commerce engine and edge-cached storefront acceleration for omnichannel retailers.',
        techStack: ['Shopify Plus', 'Vercel', 'Next.js', 'Algolia', 'Sanity.io'],
        source: 'Sample Fixtures',
        status: 'ACTIVE',
      },
    ];

    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, workspace_id, name, domain, industry, size, location, description, tech_stack, source, status, is_sample, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const insertContact = db.prepare(`
      INSERT INTO contacts (id, workspace_id, account_id, name, title, email, phone, linkedin_url, is_primary, authority_level, relevance_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOpportunity = db.prepare(`
      INSERT INTO opportunities (
        id, workspace_id, account_id, score, priority, stage, why_now, summary,
        next_action_type, next_action_text, next_action_reason, next_action_urgency,
        next_action_due_at, next_action_confidence, is_sample, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const insertScore = db.prepare(`
      INSERT INTO opportunity_scores (id, opportunity_id, fit_score, need_score, timing_score, commercial_score, evidence_quality, confidence, final_score, calculated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEvidence = db.prepare(`
      INSERT INTO opportunity_evidence (
        id, workspace_id, opportunity_id, account_id, claim, claim_type, evidence_level,
        source_name, source_url, source_domain, observed_at, confidence, why_it_matters, is_disputed, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, workspace_id, opportunity_id, title, action_type, due_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertActivity = db.prepare(`
      INSERT INTO activities (id, workspace_id, type, title, detail, opportunity_id, account_name, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const acc of sampleAccounts) {
      insertAccount.run(
        acc.id,
        workspaceId,
        acc.name,
        acc.domain,
        acc.industry,
        acc.size,
        acc.location,
        acc.description,
        JSON.stringify(acc.techStack),
        acc.source,
        acc.status,
        now,
        now
      );

      // Contact
      const contactId = `cnt-sample-${crypto.randomUUID().slice(0, 8)}`;
      let contactName = 'Alex Morgan';
      let contactTitle = 'Founder & CEO';
      if (acc.name === 'Nova Systems') {
        contactName = 'Elena Rostova';
        contactTitle = 'VP of Engineering';
      } else if (acc.name === 'PulseMetrics') {
        contactName = 'Marcus Vance';
        contactTitle = 'Head of Growth';
      } else if (acc.name === 'Kova Health') {
        contactName = 'Dr. Sarah Lin';
        contactTitle = 'Co-Founder & Chief Medical Officer';
      } else if (acc.name === 'Lumina Commerce') {
        contactName = 'David Chen';
        contactTitle = 'Chief Product Officer';
      }

      insertContact.run(
        contactId,
        workspaceId,
        acc.id,
        contactName,
        contactTitle,
        `${contactName.toLowerCase().replace(' ', '.')}@${acc.domain}`,
        '+1 (415) 890-2134',
        `https://linkedin.com/in/${contactName.toLowerCase().replace(' ', '-')}`,
        1,
        'DECISION_MAKER',
        'Direct economic buyer and team lead for digital growth initiatives.',
        now,
        now
      );

      // Opportunity
      const oppId = `opp-sample-${crypto.randomUUID().slice(0, 8)}`;
      let score = 94;
      let whyNow = `Opened 4 senior technical roles and updated public API documentation this week.`;
      let nextActionType = 'contact_founder';
      let nextActionText = `Send personalized email to ${contactName} highlighting velocity optimization`;
      let nextActionReason = `Leverages their active hiring bottleneck and matches your agency's core specialty`;

      if (acc.name === 'Nova Systems') {
        score = 89;
        whyNow = `Announced SOC2 compliance push and expanded remote infrastructure team.`;
        nextActionType = 'contact_engineering_lead';
        nextActionText = `Share security automation case study with ${contactName}`;
        nextActionReason = `Directly addresses active compliance deadline`;
      } else if (acc.name === 'PulseMetrics') {
        score = 86;
        whyNow = `Launched new mobile SDK and announced Series A financing round.`;
        nextActionType = 'follow_up';
        nextActionText = `Follow up on mobile analytics integration architecture proposal`;
        nextActionReason = `Scheduled follow-up due based on last touchpoint`;
      }

      insertOpportunity.run(
        oppId,
        workspaceId,
        acc.id,
        score,
        score >= 90 ? 'HIGH' : 'MEDIUM',
        'QUALIFIED',
        whyNow,
        acc.description,
        nextActionType,
        nextActionText,
        nextActionReason,
        'TODAY',
        'Today · 3:00 PM',
        0.92,
        now,
        now
      );

      // Scores
      insertScore.run(
        crypto.randomUUID(),
        oppId,
        96,
        90,
        92,
        88,
        94,
        0.92,
        score,
        now
      );

      // Evidence (OBSERVED, INFERRED, RECOMMENDED hierarchy)
      insertEvidence.run(
        crypto.randomUUID(),
        workspaceId,
        oppId,
        acc.id,
        `${acc.name} published 4 job postings for senior engineering and commercial leads.`,
        'HIRING',
        'OBSERVED',
        `${acc.domain}/careers`,
        `https://${acc.domain}/careers`,
        acc.domain,
        'Yesterday',
        0.95,
        'Rapid headcount expansion signals active commercial budget allocation and execution urgency.',
        now
      );

      insertEvidence.run(
        crypto.randomUUID(),
        workspaceId,
        oppId,
        acc.id,
        `Leadership may be experiencing delivery bottlenecks while scaling current client commitments.`,
        'EXPANSION',
        'INFERRED',
        'LeadForge Growth Inference Engine',
        null,
        acc.domain,
        'Yesterday',
        0.88,
        'Provides a compelling founder-to-founder conversation angle focusing on external team bandwidth.',
        now
      );

      // Task
      insertTask.run(
        crypto.randomUUID(),
        workspaceId,
        oppId,
        nextActionText,
        nextActionType,
        'Today',
        'DUE',
        now
      );

      // Activity
      insertActivity.run(
        crypto.randomUUID(),
        workspaceId,
        'SCORE_UPDATED',
        `Sample Opportunity Prioritized: ${acc.name}`,
        `Calculated initial score of ${score}/100 based on active hiring and strategic ICP alignment.`,
        oppId,
        acc.name,
        'Just now',
        now
      );
    }

    return { sampleCount: sampleAccounts.length };
  }

  static clearSampleData(workspaceId: string) {
    db.prepare('DELETE FROM opportunities WHERE workspace_id = ? AND is_sample = 1').run(workspaceId);
    db.prepare('DELETE FROM accounts WHERE workspace_id = ? AND is_sample = 1').run(workspaceId);
  }
}
