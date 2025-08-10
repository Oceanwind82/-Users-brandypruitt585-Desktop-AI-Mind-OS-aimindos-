import { retry } from './utils';

export async function notify(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn("Telegram credentials not configured, skipping notification");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML" as const,
    disable_web_page_preview: true,
  };

  try {
    await retry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(`Telegram API error: ${res.status} ${res.statusText} - ${errorMsg}`);
      }
      
      return res;
    }, 2, 500); // 2 retries with 500ms, 1s delays
  } catch (error) {
    console.error("Telegram notify failed after retries:", error);
  }
}

// Alternative function with Markdown support for specific use cases
export async function sendTelegram(opts: { text: string; parseMode?: "HTML" | "Markdown" }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn("Telegram credentials not configured, skipping notification");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: opts.text,
    parse_mode: opts.parseMode || "HTML" as const,
    disable_web_page_preview: true,
  };

  try {
    await retry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(`Telegram API error: ${res.status} ${res.statusText} - ${errorMsg}`);
      }
      
      return res;
    }, 2, 500); // 2 retries with 500ms, 1s delays
  } catch (error) {
    console.error("Telegram sendTelegram failed after retries:", error);
  }
}
