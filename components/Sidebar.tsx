import { Download, Linkedin, Mail, MapPin } from "lucide-react";

const LINKEDIN_URL = "https://www.linkedin.com/in/esadseyitoglu";
const CONTACT_EMAIL = "esad.seyitoglu@ozu.edu.tr";

export default function Sidebar() {
  return (
    <aside className="flex w-full flex-col gap-4 border-b border-border bg-panel p-6 md:gap-6 md:p-8 md:sticky md:top-0 md:h-screen md:w-80 md:border-b-0 md:border-r lg:w-96">
      <div className="flex flex-col gap-1">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-elevated text-2xl font-semibold text-accent ring-1 ring-border md:mb-4 md:h-20 md:w-20 md:text-3xl">
          EE
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
          Esad Erva Seyitoğlu
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Bilgisayar Mühendisliği Öğrencisi
          <br />
          <span className="text-zinc-500">&amp;</span> Indie Game Developer
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6 text-sm text-zinc-400">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-500" />
          Özyeğin Üniversitesi · İstanbul
        </span>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-accent"
        >
          <Mail className="h-4 w-4 text-zinc-500" />
          {CONTACT_EMAIL}
        </a>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <a
          href="/cv.pdf"
          download
          className="group flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-zinc-950 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Klasik CV'yi İndir (PDF)
        </a>

        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-zinc-300 transition-all hover:border-accent hover:text-accent"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
      </div>

      <div className="mt-auto hidden border-t border-border pt-6 text-xs text-zinc-600 md:block">
        <p>
          Bu sohbet yapay zekâ tarafından yürütülmektedir. Esad hakkındaki her
          türlü soruyu sağ taraftan iletebilirsiniz.
        </p>
      </div>
    </aside>
  );
}
