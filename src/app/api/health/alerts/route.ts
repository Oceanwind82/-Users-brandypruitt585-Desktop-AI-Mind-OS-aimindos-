import { NextResponse } from 'next/server';

const services = [
  { key: 'core', path: '/api/health' },
  { key: 'supabase', path: '/api/health/db' },
  { key: 'stripe', path: '/api/health/stripe' },
  { key: 'sanity', path: '/api/health/sanity' },
  { key: 'telegram', path: '/api/health/telegram' },
];

async function runChecks() {
  return Promise.all(
    services.map(async (s) => {
      try {
        const r = await fetch(s.path, { cache: 'no-store' });
        const json = await r.json();
        return { ...json, service: s.key };
      } catch {
        return { ok: false, service: s.key, error: 'fetch failed' };
      }
    })
  );
}

async function postToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
}

export async function GET() {
  const results = await runChecks();
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    const msg = `ALERT: Health check failed for: ${failed.map((r) => r.service).join(', ')}.`;
    await postToTelegram(msg);
  }
  return NextResponse.json({ ok: failed.length === 0, results });
}
