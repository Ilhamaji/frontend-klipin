"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  FileText,
  History,
  LogOut,
  Plus,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  const handleNewChat = () => {
    if (pathname !== "/") {
      router.push("/");
    }
    // Deferred so a navigation can settle before the reset handler runs.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("new-chat"));
    }, 50);
  };

  const navItems = [
    { name: "Cari", href: "/", icon: Search },
    { name: "Histori", href: "/history", icon: History },
    { name: "Catatan", href: "/notes", icon: FileText },
    { name: "Materi", href: "/materials", icon: Archive },
  ];

  return (
    <>
      {/* Desktop sidebar. Hidden below md — phones get the bottom tab bar
          instead, which keeps navigation reachable with a thumb and frees the
          top of the screen for content. */}
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-slate-200/70 bg-white px-3 py-5 font-sans md:flex">
        <div className="flex h-full min-w-0 flex-col">
          {/* The logo and the badge together are wider than the usable
              sidebar width at the sm breakpoint, which pushed the badge past
              the edge. Letting the logo shrink keeps both inside. */}
          <div className="mb-6 flex items-center gap-2 overflow-hidden px-2">
            <Image
              src="/klipin.png"
              alt="Klipin Logo"
              width={579}
              height={270}
              priority
              unoptimized
              style={{ width: "auto", height: "auto" }}
              className="h-14 w-auto min-w-0 object-contain object-left"
            />
            <span className="shrink-0 whitespace-nowrap rounded-full border border-teal-200/60 bg-teal-50 px-1.5 py-0.5 text-[10px] leading-none font-bold uppercase text-teal-700 select-none">
              Demo
            </span>
          </div>

          <button
            onClick={handleNewChat}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0d645d] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Chat Baru
          </button>

          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          <nav className="flex flex-1 flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#0f766e]/8 text-[#0f766e]"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#0f766e]" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-[#0f766e]"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200/70 pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar. pb-safe keeps the labels above the iOS home
          indicator; the main content is padded to match so nothing hides
          behind it. */}
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-[#0f766e]" : "text-slate-500"
                )}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.4 : 1.9}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[11px] font-medium text-slate-500 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
            Keluar
          </button>
        </div>
      </nav>
    </>
  );
}
