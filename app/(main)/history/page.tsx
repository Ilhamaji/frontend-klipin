"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";

type HistoryItem = {
  id: string;
  query: string;
  timestamp: number;
  matches: number;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "clear_all" | "remove_item";
    targetId?: string;
  }>({ isOpen: false, type: "clear_all" });

  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("search_history");
    setHistory([]);
  };

  const removeHistoryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // Note: To re-search, we could pass it via query params to the canvas, but since the canvas uses local state,
  // we will just redirect to canvas and let the user type. Or ideally, we'd use URL state in the canvas.
  const handleReSearch = (query: string) => {
    // For now, redirect to home. In a robust app, home would read ?q=query
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="typography-headline-md text-on-surface mb-2">Riwayat Pencarian</h2>
            <p className="typography-body-md text-on-surface-variant">
              Tinjau kembali riwayat pencarian anda.
            </p>
          </div>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalConfig({ isOpen: true, type: "clear_all" })}
              className="px-4 py-2 bg-surface-container text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2 font-medium typography-label-md shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </motion.button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-outline" />
            </div>
            <h3 className="typography-headline-sm text-on-surface mb-2">Belum ada riwayat</h3>
            <p className="text-on-surface-variant max-w-md">
              Riwayat pencarian anda akan muncul di sini setelah anda melakukan pencarian.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id}
                  onClick={() => handleReSearch(item.query)}
                  className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="typography-label-md text-on-surface font-semibold text-base mb-1">
                        {item.query}
                      </h4>
                      <div className="flex items-center gap-3 typography-label-sm text-on-surface-variant">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{item.matches} Materi sesuai</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalConfig({ isOpen: true, type: "remove_item", targetId: item.id });
                      }}
                      className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            if (modalConfig.type === "clear_all") {
              clearHistory();
            } else if (modalConfig.type === "remove_item" && modalConfig.targetId) {
              removeHistoryItem(modalConfig.targetId);
            }
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
          }}
          title={
            modalConfig.type === "clear_all"
              ? "Konfirmasi Hapus Semua Riwayat"
              : "Konfirmasi Hapus Riwayat"
          }
          message={
            modalConfig.type === "clear_all"
              ? "Apakah Anda yakin ingin menghapus seluruh riwayat pencarian Anda? Tindakan ini tidak dapat dibatalkan."
              : "Apakah Anda yakin ingin menghapus item riwayat pencarian ini?"
          }
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </div>
  );
}
