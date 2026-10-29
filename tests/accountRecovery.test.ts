import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import crypto from "node:crypto";
import { AuthService } from "../server/services/authService";
import { db } from "../server/db/database";

test("LeadForge Account Recovery Test Suite", async (t) => {
  const TEST_SECRET = "leadforge-owner-recovery-secret-test-2026";
  const originalEnvSecret = process.env.LEADFORGE_RECOVERY_SECRET;

  t.afterEach(() => {
    // Restore environment variable after each test
    if (originalEnvSecret !== undefined) {
      process.env.LEADFORGE_RECOVERY_SECRET = originalEnvSecret;
    } else {
      delete process.env.LEADFORGE_RECOVERY_SECRET;
    }
  });

  await t.test("Recovery is disabled when LEADFORGE_RECOVERY_SECRET is unset", () => {
    delete process.env.LEADFORGE_RECOVERY_SECRET;
    const testEmail = `disabled_rec_${Date.now()}@agency.com`;

    assert.throws(
      () => {
        AuthService.recoverAccount(testEmail, TEST_SECRET, "NewPassword123!");
      },
      { message: /Account recovery is not configured on this server/i }
    );
  });

  await t.test("Rejects recovery when provided secret is invalid or empty", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const testEmail = `bad_sec_${Date.now()}@agency.com`;
    AuthService.register(testEmail, "OriginalPass123!", "Sec Founder");

    // Empty secret
    assert.throws(
      () => {
        AuthService.recoverAccount(testEmail, "", "NewPassword123!");
      },
      { message: /Invalid recovery secret/i }
    );

    // Wrong secret
    assert.throws(
      () => {
        AuthService.recoverAccount(testEmail, "wrong-recovery-secret-456", "NewPassword123!");
      },
      { message: /Invalid recovery secret/i }
    );

    // Original password must still work
    const session = AuthService.login(testEmail, "OriginalPass123!");
    assert.ok(session.token, "Original password must remain functional after failed recovery attempt");
  });

  await t.test("Rejects recovery for unknown / nonexistent email address", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const unknownEmail = `unknown_user_${Date.now()}@agency.com`;

    assert.throws(
      () => {
        AuthService.recoverAccount(unknownEmail, TEST_SECRET, "NewPassword123!");
      },
      { message: /No account found with this email address/i }
    );
  });

  await t.test("Rejects recovery with weak or invalid password", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const testEmail = `weak_pwd_${Date.now()}@agency.com`;
    AuthService.register(testEmail, "OriginalPass123!", "Weak Pwd Founder");

    assert.throws(
      () => {
        AuthService.recoverAccount(testEmail, TEST_SECRET, "short");
      },
      { message: /at least 8 characters/i }
    );

    assert.throws(
      () => {
        AuthService.recoverAccount(testEmail, TEST_SECRET, "");
      },
      { message: /at least 8 characters/i }
    );
  });

  await t.test("Successfully recovers account, updates password hash, and enables login with new credentials", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const testEmail = `recover_ok_${Date.now()}@agency.com`;
    const initialPass = "OldPassword123!";
    const newPass = "NewStrongPassword456!";

    const registered = AuthService.register(testEmail, initialPass, "Recover Founder");
    const originalUserId = registered.user.id;
    const originalWorkspaceId = registered.workspace.id;

    // Perform recovery
    const recoveryResult = AuthService.recoverAccount(testEmail, TEST_SECRET, newPass);
    assert.equal(recoveryResult.success, true);
    assert.equal(recoveryResult.email, testEmail);

    // Old password must now fail
    assert.throws(
      () => {
        AuthService.login(testEmail, initialPass);
      },
      { message: /Invalid email or password/i }
    );

    // New password must succeed
    const newSession = AuthService.login(testEmail, newPass);
    assert.ok(newSession.token, "Login with new password must succeed");
    assert.equal(newSession.user.id, originalUserId, "User ID must be preserved");
    assert.equal(newSession.workspace.id, originalWorkspaceId, "Workspace ID must be preserved");
  });

  await t.test("Invalidates existing active sessions upon recovery", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const testEmail = `session_inval_${Date.now()}@agency.com`;
    const initialPass = "ActivePass123!";
    const newPass = "FreshResetPass789!";

    const initialSession = AuthService.register(testEmail, initialPass, "Session Inval Founder");
    const activeToken = initialSession.token;

    // Confirm session is active before recovery
    const validatedBefore = AuthService.validateSession(activeToken);
    assert.ok(validatedBefore, "Session must be active before recovery");

    // Perform recovery
    AuthService.recoverAccount(testEmail, TEST_SECRET, newPass);

    // Confirm previous session is invalidated
    const validatedAfter = AuthService.validateSession(activeToken);
    assert.equal(validatedAfter, null, "Existing session token must be invalidated upon recovery");
  });

  await t.test("Preserves workspace data, records, and memberships without replacement or deletion", () => {
    process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;
    const testEmail = `data_int_${Date.now()}@agency.com`;
    const initialPass = "DataPreserve123!";
    const newPass = "DataPreserveNew456!";

    const reg = AuthService.register(testEmail, initialPass, "Integrity Founder");
    const wsId = reg.workspace.id;
    const userId = reg.user.id;

    // Add opportunity and account data to workspace
    const now = new Date().toISOString();
    const accId = `acc-test-${crypto.randomUUID().slice(0, 8)}`;
    const oppId = `opp-test-${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO accounts (id, workspace_id, name, domain, industry, size, created_at, updated_at)
      VALUES (?, ?, 'Integrity Target Corp', 'targetcorp.com', 'B2B SaaS', '100', ?, ?)
    `).run(accId, wsId, now, now);

    db.prepare(`
      INSERT INTO opportunities (id, workspace_id, account_id, score, priority, stage, why_now, next_action_type, next_action_text, next_action_reason, created_at, updated_at)
      VALUES (?, ?, ?, 85, 'HIGH', 'DISCOVERED', 'Testing why now', 'EMAIL', 'Send pitch', 'High score', ?, ?)
    `).run(oppId, wsId, accId, now, now);

    // Verify records exist before recovery
    const accountsBefore = db.prepare("SELECT COUNT(*) as count FROM accounts WHERE workspace_id = ?").get(wsId) as any;
    const oppsBefore = db.prepare("SELECT COUNT(*) as count FROM opportunities WHERE workspace_id = ?").get(wsId) as any;
    assert.equal(accountsBefore.count, 1);
    assert.equal(oppsBefore.count, 1);

    // Perform recovery
    AuthService.recoverAccount(testEmail, TEST_SECRET, newPass);

    // Verify records exist after recovery
    const accountsAfter = db.prepare("SELECT COUNT(*) as count FROM accounts WHERE workspace_id = ?").get(wsId) as any;
    const oppsAfter = db.prepare("SELECT COUNT(*) as count FROM opportunities WHERE workspace_id = ?").get(wsId) as any;
    const memberAfter = db.prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?").get(wsId, userId) as any;

    assert.equal(accountsAfter.count, 1, "Accounts must remain intact after recovery");
    assert.equal(oppsAfter.count, 1, "Opportunities must remain intact after recovery");
    assert.equal(memberAfter.role, "owner", "Workspace membership must remain intact");
  });
});

