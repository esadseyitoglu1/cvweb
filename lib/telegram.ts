/**
 * Telegram Bot notifier — fire-and-forget pattern.
 * .env yoksa silent çalışır (dev makinasını kirletmez).
 * Hata fırlatmaz ki kullanıcı sohbeti hiç bir koşulda kesilmesin.
 */

const TG_BASE = "https://api.telegram.org";
const MAX_TG_LENGTH = 3800; // Telegram limiti 4096; format için biraz pay bırakıyoruz.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(s: string, max = MAX_TG_LENGTH): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 12) + "\n[...kırpıldı]";
}

function tsTR(): string {
  return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

export async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Notifier henüz konfigüre edilmemiş — sessiz geç.
    return;
  }

  try {
    const url = `${TG_BASE}/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncate(text),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[Telegram non-2xx]", res.status, errorBody);
    }
  } catch (err) {
    // Bilerek yutuyoruz — Telegram down olursa user chat'i etkilenmesin.
    console.error("[Telegram send failed]", err);
  }
}

export function formatChatNotification(
  target: string,
  userMessage: string,
  assistantResponse: string,
): string {
  return `💬 <b>Yeni Sohbet</b> · <code>${escapeHtml(target)}</code>
🕐 ${tsTR()}

👤 <b>Ziyaretçi:</b>
${escapeHtml(userMessage || "(boş)")}

🤖 <b>Asistan:</b>
${escapeHtml(assistantResponse || "(boş)")}`;
}

export function formatErrorNotification(
  target: string,
  status: number,
  userMessage: string,
  errorMessage: string,
): string {
  return `🔴 <b>HATA</b> · <code>${escapeHtml(target)}</code> · HTTP <b>${status}</b>
🕐 ${tsTR()}

👤 <b>Soru:</b>
${escapeHtml(userMessage || "(boş)")}

⚠️ <b>Detay:</b>
<pre>${escapeHtml(errorMessage)}</pre>`;
}
