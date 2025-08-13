"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  timestamp?: string;
  platform?: string;
  uptimeSeconds?: number;
  nodeVersion?: string;
  error?: string;
};

type Service = "db" | "stripe" | "telegram" | "sanity";

const services: Service[] = ["db", "stripe", "telegram", "sanity"];

export default function AdminPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<Record<Service, Health | null>>({
    db: null,
    stripe: null,
    telegram: null,
    sanity: null,
  });
  const [lastChecked, setLastChecked] = useState<Record<Service, string>>({
    db: "",
    stripe: "",
    telegram: "",
    sanity: "",
  });
  const [expanded, setExpanded] = useState<Record<Service, boolean>>({
    db: false,
    stripe: false,
    telegram: false,
    sanity: false,
  });
  const [pending, setPending] = useState<Record<Service, boolean>>({
    db: true,
    stripe: true,
    telegram: true,
    sanity: true,
  });

  const fetchCheck = async (service: Service) => {
    setPending((prev) => ({ ...prev, [service]: true }));
    try {
      const res = await fetch(`/api/health/${service}`);
      const data = await res.json();
      setChecks((prev) => ({ ...prev, [service]: data }));
      setLastChecked((prev) => ({ ...prev, [service]: new Date().toLocaleTimeString() }));
    } catch {
      setChecks((prev) => ({ ...prev, [service]: null }));
      setLastChecked((prev) => ({ ...prev, [service]: new Date().toLocaleTimeString() }));
    } finally {
      setPending((prev) => ({ ...prev, [service]: false }));
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };
    load();

    services.forEach((service) => {
      fetchCheck(service);
    });
  }, []);

  // Summary status
  const allPass = services.every((service) => checks[service]?.ok);
  const anyFail = services.some((service) => checks[service] && !checks[service]?.ok);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Mind OS — Admin</h1>
            <div className="text-sm opacity-80">
              {health?.timestamp ? (
                <>Server time: {new Date(health.timestamp).toLocaleString()}</>
              ) : (
                <>Server time: —</>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={allPass ? "text-green-400" : anyFail ? "text-red-400" : "text-yellow-400"}>
              {allPass
                ? "All systems operational"
                : anyFail
                ? "Issues detected"
                : "Checking..."}
            </span>
            <button
              onClick={() => location.reload()}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              Refresh All
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-3">Server Health</h2>
            {loading && <p>Checking…</p>}
            {!loading && !health && (
              <p className="text-red-400">Health check failed.</p>
            )}
            {!loading && health && (
              <ul className="space-y-1 text-sm">
                <li>
                  Status:{" "}
                  <span className={health.ok ? "text-green-400" : "text-red-400"}>
                    {health.ok ? "OK" : "Issue"}
                  </span>
                </li>
                <li>Platform: {health.platform}</li>
                <li>Node: {health.nodeVersion}</li>
                <li>Uptime: {Math.floor(health.uptimeSeconds ?? 0)}s</li>
              </ul>
            )}
          </div>

          {/* System Checks */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-3">System Checks</h2>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {service.charAt(0).toUpperCase() + service.slice(1)}:
                    </span>
                    {pending[service] ? (
                      <span className="animate-pulse text-yellow-300">Loading…</span>
                    ) : checks[service] ? (
                      <>
                        <span className={checks[service]?.ok ? "text-green-400" : "text-red-400"}>
                          {checks[service]?.ok ? "Pass" : "Fail"}
                        </span>
                        <span className="text-xs opacity-70 ml-2">Last checked: {lastChecked[service]}</span>
                        <button
                          className="ml-2 px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/20"
                          onClick={() => fetchCheck(service)}
                        >
                          Retry
                        </button>
                        {!checks[service]?.ok && checks[service]?.error && (
                          <>
                            <button
                              className="ml-2 px-2 py-1 rounded bg-red-900/30 border border-red-400 text-xs text-red-200 hover:bg-red-900/50"
                              onClick={() => setExpanded((prev) => ({ ...prev, [service]: !prev[service] }))}
                            >
                              {expanded[service] ? "Hide Error" : "Show Error"}
                            </button>
                            {expanded[service] && (
                              <div className="mt-1 p-2 rounded bg-red-900/20 text-red-200 text-xs border border-red-400">
                                {checks[service]?.error}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="opacity-80">pending</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs opacity-70">
              Each check is wired to <code>/api/health/[service]</code> endpoints.
            </p>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="underline hover:opacity-80" href="/health" target="_blank">
                  Public Health Page (optional if you add one)
                </a>
              </li>
              <li>
                <a className="underline hover:opacity-80" href="/api/health" target="_blank">
                  API Health JSON
                </a>
              </li>
              <li>
                <a className="underline hover:opacity-80" href="/api" target="_blank">
                  API Root (if any)
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
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-xs opacity-60">
          Admin-only area. Keep credentials in environment variables.
        </footer>
      </div>
    </main>
  );
}
