// User administration, run inside the container:
//   node server/cli.ts add <username> [password]   (random password if omitted)
//   node server/cli.ts passwd <username> [password]
//   node server/cli.ts remove <username>
//   node server/cli.ts list
//   node server/cli.ts token-add <username> <name>    (prints the token once)
//   node server/cli.ts token-list <username>
//   node server/cli.ts token-revoke <username> <name>
import { randomBytes } from 'node:crypto';
import {
  createApiToken,
  hashPassword,
  listApiTokens,
  MIN_PASSWORD_LENGTH,
  revokeApiToken,
  setPassword,
} from './auth.ts';
import { db } from './db.ts';

// The third argument is the password for add/passwd and the token name for token-*.
const [command, username, givenPassword] = process.argv.slice(2);
const tokenName = givenPassword?.trim();

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function passwordOrGenerated(): { password: string; generated: boolean } {
  if (givenPassword) {
    if (givenPassword.length < MIN_PASSWORD_LENGTH) fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    return { password: givenPassword, generated: false };
  }
  return { password: randomBytes(15).toString('base64url'), generated: true };
}

function userIdOrFail(name: string): number {
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(name) as { id: number } | undefined;
  if (!user) fail(`No user "${name}".`);
  return user.id;
}

switch (command) {
  case 'add': {
    if (!username) fail('Usage: add <username> [password]');
    const { password, generated } = passwordOrGenerated();
    try {
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, await hashPassword(password));
    } catch {
      fail(`User "${username}" already exists.`);
    }
    console.log(`Created user "${username}".${generated ? ` Password: ${password}` : ''}`);
    break;
  }
  case 'passwd': {
    if (!username) fail('Usage: passwd <username> [password]');
    const { password, generated } = passwordOrGenerated();
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    if (!user) fail(`No user "${username}".`);
    await setPassword(user.id, password);
    console.log(`Updated password for "${username}".${generated ? ` Password: ${password}` : ''}`);
    break;
  }
  case 'remove': {
    if (!username) fail('Usage: remove <username>');
    const { changes } = db.prepare('DELETE FROM users WHERE username = ?').run(username);
    if (!changes) fail(`No user "${username}".`);
    console.log(`Removed user "${username}" and all of their data.`);
    break;
  }
  case 'list': {
    const rows = db.prepare('SELECT username, created_at FROM users ORDER BY username').all() as {
      username: string;
      created_at: string;
    }[];
    if (!rows.length) console.log('No users yet.');
    for (const r of rows) console.log(`${r.username}\t(created ${r.created_at})`);
    break;
  }
  case 'token-add': {
    if (!username || !tokenName) fail('Usage: token-add <username> <name>');
    const user = userIdOrFail(username);
    let token: string;
    try {
      token = createApiToken(user, tokenName);
    } catch {
      fail(`"${username}" already has a token named "${tokenName}". Revoke it first or pick another name.`);
    }
    console.log(`Created API token "${tokenName}" for "${username}". It is shown only this once:\n${token}`);
    break;
  }
  case 'token-list': {
    if (!username) fail('Usage: token-list <username>');
    const tokens = listApiTokens(userIdOrFail(username));
    if (!tokens.length) console.log('No API tokens.');
    for (const t of tokens) console.log(`${t.name}\t(created ${t.created_at}, last used ${t.last_used_at ?? 'never'})`);
    break;
  }
  case 'token-revoke': {
    if (!username || !tokenName) fail('Usage: token-revoke <username> <name>');
    if (!revokeApiToken(userIdOrFail(username), tokenName)) fail(`"${username}" has no token named "${tokenName}".`);
    console.log(`Revoked API token "${tokenName}" for "${username}".`);
    break;
  }
  default:
    fail(
      'Commands: add <username> [password] | passwd <username> [password] | remove <username> | list\n' +
        '          token-add <username> <name> | token-list <username> | token-revoke <username> <name>',
    );
}
