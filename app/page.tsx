import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col-reverse md:flex-row">
      <Sidebar />
      <Suspense fallback={<ChatSkeleton />}>
        <ChatInterface />
      </Suspense>
    </main>
  );
}

function ChatSkeleton() {
  return (
    <section className="flex flex-1 items-center justify-center bg-background">
      <div className="h-2 w-24 animate-pulse rounded-full bg-zinc-800" />
    </section>
  );
}
