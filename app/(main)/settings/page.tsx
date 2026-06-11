"use client";

import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

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

      </motion.div>
    </div>
  );
}
