import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/db/database';
import { AuthService } from '../server/services/authService';

describe('Workspace Onboarding & Persistence Tests', () => {
  let testUser: any;
  let testWorkspace: any;

  before(() => {
    // Register a fresh test account
    const email = `test-onboarding-${Date.now()}@leadforge.dev`;
    const res = AuthService.register(email, 'SecurePass123!', 'Founder Alex');
    testUser = res.user;
    testWorkspace = res.workspace;
  });

  test('Workspace starts with onboarding not completed and not skipped', () => {
    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(testWorkspace.id) as any;
    assert.equal(ws.onboarding_completed, 0);
    assert.equal(ws.onboarding_skipped, 0);
  });

  test('Persists complete onboarding data into workspaces table', () => {
    const onboardingPayload = {
      workspaceName: 'Apex Revenue Systems',
      whatYouSell: 'Autonomous outbound pipeline infrastructure for enterprise sales teams',
      whoYouSellTo: 'B2B SaaS Chief Revenue Officers and VP of Sales',
      geographies: ['United States', 'Europe'],
      website: 'https://apexrevenue.io',
    };

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE workspaces
      SET name = COALESCE(?, name),
          website = COALESCE(?, website),
          description = COALESCE(?, description),
          onboarding_completed = 1,
          onboarding_skipped = 0,
          onboarding_data = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      onboardingPayload.workspaceName,
      onboardingPayload.website,
      onboardingPayload.whatYouSell,
      JSON.stringify(onboardingPayload),
      now,
      testWorkspace.id
    );

    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(testWorkspace.id) as any;
    assert.equal(ws.name, 'Apex Revenue Systems');
    assert.equal(ws.website, 'https://apexrevenue.io');
    assert.equal(ws.onboarding_completed, 1);
    assert.equal(ws.onboarding_skipped, 0);

    const parsed = JSON.parse(ws.onboarding_data);
    assert.equal(parsed.whatYouSell, onboardingPayload.whatYouSell);
    assert.deepEqual(parsed.geographies, ['United States', 'Europe']);
  });

  test('Persists skipped status without completing onboarding', () => {
    // Register another user
    const email = `test-skip-${Date.now()}@leadforge.dev`;
    const res = AuthService.register(email, 'SecurePass123!', 'Skip User');
    const wsId = res.workspace.id;

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE workspaces
      SET onboarding_completed = 0,
          onboarding_skipped = 1,
          updated_at = ?
      WHERE id = ?
    `).run(now, wsId);

    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(wsId) as any;
    assert.equal(ws.onboarding_completed, 0);
    assert.equal(ws.onboarding_skipped, 1);
  });

  test('Website URL validation logic handles protocols and domains', () => {
    function isValidWebsite(urlStr: string): boolean {
      const trimmed = urlStr.trim();
      if (!trimmed) return true;
      try {
        const toCheck = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(toCheck);
        return Boolean(parsed.hostname && parsed.hostname.includes('.') && parsed.hostname.length >= 4);
      } catch {
        return false;
      }
    }

    assert.equal(isValidWebsite('acme.com'), true);
    assert.equal(isValidWebsite('https://acme.com'), true);
    assert.equal(isValidWebsite('http://sub.domain.co.uk/path'), true);
    assert.equal(isValidWebsite(''), true); // optional
    assert.equal(isValidWebsite('not a url'), false);
    assert.equal(isValidWebsite('htp:/bad'), false);
  });

  test('ICP Profile updates persist and can be retrieved', () => {
    const profileId = `icp-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO icp_profiles (
        id, workspace_id, name, summary, target_industries, company_sizes, geographies,
        buyer_roles, buying_signals, exclusions, inferred_assumptions, is_confirmed, confidence, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.92, ?, ?)
    `).run(
      profileId,
      testWorkspace.id,
      'Apex ICP',
      'Targeting Series B SaaS',
      JSON.stringify(['B2B SaaS', 'Fintech']),
      JSON.stringify(['50-200 employees']),
      JSON.stringify(['United States']),
      JSON.stringify(['VP of Sales', 'CRO']),
      JSON.stringify(['Hiring SDRs']),
      JSON.stringify(['Pre-seed']),
      JSON.stringify(['High cloud adoption']),
      0,
      now,
      now
    );

    const profile = db.prepare('SELECT * FROM icp_profiles WHERE id = ?').get(profileId) as any;
    assert.ok(profile);
    assert.equal(profile.name, 'Apex ICP');
    assert.deepEqual(JSON.parse(profile.target_industries), ['B2B SaaS', 'Fintech']);
  });
});