test("Account Recovery HTTP API Integration Test Suite", async (t) => {
  const TEST_SECRET = "api-recovery-secret-999";
  process.env.LEADFORGE_RECOVERY_SECRET = TEST_SECRET;

  const app = express();
  app.use(express.json());

  app.get("/api/auth/recovery-status", (_req, res) => {
    const isConfigured = Boolean(process.env.LEADFORGE_RECOVERY_SECRET && process.env.LEADFORGE_RECOVERY_SECRET.trim().length > 0);
    res.json({ enabled: isConfigured });
  });

  app.post("/api/auth/recover", (req, res) => {
    try {
      const { email, recoverySecret, newPassword } = req.body;

      if (!process.env.LEADFORGE_RECOVERY_SECRET || !process.env.LEADFORGE_RECOVERY_SECRET.trim()) {
        return res.status(503).json({
          error: "Account recovery is not configured on this server.",
        });
      }

      if (!recoverySecret || typeof recoverySecret !== "string" || !recoverySecret.trim()) {
        return res.status(401).json({ error: "A valid recovery secret is required." });
      }

      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "A valid email address is required." });
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
      }

      const result = AuthService.recoverAccount(email, recoverySecret, newPassword);
      res.status(200).json(result);
    } catch (err: any) {
      const msg = err.message || "Account recovery failed.";
      if (msg.includes("not configured")) {
        return res.status(503).json({ error: msg });
      }
      if (msg.includes("Invalid recovery secret")) {
        return res.status(401).json({ error: msg });
      }
      if (msg.includes("No account found")) {
        return res.status(404).json({ error: msg });
      }
      res.status(400).json({ error: msg });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      const session = AuthService.login(email, password);
      res.json(session);
    } catch (err: any) {
      res.status(401).json({ error: err.message || "Invalid credentials" });
    }
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(null)));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  const apiEmail = `api_rec_${Date.now()}@agency.com`;
  AuthService.register(apiEmail, "InitialPass123!", "API Recoverer");

  await t.test("GET /api/auth/recovery-status reports enabled true when secret set", async () => {
    const res = await fetch(`${baseUrl}/api/auth/recovery-status`);
    assert.equal(res.status, 200);
    const json = await res.json() as any;
    assert.equal(json.enabled, true);
  });

  await t.test("POST /api/auth/recover rejects invalid secret with 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: apiEmail,
        recoverySecret: "incorrect-secret",
        newPassword: "BrandNewPass999!",
      }),
    });
    assert.equal(res.status, 401);
    const json = await res.json() as any;
    assert.match(json.error, /invalid recovery secret/i);
  });

  await t.test("POST /api/auth/recover rejects nonexistent email with 404", async () => {
    const res = await fetch(`${baseUrl}/api/auth/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent_email_404@agency.com",
        recoverySecret: TEST_SECRET,
        newPassword: "BrandNewPass999!",
      }),
    });
    assert.equal(res.status, 404);
    const json = await res.json() as any;
    assert.match(json.error, /no account found/i);
  });

  await t.test("POST /api/auth/recover rejects short password with 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: apiEmail,
        recoverySecret: TEST_SECRET,
        newPassword: "short",
      }),
    });
    assert.equal(res.status, 400);
    const json = await res.json() as any;
    assert.match(json.error, /at least 8 characters/i);
  });

  await t.test("POST /api/auth/recover succeeds with 200 and allows subsequent login with new password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: apiEmail,
        recoverySecret: TEST_SECRET,
        newPassword: "BrandNewPass999!",
      }),
    });
    assert.equal(res.status, 200);
    const json = await res.json() as any;
    assert.equal(json.success, true);

    // Verify login with new password
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: apiEmail,
        password: "BrandNewPass999!",
      }),
    });
    assert.equal(loginRes.status, 200);
    const loginJson = await loginRes.json() as any;
    assert.ok(loginJson.token);
    assert.equal(loginJson.user.email, apiEmail);
  });
});
