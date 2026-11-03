"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Library, FileText, History, LogOut, Menu, X, Paperclip, Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  const handleNewChat = () => {
    if (pathname !== "/") {
      router.push("/");
    }
    // We dispatch the event so that if we are already on '/', it resets the state.
    // If we are navigating to '/', the new page will mount with default empty state anyway,
    // but dispatching doesn't hurt. However, we should defer it slightly if we are navigating,
    // or simply let the event handle the case where we are already on the page.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('new-chat'));
    }, 50);
    setIsOpen(false);
  };

  const navItems = [
    { name: "Histori", href: "/history", icon: History },
    { name: "Catatan", href: "/notes", icon: FileText },
    { name: "Materi", href: "/materials", icon: Archive },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white text-slate-800 shadow-sm border border-slate-200 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "h-full bg-white border-r border-slate-100 flex flex-col py-6 shrink-0 fixed md:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out font-sans w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="w-64 flex flex-col h-full px-4">
          <div className="mb-6 px-2 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/klipin.png"
                alt="Klipin Logo"
                width={140}
                height={70}
                priority
                unoptimized
                className="h-20 w-auto object-contain"
              />
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full select-none">
                Demo
              </span>
            </div>
            <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-2 mb-6">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#0d645d] text-white py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Chat Baru
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-1 flex-1">
            {navItems.map((item) => {
              // Mock active state for display purposes based on image if it's the root path.
              // We'll set History to active if we are on "/" or "/history" for now.
              const isActive = pathname === item.href || (pathname === "/" && item.name === "History");
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#dcfce7]/60 text-[#0f766e]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#0f766e]" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-1 flex flex-col gap-1 mt-auto">

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
