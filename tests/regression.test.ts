import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../server/services/authService';
import { SampleDataService } from '../server/services/sampleDataService';
import { db } from '../server/db/database';

test('LeadForge Core Regressions Test Suite', async (t) => {
  const email = `reg_user_${Date.now()}@agency.com`;
  const password = 'SecurePassword789!';
  const session = AuthService.register(email, password, 'Regression Tester');
  const workspaceId = session.workspace.id;

  // Seed sample data for this workspace
  SampleDataService.seedSampleData(workspaceId, session.user.id);

  await t.test('Workspace isolation: seed data is isolated per workspace', () => {
    const oppCount = db.prepare('SELECT COUNT(*) as cnt FROM opportunities WHERE workspace_id = ?').get(workspaceId) as { cnt: number };
    assert.ok(oppCount.cnt > 0, 'Workspace should have isolated opportunities provisioned');

    const otherWorkspaceOpps = db.prepare('SELECT COUNT(*) as cnt FROM opportunities WHERE workspace_id = ?').get('non-existent-workspace-id') as { cnt: number };
    assert.equal(otherWorkspaceOpps.cnt, 0, 'Non-existent workspace should have 0 opportunities');
  });

  await t.test('Opportunity stage and score persistence', () => {
    const opp = db.prepare('SELECT * FROM opportunities WHERE workspace_id = ? LIMIT 1').get(workspaceId) as any;
    assert.ok(opp, 'Opportunity must exist');

    // Update stage
    db.prepare('UPDATE opportunities SET stage = ? WHERE id = ? AND workspace_id = ?').run('CONTACTED', opp.id, workspaceId);
    const updatedOpp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opp.id) as any;
    assert.equal(updatedOpp.stage, 'CONTACTED', 'Opportunity stage should persist');

    // Update score
    db.prepare('UPDATE opportunities SET score = ? WHERE id = ? AND workspace_id = ?').run(98, opp.id, workspaceId);
    const scoredOpp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opp.id) as any;
    assert.equal(scoredOpp.score, 98, 'Opportunity score should persist');
  });

  await t.test('Account and Contact CRUD persistence', () => {
    const now = new Date().toISOString();
    const accId = `test_acc_${Date.now()}`;
    db.prepare(`
      INSERT INTO accounts (id, workspace_id, name, domain, industry, size, location, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(accId, workspaceId, 'Apex Dynamics', 'apexdynamics.com', 'DevTools', '25-50', 'Austin, TX', now, now);

    const acc = db.prepare('SELECT * FROM accounts WHERE id = ? AND workspace_id = ?').get(accId, workspaceId) as any;
    assert.ok(acc, 'Account should be inserted');
    assert.equal(acc.name, 'Apex Dynamics');

    // Create Contact
    const cntId = `test_cnt_${Date.now()}`;
    db.prepare(`
      INSERT INTO contacts (id, workspace_id, account_id, name, title, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cntId, workspaceId, accId, 'Morgan Reed', 'VP Engineering', 'morgan@apexdynamics.com', now, now);

    const cnt = db.prepare('SELECT * FROM contacts WHERE id = ? AND workspace_id = ?').get(cntId, workspaceId) as any;
    assert.ok(cnt, 'Contact should be inserted');
    assert.equal(cnt.email, 'morgan@apexdynamics.com');

    // Delete
    db.prepare('DELETE FROM contacts WHERE id = ? AND workspace_id = ?').run(cntId, workspaceId);
    const deletedCnt = db.prepare('SELECT * FROM contacts WHERE id = ?').get(cntId);
    assert.equal(deletedCnt, undefined, 'Contact should be deleted');
  });
});
