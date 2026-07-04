"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, FileSignature, LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/pyme/aplicaciones", label: "Postulaciones", icon: Inbox },
  { href: "/pyme/contratos", label: "Contratos", icon: FileSignature },
];

export default function PymeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple text-white font-bold">S</div>
            <span className="text-lg font-black text-brand-dark">Skill<span className="text-brand-purple">Up</span></span>
          </div>
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-purple transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
