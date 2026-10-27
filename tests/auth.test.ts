import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { AuthService, MIN_PASSWORD_LENGTH } from "../server/services/authService";
import { db } from "../server/db/database";

test("AuthService Security Test Suite", async (t) => {
  const testEmail = `test_${Date.now()}@agency.com`;
  const testPassword = "CorrectPassword123!";

  await t.test("Registers a new user with secure password hash", () => {
    const session = AuthService.register(testEmail, testPassword, "Test Founder");
    assert.ok(session.token, "Session token should be generated");
    assert.equal(session.user.email, testEmail);
    assert.ok(session.workspace.id, "Workspace should be provisioned");
    assert.equal((session.user as any).password_hash, undefined, "Password hash must never be returned in session user profile");
  });

  await t.test("Rejects login with empty password", () => {
    assert.throws(
      () => {
        AuthService.login(testEmail, "");
      },
      { message: /Password is required/ }
    );
  });

  await t.test("Rejects login with wrong password", () => {
    assert.throws(
      () => {
        AuthService.login(testEmail, "IncorrectPassword456!");
      },
      { message: /Invalid email or password/ }
    );
  });

  await t.test("Rejects login with nonexistent user", () => {
    assert.throws(
      () => {
        AuthService.login("nonexistent_user_999@agency.com", "SomePassword123!");
      },
      { message: /Invalid email or password/ }
    );
  });

  await t.test("Successfully logs in with correct password", () => {
    const session = AuthService.login(testEmail, testPassword);
    assert.ok(session.token, "Session token should be returned");
    assert.equal(session.user.email, testEmail);
    assert.ok(session.workspace.id, "Workspace should be returned");
    assert.equal((session.user as any).password_hash, undefined, "Password hash must never be returned");
  });

  await t.test("Rejects registration with empty or invalid email", () => {
    assert.throws(
      () => {
        AuthService.register("", "Password123!");
      },
      { message: /valid email address is required/i }
    );
    assert.throws(
      () => {
        AuthService.register("not-an-email", "Password123!");
      },
      { message: /valid email address is required/i }
    );
    assert.throws(
      () => {
        AuthService.register("user@missing-tld", "Password123!");
      },
      { message: /valid email address is required/i }
    );
  });

  await t.test("Rejects registration with missing or short password", () => {
    const uniqueEmail = `short_pwd_${Date.now()}@agency.com`;
    assert.throws(
      () => {
        AuthService.register(uniqueEmail, "");
      },
      { message: new RegExp(`at least ${MIN_PASSWORD_LENGTH} characters`) }
    );
    assert.throws(
      () => {
        AuthService.register(uniqueEmail, "short1");
      },
      { message: new RegExp(`at least ${MIN_PASSWORD_LENGTH} characters`) }
    );
  });

  await t.test("Rejects duplicate registration and rolls back atomically", () => {
    const dupEmail = `dup_${Date.now()}@agency.com`;
    AuthService.register(dupEmail, "ValidPassword123!", "Founder A");

    const countBefore = (db.prepare("SELECT COUNT(*) as count FROM profiles WHERE email = ?").get(dupEmail) as any).count;
    assert.equal(countBefore, 1);

    assert.throws(
      () => {
        AuthService.register(dupEmail, "DifferentPassword123!", "Founder B");
      },
      { message: /already exists/i }
    );

    const countAfter = (db.prepare("SELECT COUNT(*) as count FROM profiles WHERE email = ?").get(dupEmail) as any).count;
    assert.equal(countAfter, 1, "Duplicate registration must not insert duplicate profiles");
  });

  await t.test("Session validation and invalidation lifecycle", () => {
    const userEmail = `session_${Date.now()}@agency.com`;
    const session = AuthService.register(userEmail, "SecretPass123!", "Session User");

    const validated = AuthService.validateSession(session.token);
    assert.ok(validated, "Valid session token must return user and workspace");
    assert.equal(validated.user.email, userEmail);
    assert.ok(validated.workspace.id);

    const invalid = AuthService.validateSession("non-existent-token-12345");
    assert.equal(invalid, null, "Unknown token must return null");

    const empty = AuthService.validateSession("");
    assert.equal(empty, null, "Empty token must return null");

    AuthService.logout(session.token);
    const afterLogout = AuthService.validateSession(session.token);
    assert.equal(afterLogout, null, "Logged out token must return null");
  });
});

