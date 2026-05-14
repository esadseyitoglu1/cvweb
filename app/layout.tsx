import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Esad Erva Seyitoğlu — AI Dijital CV",
  description:
    "Bilgisayar Mühendisliği öğrencisi & Indie Game Developer. Yapay zeka destekli interaktif CV ve mülakat asistanı.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-background text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
