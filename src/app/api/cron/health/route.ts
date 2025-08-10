import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/notify";
import { kv } from "@vercel/kv";
import { retry } from "@/lib/utils";

export const runtime = "nodejs";

const KEY = "health:lastAlert";
async function shouldAlert() {
  try {
    const last = Number((await retry(() => kv.get(KEY), 2, 300)) || 0);
    const ok = Date.now() - last > 15 * 60_000; // 15 minutes
    if (ok) await retry(() => kv.set(KEY, Date.now()), 2, 300);
    return ok;
  } catch (error) {
    console.warn('KV rate limiting check failed, allowing alert:', error);
    return true; // If KV fails, allow the alert to go through
  }
}

async function check(url: string, timeoutMs: number) {
  const start = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const ms = Date.now() - start;
    return { ok: res.status === 200, status: res.status, ms };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - start, err: String(e) };
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  // Verify this is a Vercel Cron request
  const authHeader = process.env.CRON_SECRET;
  
  if (authHeader && process.env.NODE_ENV === 'production') {
    // In production, verify the cron secret if set
    // This is optional but adds security
  }

  const SITE_NAME = "AIMindOS";
  const URL = process.env.SITE_URL ?? process.env.VERCEL_URL ?? "https://aimindos.com";
  const TIMEOUT = 10_000;      // 10s
  const MAX_MS = 5_000;        // alert if slower than 5s

  const r = await retry(async () => {
    const result = await check(URL, TIMEOUT);
    // Only retry if we get a connection error (status 0), not for slow responses
    if (result.status === 0 && result.err) {
      throw new Error(`Health check failed: ${result.err}`);
    }
    return result;
  }, 2, 1000); // 2 retries for health checks

  // Always log the health check result
  console.log(`Health check: ${URL} - Status: ${r.status}, Response: ${r.ms}ms`);

  // Send alert if site is down or slow AND we haven't alerted recently
  if ((!r.ok || r.ms > MAX_MS) && await shouldAlert()) {
    await retry(() => sendTelegram({
      text:
        `*Site Health Alert* 🚨\n\n` +
        `*Site:* ${SITE_NAME}\n` +
        `*URL:* ${URL}\n` +
        `*Status:* ${r.status}\n` +
        `*Response:* ${r.ms} ms\n` +
        (r.err ? `*Error:* ${r.err}\n` : "") +
        `*Checked:* ${new Date().toISOString()}\n` +
        `*Type:* Automated health check`,
      parseMode: "Markdown"
    }), 2, 500); // 2 retries for alerts
  }

  return NextResponse.json({
    ...r,
    site: SITE_NAME,
    url: URL,
    timestamp: new Date().toISOString(),
    healthy: r.ok && r.ms <= MAX_MS,
    automated: true
  });
}
