"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { LogOut, User, Moon, Sun, Monitor, Bell } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div>
          <h2 className="typography-headline-md text-on-surface mb-2">Settings</h2>
          <p className="typography-body-md text-on-surface-variant">
            Manage your account preferences and application settings.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border border-outline-variant/30 space-y-6">
          <h3 className="typography-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <User className="w-5 h-5 text-primary" />
            Account
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="typography-label-md text-on-surface font-semibold">User Profile</p>
              <p className="typography-body-sm text-on-surface-variant">Logged in as Academic User</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-error/10 text-error hover:bg-error hover:text-on-error rounded-lg transition-colors flex items-center gap-2 font-medium typography-label-md"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border border-outline-variant/30 space-y-6">
          <h3 className="typography-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <Monitor className="w-5 h-5 text-primary" />
            Appearance
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="typography-label-md text-on-surface font-semibold">Theme Preference</p>
              <p className="typography-body-sm text-on-surface-variant">Choose your preferred visual style</p>
            </div>
            
            {mounted && (
              <div className="flex bg-surface-container rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all typography-label-md ${
                    theme === "light" ? "bg-surface-container-lowest shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all typography-label-md ${
                    theme === "dark" ? "bg-surface-container-lowest shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all typography-label-md ${
                    theme === "system" ? "bg-surface-container-lowest shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Monitor className="w-4 h-4" /> System
                </button>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
