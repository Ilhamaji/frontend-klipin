"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  FileText,
  History,
  LogOut,
  Paperclip,
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
      <aside className="hidden md:flex h-full w-64 shrink-0 flex-col border-r border-slate-100 bg-white py-6 font-sans">
        <div className="flex h-full w-64 flex-col px-4">
          <div className="mb-6 px-2 flex items-center min-w-0">
            <Image
              src="/klipin.png"
              alt="Klipin Logo"
              width={579}
              height={270}
              priority
              unoptimized
              style={{ width: "auto", height: "auto" }}
              className="h-16 w-auto shrink-0 object-contain sm:h-20"
            />
            <span className="ml-2 shrink-0 rounded-full border border-teal-200/60 bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 select-none">
              Demo
            </span>
          </div>

          <div className="px-2 mb-6">
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f766e] py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0d645d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Chat Baru
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#dcfce7]/60 text-[#0f766e]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-[#0f766e]" : "text-slate-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 px-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 text-red-500" />
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