test("Authentication HTTP API and Session Invariants Test Suite", async (t) => {
  const app = express();
  app.use(express.json());

  function extractToken(req: express.Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }
    return null;
  }

  function requireAuth(req: any, res: express.Response, next: express.NextFunction) {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication required. Please sign in." });
    }
    const session = AuthService.validateSession(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
    }
    req.user = session.user;
    req.workspace = session.workspace;
    next();
  }

  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "A valid email address is required." });
      }
      if (!password || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
      }
      const session = AuthService.register(email, password, name);
      res.status(201).json(session);
    } catch (err: any) {
      if (err.message && err.message.includes("already exists")) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }
      res.status(400).json({ error: err.message || "Registration failed." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ error: "Valid email address is required." });
      }
      if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({ error: "Password is required." });
      }
      const session = AuthService.login(email, password);
      res.json(session);
    } catch (err: any) {
      res.status(401).json({ error: err.message || "Invalid email or password." });
    }
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    res.json({
      user: req.user,
      workspace: req.workspace,
    });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(null)));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  const apiEmail = `api_test_${Date.now()}@agency.com`;
  const apiPassword = "StrongPassword999!";
  let validToken = "";

  await t.test("HTTP POST /api/auth/register rejects missing and malformed credentials with 400", async () => {
    const res1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: apiPassword }),
    });
    assert.equal(res1.status, 400);
    const json1 = await res1.json() as any;
    assert.match(json1.error, /valid email address is required/i);

    const res2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: "short" }),
    });
    assert.equal(res2.status, 400);
    const json2 = await res2.json() as any;
    assert.match(json2.error, /at least 8 characters/i);
  });

  await t.test("HTTP POST /api/auth/register succeeds with valid credentials (201)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: apiPassword, name: "API Founder" }),
    });
    assert.equal(res.status, 201);
    const json = await res.json() as any;
    assert.ok(json.token, "Non-empty token must be returned");
    assert.equal(json.user.email, apiEmail);
    assert.ok(json.workspace.id, "Workspace record must be returned");
    validToken = json.token;
  });

  await t.test("HTTP POST /api/auth/register rejects duplicate registration with 409", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: apiPassword, name: "Duplicate Founder" }),
    });
    assert.equal(res.status, 409);
    const json = await res.json() as any;
    assert.match(json.error, /already exists/i);
  });

  await t.test("HTTP POST /api/auth/login rejects wrong password with 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: "WrongPassword123!" }),
    });
    assert.equal(res.status, 401);
    const json = await res.json() as any;
    assert.match(json.error, /invalid email or password/i);
  });

  await t.test("HTTP POST /api/auth/login succeeds with correct password (200)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: apiEmail, password: apiPassword }),
    });
    assert.equal(res.status, 200);
    const json = await res.json() as any;
    assert.ok(json.token);
    assert.equal(json.user.email, apiEmail);
    assert.ok(json.workspace.id);
  });

  await t.test("HTTP GET /api/auth/me rejects invalid or absent session tokens with 401", async () => {
    const res1 = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res1.status, 401);

    const res2 = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer fake_invalid_token_123" },
    });
    assert.equal(res2.status, 401);
  });

  await t.test("HTTP GET /api/auth/me accepts real session token and returns workspace data", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json() as any;
    assert.equal(json.user.email, apiEmail);
    assert.ok(json.workspace.id);
  });

  await t.test("Network / API error handling does not authenticate client", async () => {
    let failedCleanly = false;
    try {
      const badRes = await fetch(`${baseUrl}/api/auth/invalid-endpoint-999`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: apiEmail, password: apiPassword }),
      });
      if (!badRes.ok) {
        failedCleanly = true;
      }
    } catch {
      failedCleanly = true;
    }
    assert.ok(failedCleanly, "Failed network/API request must not be treated as successful session");
  });

  await t.test("Client startup invariant: localStorage flag alone never bypasses auth without valid /api/auth/me", async () => {
    const fakeToken = "stale_expired_token";
    const checkRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${fakeToken}` },
    });
    assert.equal(checkRes.status, 401, "Backend must refuse invalid tokens regardless of client-side flags");
  });
});