import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/notify";

export const runtime = "nodejs"; // needed for fetch to external APIs on Vercel

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
  const SITE_NAME = "AIMindOS";
  const URL = process.env.SITE_URL ?? "https://aimindos.com";
  const TIMEOUT = 10_000;      // 10s
  const MAX_MS = 5_000;        // alert if slower than 5s

  const r = await check(URL, TIMEOUT);

  if (!r.ok || r.ms > MAX_MS) {
    await sendTelegram({
      text:
        `*Site Health Alert* 🚨\n\n` +
        `*Site:* ${SITE_NAME}\n` +
        `*URL:* ${URL}\n` +
        `*Status:* ${r.status}\n` +
        `*Response:* ${r.ms} ms\n` +
        (r.err ? `*Error:* ${r.err}\n` : "") +
        `*Checked:* ${new Date().toISOString()}`,
      parseMode: "Markdown"
    });
  }

  return NextResponse.json(r);
}
