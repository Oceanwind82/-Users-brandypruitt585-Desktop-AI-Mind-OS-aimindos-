
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CheckResult = {
  ok: boolean;
  service: string;
  latencyMs?: number;
  [k: string]: unknown;
};

const services = [
  { key: 'core', path: '/api/health' },
  { key: 'supabase', path: '/api/health/db' },
  { key: 'stripe', path: '/api/health/stripe' },
  { key: 'sanity', path: '/api/health/sanity' },
  { key: 'telegram', path: '/api/health/telegram' },
];

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        ok ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
      }`}
    >
      {ok ? 'OK' : 'FAIL'}
    </span>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function Admin() {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(true);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Admin';

  const envKeys = useMemo(
    () =>
      [
        'NEXT_PUBLIC_APP_NAME',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'STRIPE_SECRET_KEY',
        'SANITY_API_TOKEN',
        'SANITY_PROJECT_ID',
        'SANITY_DATASET',
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_CHAT_ID',
        'OPENAI_API_KEY',
      ].filter(Boolean),
    []
  );

  const runChecks = useCallback(async () => {
    setLoading(true);
    try {
      const pairs = await Promise.all(
        services.map(async (s) => {
          try {
            const r = await fetch(s.path, { cache: 'no-store' });
            const json = await r.json();
            return [s.key, { ...json, service: s.key } as CheckResult] as const;
          } catch {
            return [
              s.key,
              { ok: false, service: s.key, error: 'fetch failed' } as CheckResult,
            ] as const;
          }
        })
      );
      setResults(Object.fromEntries(pairs));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  useEffect(() => {
    if (!auto) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(runChecks, 10_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [auto, runChecks]);

  const overallOK = Object.values(results).every((r) => r?.ok !== false);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {appName} — Admin
            </h1>
            <p className="text-sm opacity-70">
              Overall status:{' '}
              <Badge ok={overallOK || Object.keys(results).length === 0} />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runChecks}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Run all checks'}
            </button>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => setAuto(e.target.checked)}
              />
              Auto-refresh (10s)
            </label>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const res = results[s.key];
            return (
              <Card key={s.key} title={`Service: ${s.key}`}>
                {!res ? (
                  <p className="opacity-70">Waiting…</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge ok={!!res.ok} />
                      <span className="opacity-80">
                        {res.ok ? 'Healthy' : 'Issue'}
                      </span>
                    </div>
                    {'latencyMs' in res && (
                      <div>Latency: {res.latencyMs} ms</div>
                    )}
                    {'platform' in res && <div>Platform: {String(res.platform)}</div>}
                    {'nodeVersion' in res && (
                      <div>Node: {String(res.nodeVersion)}</div>
                    )}
                    {'detail' in res && <div>Detail: {String(res.detail)}</div>}
                    {'error' in res && (
                      <div className="text-red-400">Error: {String(res.error)}</div>
                    )}
                    <a
                      className="underline opacity-80 hover:opacity-100"
                      href={s.path}
                      target="_blank"
                    >
                      View raw
                    </a>
                  </div>
                )}
              </Card>
            );
          })}

          <Card title="Quick Links">
            <ul className="space-y-2 text-sm">
              <li>
                <a className="underline hover:opacity-80" href="/api/health" target="_blank">
                  Core Health JSON
                </a>
              </li>
              <li>
                <a className="underline hover:opacity-80" href="/dashboard" target="_blank">
                  App Dashboard
                </a>
              </li>
              <li>
                <a className="underline hover:opacity-80" href="/pricing" target="_blank">
                  Pricing
                </a>
              </li>
              <li>
                <a className="underline hover:opacity-80" href="/auth" target="_blank">
                  Auth / Onboarding
                </a>
              </li>
            </ul>
          </Card>

          <Card title="Environment (names only)">
            <ul className="space-y-1 text-xs opacity-80">
              {envKeys.map((k) => (
                <li key={k}>✓ {k} set? {process.env[k] ? 'yes' : 'no'}</li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] opacity-60">
              Values are never shown. Add/rotate in Vercel → Project → Settings.
            </p>
          </Card>
        </section>

        <footer className="mt-10 text-xs opacity-60">
          Admin-only area. Credentials via env. Consider upgrading to SSO later.
        </footer>
      </div>
    </main>
  );
}
