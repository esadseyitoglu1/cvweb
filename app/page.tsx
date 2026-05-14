import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <ChatInterface />
    </main>
  );
}
