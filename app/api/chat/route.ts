import { google } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";
import fs from "fs/promises";
import path from "path";
import { resolveTarget, buildSystemPrompt } from "@/lib/target-config";
import {
  sendTelegram,
  formatChatNotification,
  formatErrorNotification,
} from "@/lib/telegram";

export const runtime = "nodejs";

type ParsedError = {
  status: number;
  userMessage: string;
  rawMessage: string;
};

function parseAIError(err: unknown): ParsedError {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("too many requests")
  ) {
    return {
      status: 429,
      userMessage: "API istek limiti doldu, lütfen biraz bekleyip tekrar deneyin.",
      rawMessage: raw,
    };
  }

  if (
    lower.includes("401") ||
    lower.includes("unauthorized") ||
    lower.includes("api key") ||
    lower.includes("authentication") ||
    lower.includes("permission_denied")
  ) {
    return {
      status: 401,
      userMessage: "API anahtarı geçersiz veya yetki yok.",
      rawMessage: raw,
    };
  }

  if (lower.includes("404") || lower.includes("not found") || lower.includes("model")) {
    return {
      status: 404,
      userMessage: "İstenen Gemini modeli bulunamadı veya hesabınızda kapalı.",
      rawMessage: raw,
    };
  }

  if (lower.includes("safety") || lower.includes("blocked")) {
    return {
      status: 422,
      userMessage: "Yapay zeka güvenlik filtresi nedeniyle yanıt üretmedi.",
      rawMessage: raw,
    };
  }

  return {
    status: 500,
    userMessage: "Yapay zekaya bağlanırken beklenmedik bir sorun oluştu.",
    rawMessage: raw,
  };
}

async function appendChatLog(target: string, user: string, assistant: string) {
  try {
    const entry = `\n[${new Date().toLocaleString("tr-TR")}] [Target: ${target}]\nZİYARETÇİ: ${user}\nASİSTAN: ${assistant}\n-----------------------------------\n`;
    await fs.appendFile(path.join(process.cwd(), "chat-logs.txt"), entry, "utf8");
  } catch (err) {
    console.error("[chat-log write failed]", err);
  }
}

async function appendErrorLog(target: string, status: number, user: string, errorMsg: string, stack?: string) {
  try {
    const entry = `\n[${new Date().toLocaleString("tr-TR")}] [Target: ${target}] [HTTP ${status}]\nSORU: ${user}\nHATA: ${errorMsg}\nSTACK: ${stack ?? "(yok)"}\n-----------------------------------\n`;
    await fs.appendFile(path.join(process.cwd(), "error-logs.txt"), entry, "utf8");
  } catch (err) {
    console.error("[error-log write failed]", err);
  }
}

export async function POST(req: Request) {
  let targetKey = "default";
  let lastUserMessage = "";

  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    targetKey = resolveTarget(body.target);
    lastUserMessage = messages[messages.length - 1]?.content ?? "";

    const systemPrompt = buildSystemPrompt(targetKey);

    const result = streamText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-2.5-flash"),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,

      // Stream başladıktan sonra patlayan hataları yakala
      onError({ error }) {
        const parsed = parseAIError(error);
        console.error("[AI Stream Error]", parsed.status, parsed.rawMessage);
        void appendErrorLog(targetKey, parsed.status, lastUserMessage, parsed.rawMessage,
          error instanceof Error ? error.stack : undefined);
        void sendTelegram(
          formatErrorNotification(targetKey, parsed.status, lastUserMessage, parsed.rawMessage),
        );
      },

      // Başarılı bittiğinde log + Telegram bildirimi
      async onFinish({ text }) {
        await appendChatLog(targetKey, lastUserMessage, text);
        void sendTelegram(formatChatNotification(targetKey, lastUserMessage, text));
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        const parsed = parseAIError(error);
        return parsed.userMessage;
      },
    });
  } catch (error) {
    // Pre-stream hataları (parse hatası, sync init hatası vs.)
    const parsed = parseAIError(error);
    console.error("[AI Chat Hatası]", parsed.status, parsed.rawMessage);

    void appendErrorLog(targetKey, parsed.status, lastUserMessage, parsed.rawMessage,
      error instanceof Error ? error.stack : undefined);
    void sendTelegram(
      formatErrorNotification(targetKey, parsed.status, lastUserMessage, parsed.rawMessage),
    );

    return new Response(
      JSON.stringify({
        error: parsed.userMessage,
        detail: parsed.rawMessage,
      }),
      { status: parsed.status, headers: { "Content-Type": "application/json" } },
    );
  }
}
