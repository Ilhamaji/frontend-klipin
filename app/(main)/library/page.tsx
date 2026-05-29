"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ArrowRight, Trash2, BookOpen } from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

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

export default function LibraryPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("saved_articles");
    if (saved) {
      try {
        setArticles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse library");
      }
    }
  }, []);

  const removeArticle = (id: string) => {
    const newArticles = articles.filter((a) => a.id !== id);
    setArticles(newArticles);
    localStorage.setItem("saved_articles", JSON.stringify(newArticles));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="typography-headline-md text-on-surface mb-2">My Library</h2>
            <p className="typography-body-md text-on-surface-variant">
              Articles and papers you have bookmarked.
            </p>
          </div>
          <div className="px-4 py-2 bg-primary-container/20 text-primary rounded-full typography-label-md font-semibold">
            {articles.length} Items Saved
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
              <BookMarked className="w-8 h-8 text-outline" />
            </div>
            <h3 className="typography-headline-sm text-on-surface mb-2">Your Library is Empty</h3>
            <p className="text-on-surface-variant max-w-md">
              Save articles from the Research Canvas to access them quickly later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {articles.map((article, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  key={article.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border border-outline-variant/30 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary origin-top transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                  
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="px-2 py-1 bg-surface-container text-on-surface-variant typography-label-sm rounded-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {article.subject || "General"}
                    </span>
                    <span className="px-2 py-1 bg-surface-container text-on-surface-variant typography-label-sm rounded-md">
                      {article.jenjang || "N/A"}
                    </span>
                  </div>
                  
                  <h4 className="font-hanken font-semibold text-lg text-on-surface leading-tight mb-3">
                    {article.title || "Untitled Document"}
                  </h4>
                  
                  <p className="typography-body-sm text-on-surface-variant line-clamp-3 mb-6 flex-1">
                    {article.abstract || "No abstract available."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
                    <button
                      onClick={() => setDeleteTarget(article.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Remove from Library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {article.url && (
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        Read Paper
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <ConfirmationModal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              removeArticle(deleteTarget);
              setDeleteTarget(null);
            }
          }}
          title="Konfirmasi Hapus Artikel"
          message="Apakah Anda yakin ingin menghapus artikel ini dari perpustakaan Anda?"
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </div>
  );
}
