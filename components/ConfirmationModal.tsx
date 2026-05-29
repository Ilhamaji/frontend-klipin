"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden z-10"
          >
            {/* Top decorative gradient bar */}
            <div
              className={cn(
                "h-1.5 w-full",
                variant === "danger" && "bg-error",
                variant === "warning" && "bg-amber-500",
                variant === "info" && "bg-primary"
              )}
            />

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon wrapper */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    variant === "danger" && "bg-error-container/50 text-error",
                    variant === "warning" && "bg-amber-500/10 text-amber-500",
                    variant === "info" && "bg-primary-container/30 text-primary"
                  )}
                >
                  {variant === "danger" ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>

                {/* Texts */}
                <div className="flex-1 pt-1">
                  <h3 className="font-hanken font-bold text-xl text-on-surface mb-2">
                    {title}
                  </h3>
                  <p className="typography-body-md text-on-surface-variant text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl typography-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "px-5 py-2.5 rounded-xl typography-label-md font-semibold text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50",
                    variant === "danger" &&
                      "bg-error hover:bg-error/90 shadow-error/20",
                    variant === "warning" &&
                      "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
                    variant === "info" &&
                      "bg-primary hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : variant === "danger" ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  )}
                  {isLoading ? "Memproses..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
