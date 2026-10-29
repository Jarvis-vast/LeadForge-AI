import crypto from 'node:crypto';
import { db } from '../db/database';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  created_at: string;
}

export interface WorkspaceRecord {
  id: string;
  org_id: string;
  name: string;
  website?: string;
  description?: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: UserProfile;
  workspace: WorkspaceRecord;
  token: string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derived = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derived);
  } catch {
    return false;
  }
}

export const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  static register(email: string, password?: string, name?: string): AuthSession {
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      throw new Error('A valid email address is required.');
    }

    if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM profiles WHERE email = ?').get(normalizedEmail) as any;
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const workspaceId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userName = name?.trim() || normalizedEmail.split('@')[0] || 'Founder';
    const pwdHash = hashPassword(password);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Atomic registration transaction: ensures no partial records on failure
    db.exec('BEGIN TRANSACTION;');
    try {
      // 1. Create Profile
      db.prepare(`
        INSERT INTO profiles (id, email, name, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'founder', ?, ?)
      `).run(userId, normalizedEmail, userName, pwdHash, now, now);

      // 2. Create Organization
      const orgSlug = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
      db.prepare(`
        INSERT INTO organizations (id, name, slug, plan, created_at, updated_at)
        VALUES (?, ?, ?, 'growth', ?, ?)
      `).run(orgId, `${userName}'s Organization`, orgSlug, now, now);

      // 3. Create Default Workspace
      db.prepare(`
        INSERT INTO workspaces (id, org_id, name, website, currency, timezone, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'USD', 'America/New_York', ?, ?)
      `).run(workspaceId, orgId, `${userName}'s Workspace`, 'https://agency.com', now, now);

      // 4. Create Workspace Member (Owner)
      db.prepare(`
        INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at)
        VALUES (?, ?, ?, 'owner', ?)
      `).run(crypto.randomUUID(), workspaceId, userId, now);

      // 5. Create default initial ICP for this workspace (so they have standard B2B criteria)
      db.prepare(`
        INSERT INTO icp_profiles (
          id, workspace_id, name, summary, target_industries, company_sizes, geographies,
          buyer_roles, buying_signals, exclusions, inferred_assumptions, is_confirmed, confidence,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0.92, ?, ?)
      `).run(
        crypto.randomUUID(),
        workspaceId,
        'Target ICP — High-Growth B2B Companies',
        'Fast-growing tech companies scaling sales, engineering, and digital workflows.',
        JSON.stringify(['B2B SaaS', 'E-commerce Tech', 'HealthTech', 'FinTech']),
        JSON.stringify(['20-150 employees', '$3M-$20M ARR']),
        JSON.stringify(['United States', 'Canada', 'United Kingdom']),
        JSON.stringify(['Founder / CEO', 'VP Marketing', 'Head of Growth', 'CTO']),
        JSON.stringify(['Hiring leadership', 'Recent product release', 'Modernizing tech stack']),
        JSON.stringify(['Pre-revenue startups', 'Enterprises > 2,000 employees']),
        JSON.stringify(['Assumes modern web stack', 'Inferred 3-8 week sales cycle']),
        now,
        now
      );

      // 6. Create Session Token
      db.prepare(`
        INSERT INTO sessions (token, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
      `).run(token, userId, expiresAt, now);

      db.exec('COMMIT;');
    } catch (txErr) {
      try {
        db.exec('ROLLBACK;');
      } catch {
        // ignore rollback errors
      }
      throw txErr;
    }

    const user: UserProfile = {
      id: userId,
      email: normalizedEmail,
      name: userName,
      role: 'founder',
      created_at: now,
    };

    const workspace: WorkspaceRecord = {
      id: workspaceId,
      org_id: orgId,
      name: `${userName}'s Workspace`,
      website: 'https://agency.com',
      currency: 'USD',
      timezone: 'America/New_York',
      created_at: now,
      updated_at: now,
    };

    return { user, workspace, token };
  }

  static login(email: string, password?: string): AuthSession {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error('Valid email address is required.');
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new Error('Password is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM profiles WHERE email = ?').get(normalizedEmail) as any;
    if (!userRow) {
      throw new Error('Invalid email or password.');
    }

    if (!userRow.password_hash) {
      throw new Error('Invalid email or password.');
    }

    const isValid = verifyPassword(password, userRow.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    // Resolve default workspace for this user
    const memberRow = db.prepare(`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = ?
      ORDER BY w.created_at ASC
      LIMIT 1
    `).get(userRow.id) as any;

    if (!memberRow) {
      throw new Error('No active workspace found for this account.');
    }

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, userRow.id, expiresAt, now);

    const user: UserProfile = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      avatar_url: userRow.avatar_url,
      role: userRow.role,
      created_at: userRow.created_at,
    };

    const workspace: WorkspaceRecord = {
      id: memberRow.id,
      org_id: memberRow.org_id,
      name: memberRow.name,
      website: memberRow.website,
      description: memberRow.description,
      currency: memberRow.currency,
      timezone: memberRow.timezone,
      created_at: memberRow.created_at,
      updated_at: memberRow.updated_at,
    };

    return { user, workspace, token };
  }

  static validateSession(token: string): { user: UserProfile; workspace: WorkspaceRecord } | null {
    if (!token) return null;
    const session = db.prepare(`
      SELECT s.*, p.email, p.name, p.role, p.avatar_url, p.created_at as profile_created_at
      FROM sessions s
      JOIN profiles p ON p.id = s.user_id
      WHERE s.token = ?
    `).get(token) as any;

    if (!session) return null;

    if (new Date(session.expires_at) < new Date()) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return null;
    }

    // Get user's primary workspace
    const workspace = db.prepare(`
      SELECT w.* FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = ?
      ORDER BY w.created_at ASC
      LIMIT 1
    `).get(session.user_id) as any;

    if (!workspace) return null;

    return {
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        avatar_url: session.avatar_url,
        role: session.role,
        created_at: session.profile_created_at,
      },
      workspace: {
        id: workspace.id,
        org_id: workspace.org_id,
        name: workspace.name,
        website: workspace.website,
        description: workspace.description,
        currency: workspace.currency,
        timezone: workspace.timezone,
        created_at: workspace.created_at,
        updated_at: workspace.updated_at,
      },
    };
  }

  static logout(token: string): void {
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
  }

  static recoverAccount(email: string, recoverySecret: string, newPassword: string): { success: boolean; message: string; email: string } {
    const configuredSecret = process.env.LEADFORGE_RECOVERY_SECRET;
    if (!configuredSecret || typeof configuredSecret !== 'string' || !configuredSecret.trim()) {
      throw new Error('Account recovery is not configured on this server.');
    }

    if (!recoverySecret || typeof recoverySecret !== 'string' || !recoverySecret.trim()) {
      throw new Error('Invalid recovery secret.');
    }

    // Timing-safe comparison using SHA-256 digests to prevent timing attacks and length leaks
    const expectedHash = crypto.createHash('sha256').update(configuredSecret.trim()).digest();
    const providedHash = crypto.createHash('sha256').update(recoverySecret.trim()).digest();
    const isSecretValid = crypto.timingSafeEqual(expectedHash, providedHash);
    if (!isSecretValid) {
      throw new Error('Invalid recovery secret.');
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      throw new Error('A valid email address is required.');
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = db.prepare('SELECT id, email FROM profiles WHERE email = ?').get(normalizedEmail) as any;
    if (!existingUser) {
      throw new Error('No account found with this email address.');
    }

    const newPasswordHash = hashPassword(newPassword);
    const now = new Date().toISOString();

    db.exec('BEGIN TRANSACTION;');
    try {
      // Update only matching user password hash
      db.prepare(`
        UPDATE profiles
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
      `).run(newPasswordHash, now, existingUser.id);

      // Invalidate all existing sessions for this user
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existingUser.id);

      db.exec('COMMIT;');
    } catch (err) {
      try {
        db.exec('ROLLBACK;');
      } catch {
        // ignore rollback errors
      }
      throw err;
    }

    return {
      success: true,
      message: 'Account password has been successfully reset. Please sign in with your new password.',
      email: normalizedEmail,
    };
  }
}

