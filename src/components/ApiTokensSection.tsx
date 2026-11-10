import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createApiToken, fetchApiTokens, revokeApiToken, type ApiToken } from '../utils/api';
import { nafInput, nafLabel, nafRemoveBtn, primaryButton } from '../styles/formStyles';
import { TokenListSkeleton } from './Skeleton';

const hint = '[font-family:var(--font-mono)] text-[10.5px] text-[color:var(--ink-3)] leading-[1.6]';

// SQLite's datetime('now') is UTC without a zone marker.
function formatTimestamp(value: string | null): string {
  if (!value) return 'never';
  const date = new Date(`${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/** Lets a user create and revoke the API tokens scripts and assistants use to call /api/v1. */
export function ApiTokensSection() {
  const [tokens, setTokens] = useState<ApiToken[] | null>(null);
  const [name, setName] = useState('');
  const [created, setCreated] = useState<{ name: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetchApiTokens()
      .then(setTokens)
      .catch((e) => setError(e instanceof Error ? e.message : 'Loading API tokens failed.'));

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const token = await createApiToken(name);
      setCreated({ name: name.trim(), token });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creating the token failed.');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (tokenName: string) => {
    if (!confirm(`Revoke the token "${tokenName}"? Anything using it stops working immediately.`)) return;
    setError(null);
    try {
      await revokeApiToken(tokenName);
      if (created?.name === tokenName) setCreated(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoking the token failed.');
    }
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.token);
    setCopied(true);
  };

  return (
    <section className="max-w-[560px] flex flex-col gap-4 mt-12">
      <span className={nafLabel}>API tokens</span>
      <p className={hint}>
        Let scripts and AI assistants read and edit your applications through <code>/api/v1</code>, without
        your password. A token can't log in, change your password or manage tokens.
      </p>

      {!tokens && !error && <TokenListSkeleton />}
      {tokens && tokens.length > 0 && (
        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {tokens.map((t) => (
            <li
              key={t.name}
              className="flex items-center justify-between gap-3 border border-[color:var(--rule)] rounded-[5px] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-[13px] text-[color:var(--ink-invert)] truncate">{t.name}</div>
                <div className={hint}>
                  created {formatTimestamp(t.created_at)} · last used {formatTimestamp(t.last_used_at)}
                </div>
              </div>
              <button className={nafRemoveBtn} type="button" onClick={() => void revoke(t.name)}>
                revoke
              </button>
            </li>
          ))}
        </ul>
      )}
      {tokens && tokens.length === 0 && <p className={hint}>No tokens yet.</p>}

      {created && (
        <div className="flex flex-col gap-2 border-[1.5px] border-[color:var(--accent)] rounded-[5px] p-3">
          <span className="text-[12px] text-[color:var(--ink-invert)]">
            Token "{created.name}" created. Copy it now: it won't be shown again.
          </span>
          <code className="[font-family:var(--font-mono)] text-[11.5px] break-all text-[color:var(--ink-2)] select-all">
            {created.token}
          </code>
          <button className={primaryButton} type="button" onClick={() => void copy()}>
            {copied ? 'copied' : 'copy token'}
          </button>
        </div>
      )}

      <form className="flex flex-col sm:flex-row gap-2 sm:items-center" onSubmit={create}>
        <input
          className={nafInput}
          placeholder="Name, e.g. claude-laptop"
          aria-label="Token name"
          required
          maxLength={64}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={`${primaryButton} shrink-0`} type="submit" disabled={busy}>
          {busy ? 'creating…' : 'create token'}
        </button>
      </form>

      {error && <p className="text-[12px] text-[color:var(--status-rejected)]">{error}</p>}
    </section>
  );
}
