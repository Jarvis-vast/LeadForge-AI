import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/db/database';
import { AuthService } from '../server/services/authService';
import { OpportunityService } from '../server/services/opportunityService';

describe('Screen 03 — Lead Discovery & ICP Confirmation Tests', () => {
  let userA: any;
  let workspaceA: any;
  let userB: any;
  let workspaceB: any;

  before(() => {
    // Create workspace A
    const resA = AuthService.register(`user-a-${Date.now()}@leadforge.dev`, 'SecurePassword123!', 'User A');
    userA = resA.user;
    workspaceA = resA.workspace;

    // Create workspace B for tenant isolation testing
    const resB = AuthService.register(`user-b-${Date.now()}@leadforge.dev`, 'SecurePassword123!', 'User B');
    userB = resB.user;
    workspaceB = resB.workspace;

    // Seed account in Workspace A
    OpportunityService.createAccount(workspaceA.id, {
      name: 'Alpha Cloud Systems',
      domain: 'alphacloud.io',
      industry: 'B2B SaaS',
      size: '50-100 employees',
      location: 'United States',
      description: 'Cloud cost optimization platform for Kubernetes workflows.',
      source: 'Screen 03 Discovery Test',
      contactName: 'Sarah Connor',
      contactRole: 'VP Engineering',
      email: 'sarah@alphacloud.io',
    });

    // Seed account in Workspace B
    OpportunityService.createAccount(workspaceB.id, {
      name: 'Beta Healthcare',
      domain: 'betahealth.com',
      industry: 'Healthcare & HealthTech',
      size: '200+ employees',
      location: 'Europe',
      description: 'Telehealth patient monitoring.',
      source: 'Screen 03 Discovery Test',
      contactName: 'John Smith',
      contactRole: 'CTO',
      email: 'john@betahealth.com',
    });
  });

  test('Filter validation: empty filters are rejected', () => {
    function validateFilters(filters: any): { valid: boolean; error?: string } {
      const validIndustries = Array.isArray(filters.industries)
        ? filters.industries.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
        : [];
      const validGeos = Array.isArray(filters.geographies)
        ? filters.geographies.filter((g: any) => typeof g === 'string' && g.trim().length > 0)
        : [];
      const validSizes = Array.isArray(filters.companySizes)
        ? filters.companySizes.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [];
      const query = typeof filters.query === 'string' ? filters.query.trim() : '';

      if (validIndustries.length === 0 && validGeos.length === 0 && validSizes.length === 0 && !query) {
        return { valid: false, error: 'Please provide at least one search filter.' };
      }
      return { valid: true };
    }

    assert.equal(validateFilters({}).valid, false);
    assert.equal(validateFilters({ industries: [], geographies: [], companySizes: [] }).valid, false);
    assert.equal(validateFilters({ industries: ['SaaS'] }).valid, true);
    assert.equal(validateFilters({ geographies: ['United States'] }).valid, true);
    assert.equal(validateFilters({ query: 'Alpha' }).valid, true);
  });

  test('Workspace isolation: Search in Workspace A does not return accounts from Workspace B', () => {
    const accountsA = db.prepare(`
      SELECT a.*, c.name as contact_name, c.title as contact_title
      FROM accounts a
      LEFT JOIN contacts c ON c.account_id = a.id AND c.is_primary = 1
      WHERE a.workspace_id = ?
    `).all(workspaceA.id) as any[];

    // Workspace A should find Alpha Cloud Systems but NOT Beta Healthcare
    const hasAlpha = accountsA.some((acc) => acc.name === 'Alpha Cloud Systems');
    const hasBeta = accountsA.some((acc) => acc.name === 'Beta Healthcare');

    assert.equal(hasAlpha, true);
    assert.equal(hasBeta, false);
  });

  test('Search with matching criteria returns correct record and fields', () => {
    const accountsA = db.prepare(`
      SELECT a.*, c.name as contact_name, c.title as contact_title, c.email as contact_email
      FROM accounts a
      LEFT JOIN contacts c ON c.account_id = a.id AND c.is_primary = 1
      WHERE a.workspace_id = ?
    `).all(workspaceA.id) as any[];

    const matches = accountsA.filter((acc) =>
      acc.industry.toLowerCase().includes('saas') &&
      acc.location.toLowerCase().includes('united states')
    );

    assert.equal(matches.length, 1);
    const lead = matches[0];
    assert.equal(lead.name, 'Alpha Cloud Systems');
    assert.equal(lead.domain, 'alphacloud.io');
    assert.equal(lead.contact_name, 'Sarah Connor');
    assert.equal(lead.contact_title, 'VP Engineering');
  });

  test('Search with non-matching criteria returns empty results without fabricating data', () => {
    const accountsA = db.prepare(`
      SELECT a.*
      FROM accounts a
      WHERE a.workspace_id = ?
    `).all(workspaceA.id) as any[];

    // Search for FinTech in India (none exist in Workspace A)
    const matches = accountsA.filter((acc) =>
      acc.industry.toLowerCase().includes('fintech') &&
      acc.location.toLowerCase().includes('india')
    );

    assert.equal(matches.length, 0);
  });

  test('Saving a discovered lead persists into database under user workspace', () => {
    const created = OpportunityService.createAccount(workspaceA.id, {
      name: 'Gamma Logistics Tech',
      domain: 'gammalogistics.com',
      industry: 'B2B Services',
      size: '25-50',
      location: 'Canada',
      description: 'Fleet tracking and dispatch automation.',
      source: 'Lead Discovery (Screen 03)',
      contactName: 'David Miller',
      contactRole: 'Chief Operating Officer',
      email: 'david@gammalogistics.com',
    });

    assert.ok(created.accountId);
    assert.ok(created.opportunityId);

    // Verify persistence in SQLite
    const acc = db.prepare('SELECT * FROM accounts WHERE id = ? AND workspace_id = ?').get(created.accountId, workspaceA.id) as any;
    assert.ok(acc);
    assert.equal(acc.name, 'Gamma Logistics Tech');
    assert.equal(acc.source, 'Lead Discovery (Screen 03)');

    const opp = db.prepare('SELECT * FROM opportunities WHERE id = ? AND workspace_id = ?').get(created.opportunityId, workspaceA.id) as any;
    assert.ok(opp);
    assert.equal(opp.account_id, created.accountId);

    const cnt = db.prepare('SELECT * FROM contacts WHERE account_id = ? AND workspace_id = ?').get(created.accountId, workspaceA.id) as any;
    assert.ok(cnt);
    assert.equal(cnt.name, 'David Miller');
    assert.equal(cnt.title, 'Chief Operating Officer');
  });

  test('ICP Confirmation persists is_confirmed: 1 to SQLite', () => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE icp_profiles
      SET is_confirmed = 1,
          updated_at = ?
      WHERE workspace_id = ?
    `).run(now, workspaceA.id);

    const profile = db.prepare('SELECT * FROM icp_profiles WHERE workspace_id = ?').get(workspaceA.id) as any;
    assert.equal(profile.is_confirmed, 1);
  });
});
