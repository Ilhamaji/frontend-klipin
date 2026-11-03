"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { articleHistory } from "@/lib/api";

type Article = {
  id: number;
  query_id: number;
  title: string;
  url: string;
  relevance_score: number;
  created_at: string;
};

type HistoryItem = {
  id: number;
  query_text: string;
  created_at: string;
  articles: Article[];
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "clear_all" | "remove_item";
    targetId?: number;
  }>({ isOpen: false, type: "clear_all" });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await articleHistory();
        setHistory(data.data);
      } catch (error) {
        console.error("Gagal mengambil history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleReSearch = (item: HistoryItem) => {
    // simpan articles ke localStorage sebelum pindah halaman
    localStorage.setItem("history_articles", JSON.stringify(item.articles));
    router.push(`/?q=${encodeURIComponent(item.query_text)}&from_history=true`);
  };

  return (
    <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 md:pb-10 relative">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="typography-headline-md text-on-surface mb-2">
              Riwayat Pencarian
            </h2>
            <p className="typography-body-md text-on-surface-variant">
              Tinjau kembali riwayat pencarian anda.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-on-surface-variant">Memuat riwayat...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-outline" />
            </div>
            <h3 className="typography-headline-sm text-on-surface mb-2">
              Belum ada riwayat
            </h3>
            <p className="text-on-surface-variant max-w-md">
              Riwayat pencarian anda akan muncul di sini setelah anda melakukan
              pencarian.
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
                  onClick={() => handleReSearch(item)}
                  className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="typography-label-md text-on-surface font-semibold text-base mb-1">
                        {item.query_text}
                      </h4>
                      <div className="flex items-center gap-3 typography-label-sm text-on-surface-variant">
                        <span>
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </span>
                        <span>•</span>
                        <span>{item.articles.length} Materi sesuai</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
