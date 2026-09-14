import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../server/services/authService';

test('AuthService Security Test Suite', async (t) => {
  const testEmail = `test_${Date.now()}@agency.com`;
  const testPassword = 'CorrectPassword123!';

  await t.test('Registers a new user with secure password hash', () => {
    const session = AuthService.register(testEmail, testPassword, 'Test Founder');
    assert.ok(session.token, 'Session token should be generated');
    assert.equal(session.user.email, testEmail);
    assert.ok(session.workspace.id, 'Workspace should be provisioned');
  });

  await t.test('Rejects login with empty password', () => {
    assert.throws(
      () => {
        AuthService.login(testEmail, '');
      },
      { message: /Password is required/ }
    );
  });

  await t.test('Rejects login with wrong password', () => {
    assert.throws(
      () => {
        AuthService.login(testEmail, 'IncorrectPassword456!');
      },
      { message: /Invalid email or password/ }
    );
  });

  await t.test('Rejects login with nonexistent user', () => {
    assert.throws(
      () => {
        AuthService.login('nonexistent_user_999@agency.com', 'SomePassword123!');
      },
      { message: /Invalid email or password/ }
    );
  });

  await t.test('Successfully logs in with correct password', () => {
    const session = AuthService.login(testEmail, testPassword);
    assert.ok(session.token, 'Session token should be returned');
    assert.equal(session.user.email, testEmail);
    assert.ok(session.workspace.id, 'Workspace should be returned');
  });
});
