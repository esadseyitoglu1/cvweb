"use client";

import { useChat } from "ai/react";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, Bot, User, Loader2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { resolveTarget, TARGET_CONFIG, TARGET_LABELS } from "@/lib/target-config";

type ErrorDisplay = {
  variant: "rate-limit" | "generic";
  title: string;
  detail: string;
};

function classifyError(error: Error | undefined): ErrorDisplay | null {
  if (!error) return null;
  const msg = (error.message || "").toLowerCase();

  if (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("limit doldu") ||
    msg.includes("quota") ||
    msg.includes("too many requests")
  ) {
    return {
      variant: "rate-limit",
      title: "İstek limiti doldu",
      detail:
        "Yapay zeka servisi şu an yoğun, lütfen biraz bekleyip tekrar deneyin. Bu durum Esad'a otomatik olarak bildirildi.",
    };
  }

  return {
    variant: "generic",
    title: "Bir aksaklık oldu",
    detail:
      "Yapay zekaya bağlanırken bir sorun çıktı — büyük ihtimalle API tarafında geçici bir gariplik. Hata Esad'a otomatik olarak bildirildi, en kısa sürede bakacaktır.",
  };
}

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const targetParam = searchParams.get("t");

  const targetKey = useMemo(() => resolveTarget(targetParam), [targetParam]);
  const { suggestions } = TARGET_CONFIG[targetKey];
  const targetLabel = TARGET_LABELS[targetKey] ?? "Genel Ziyaretçi";

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, error } =
    useChat({
      api: "/api/chat",
      body: { target: targetKey },
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const isEmpty = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const isStreaming = isLoading && lastMessage?.role === "assistant";
  const errorDisplay = classifyError(error);
  const isTargeted = targetKey !== "default";

  return (
    <section className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-6 py-4 backdrop-blur md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated ring-1 ring-border">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-100">AI Mülakat Asistanı</h2>
            <p className="text-xs text-zinc-500">Esad hakkında merak ettiklerinizi sorun</p>
          </div>
        </div>
        {isTargeted && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {targetLabel}
          </span>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10">
        {isEmpty ? (
          <EmptyState
            suggestions={suggestions}
            targetLabel={isTargeted ? targetLabel : null}
            onPick={(text) => append({ role: "user", content: text })}
          />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            ))}
            {isLoading && lastMessage?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Düşünüyor...
              </div>
            )}
            {errorDisplay && <ErrorBanner display={errorDisplay} />}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-background px-4 py-4 md:px-10 md:py-6"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-border bg-panel p-2 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
            rows={1}
            placeholder="Esad'a bir soru sorun..."
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-zinc-950 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function ErrorBanner({ display }: { display: ErrorDisplay }) {
  const Icon = display.variant === "rate-limit" ? Clock : AlertCircle;
  const tone =
    display.variant === "rate-limit"
      ? "border-amber-900/50 bg-amber-950/30 text-amber-200"
      : "border-red-900/50 bg-red-950/30 text-red-200";
  const accent =
    display.variant === "rate-limit" ? "text-amber-300" : "text-red-300";
  const subdued =
    display.variant === "rate-limit" ? "text-amber-200/80" : "text-red-200/80";

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${tone}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`} />
      <div className="flex flex-col gap-2">
        <p className={`font-medium ${accent}`}>{display.title}</p>
        <p className={`${subdued}`}>{display.detail}</p>
        <span className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-900/60">
          <CheckCircle2 className="h-3 w-3" />
          Esad'a bildirildi
        </span>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: string;
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex animate-fade-in gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-border ${
          isUser ? "bg-elevated" : "bg-accent/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-zinc-400" />
        ) : (
          <Bot className="h-4 w-4 text-accent" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-elevated text-zinc-100"
            : "bg-panel text-zinc-200 ring-1 ring-border"
        }`}
      >
        <span className={`whitespace-pre-wrap ${isStreaming ? "typing-caret" : ""}`}>
          {content}
        </span>
      </div>
    </div>
  );
}

function EmptyState({
  suggestions,
  targetLabel,
  onPick,
}: {
  suggestions: string[];
  targetLabel: string | null;
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/30">
        <Sparkles className="h-6 w-6 text-accent" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
          {targetLabel
            ? `Merhaba ${targetLabel} ekibi, ben Esad'ın dijital CV asistanıyım.`
            : "Merhaba, ben Esad'ın dijital CV asistanıyım."}
        </h3>
        <p className="text-sm text-zinc-400">
          Akademik geçmişi, projeleri ve yetkinlikleri hakkında her şeyi sorabilirsiniz.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-panel px-4 py-3 text-left text-sm text-zinc-300 transition-all hover:border-accent/60 hover:bg-elevated hover:text-zinc-100"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
