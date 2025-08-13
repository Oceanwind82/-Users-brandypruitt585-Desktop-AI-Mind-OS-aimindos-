export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' }), { status: 500 });
  }
  try {
    // Try sending a getMe request to Telegram API
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (data.ok) {
      return new Response(JSON.stringify({ ok: true, username: data.result.username }), { status: 200 });
    }
    return new Response(JSON.stringify({ ok: false, error: data.description }), { status: 500 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), { status: 500 });
  }
}
