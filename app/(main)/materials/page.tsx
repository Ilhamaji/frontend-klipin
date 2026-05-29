"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, BookOpen, Trash2, ArrowRight } from "lucide-react";

type SavedArticle = {
  id: string;
  title: string;
  url: string;
  abstract: string;
  authors: string[];
  year: string;
  subject: string;
  jenjang: string;
  savedAt: number;
};

export default function MaterialsPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saved_articles");
    if (saved) {
      try {
        setArticles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved articles", e);
      }
    }
    setIsMounted(true);
  }, []);

  const removeArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newArticles = articles.filter((a) => a.id !== id);
    setArticles(newArticles);
    localStorage.setItem("saved_articles", JSON.stringify(newArticles));
  };

  if (!isMounted) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-[#f8fafc] font-sans h-full">
        <div className="max-w-4xl mx-auto space-y-8 flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0f766e]/30 border-t-[#0f766e] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-[#f8fafc] font-sans h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0f766e] tracking-tight mb-2">Materi Tersimpan</h2>
            <p className="text-sm text-slate-500">
              Akses dan kelola materi yang sudah kamu simpan.
            </p>
          </div>
          {articles.length > 0 && (
            <span className="px-3 py-1 bg-[#dcfce7] text-[#0f766e] text-xs font-medium rounded-full shrink-0 self-start sm:self-auto">
              {articles.length} Materi Tersimpan
            </span>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#e6f2f1] rounded-full flex items-center justify-center mb-4">
              <Archive className="w-8 h-8 text-[#0f766e]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Materi</h3>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed">
               Kamu belum menyimpan materi apapun. Saat menemukan artikel yang menarik di Research Canvas, klik ikon bookmark untuk menyimpannya di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {articles.map((article, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={article.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {article.subject || "General"}
                    </span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-md">
                      {article.jenjang || "N/A"}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-[15px] text-slate-800 leading-tight mb-2">
                    {article.title || "Untitled Document"}
                  </h4>
                  
                  <p className="text-slate-500 line-clamp-3 mb-4 text-sm leading-relaxed flex-1">
                    {article.abstract || "No abstract available."}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-400">
                        {article.year} • {article.authors?.[0] || "Unknown"}
                      </span>
                      <span className="text-[10px] text-slate-400/70 mt-0.5">
                        Disimpan: {new Date(article.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => removeArticle(article.id, e)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from Materials"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                      
                      {article.url && (
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#0f766e] hover:bg-[#e6f2f1] rounded-lg transition-colors"
                          title="Read Original"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.a>
                      )}
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
