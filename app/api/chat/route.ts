import { google } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("AI Chat Hatası:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
