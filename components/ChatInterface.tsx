"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Send, Sparkles, Bot, User, Loader2, AlertCircle } from "lucide-react";

const SUGGESTIONS = [
  "Esad'ı 30 saniyede tanıt",
  "Hangi teknolojilerle çalışıyor?",
  "Ribat Games projesi nedir?",
  "Neden yaz stajı için ideal bir aday?",
];

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, error } =
    useChat({
      api: "/api/chat",
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

  return (
    <section className="flex flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-6 py-4 backdrop-blur md:px-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated ring-1 ring-border">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-100">AI Mülakat Asistanı</h2>
          <p className="text-xs text-zinc-500">Esad hakkında merak ettiklerinizi sorun</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10">
        {isEmpty ? (
          <EmptyState onPick={(text) => append({ role: "user", content: text })} />
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
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-300">Bir hata oluştu</p>
                  <p className="mt-1 text-red-200/80">{error.message || "Yapay zeka şu an yanıt veremiyor."}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border bg-background px-4 py-4 md:px-10 md:py-6">
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-border bg-panel p-2 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) handleSubmit(e as any);
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
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </section>
  );
}

function MessageBubble({ role, content, isStreaming }: { role: string; content: string; isStreaming?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex animate-fade-in gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-border ${isUser ? "bg-elevated" : "bg-accent/10"}`}>
        {isUser ? <User className="h-4 w-4 text-zinc-400" /> : <Bot className="h-4 w-4 text-accent" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-elevated text-zinc-100" : "bg-panel text-zinc-200 ring-1 ring-border"}`}>
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/30">
        <Sparkles className="h-6 w-6 text-accent" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Merhaba, ben Esad'ın dijital CV asistanıyım.</h3>
        <p className="text-sm text-zinc-400">Akademik geçmişi, projeleri ve yetkinlikleri hakkında her şeyi sorabilirsiniz.</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => onPick(s)} className="rounded-xl border border-border bg-panel px-4 py-3 text-left text-sm text-zinc-300 transition-all hover:border-accent/60 hover:bg-elevated hover:text-zinc-100">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
