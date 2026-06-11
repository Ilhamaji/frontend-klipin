"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Send,
  ArrowRight,
  BookOpen,
  Clock,
  Bot,
  Copy,
  BookmarkPlus,
  Bell,
  HelpCircle,
  User,
  Paperclip,
  FileText
} from "lucide-react";
import { searchArticles, summarize, addNote, getProfile } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Article = {
  title: string;
  url: string;
  abstract: string;
  authors: string[];
  year: string;
  subject: string;
  jenjang: string;
  relevance_score: number | null;
};

type SearchResponse = {
  source: string;
  similarity_score: number;
  articles: Article[];
};

const formatSummaryMarkdown = (summary: any): string => {
  if (!summary) return "";
  if (typeof summary === "string") return summary;

  const parts = [];
  if (summary.identitas) parts.push(`### Identitas\n${summary.identitas}`);
  if (summary.kompetensi) parts.push(`### Kompetensi\n${summary.kompetensi}`);
  if (summary.isi_materi) parts.push(`### Isi Materi\n${summary.isi_materi}`);
  if (summary.temuan) parts.push(`### Temuan\n${summary.temuan}`);
  if (summary.kesimpulan) parts.push(`### Kesimpulan\n${summary.kesimpulan}`);

  if (parts.length > 0) return parts.join("\n\n");

  return summary.summary || summary.text || JSON.stringify(summary, null, 2);
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          Loading interface...
        </div>
      }
    >
      <ResearchCanvas />
    </Suspense>
  );
}

function ResearchCanvas() {
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [greeting, setGreeting] = useState("Selamat Datang");
    useEffect(() => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
      else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
      else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
      else setGreeting("Selamat Malam");

      // Effect data profile
      getProfile()
      .then((res) => setUsername(res.data.username))
      .catch(() => setUsername(""));
    }, []);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [summaryData, setSummaryData] = useState<{
    url: string;
    summary: string;
  } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleNewChat = () => {
      setQuery("");
      setHasSearched(false);
      setSearchData(null);
      setSummaryData(null);
      setIsSearching(false);
      setIsSummarizing(false);
      setSearchError(null);
      router.push("/");
    };

    window.addEventListener("new-chat", handleNewChat);
    return () => window.removeEventListener("new-chat", handleNewChat);
  }, [router]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setHasSearched(true);

      // Try loading from local storage cache for an instantaneous recovery experience
      const savedHistory = JSON.parse(
        localStorage.getItem("search_history") || "[]",
      );
      const cachedItem = savedHistory.find((h: any) => h.query === q);
      if (cachedItem && cachedItem.searchData) {
        setSearchData(cachedItem.searchData);
        if (cachedItem.summaryData) {
          setSummaryData(cachedItem.summaryData);
        }
      } else {
        handleSearch(undefined, q);
      }
    }
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchData(null);
    setSummaryData(null);
    setSearchError(null);

    try {
      const data = await searchArticles(searchQuery);
      setSearchData(data);

      // If we got articles, trigger summary automatically
      if (data.articles && data.articles.length > 0) {
        // Save full canvas state to History cache
        const currentHistory = JSON.parse(
          localStorage.getItem("search_history") || "[]",
        );
        const existingIdx = currentHistory.findIndex(
          (h: any) => h.query === searchQuery,
        );
        let historyId = Date.now().toString();

        const newHistoryItem = {
          id: historyId,
          query: searchQuery,
          timestamp: Date.now(),
          matches: data.articles.length,
          searchData: data,
        };

        let updatedHistory = [];
        if (existingIdx >= 0) {
          historyId = currentHistory[existingIdx].id;
          newHistoryItem.id = historyId;
          // Retain summaryData if present
          if (currentHistory[existingIdx].summaryData) {
            (newHistoryItem as any).summaryData =
              currentHistory[existingIdx].summaryData;
          }
          updatedHistory = [
            newHistoryItem,
            ...currentHistory.filter((_, idx) => idx !== existingIdx),
          ];
        } else {
          updatedHistory = [newHistoryItem, ...currentHistory.slice(0, 49)];
        }
        localStorage.setItem("search_history", JSON.stringify(updatedHistory));

        if ((newHistoryItem as any).summaryData) {
          setSummaryData((newHistoryItem as any).summaryData);
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes("401")) {
        setSearchError("Sesi Anda telah berakhir. Mengarahkan ke halaman login...");
        Cookies.remove("auth_token");
        router.push("/login");
      } else {
        setSearchError(error.message || "Terjadi kesalahan saat melakukan pencarian.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSummarize = async (article: Article) => {
    setIsSummarizing(true);
    setSummaryData(null);
    try {
      const sumData = await summarize({ url: article.url });
      setSummaryData(sumData);

      const currentHistory = JSON.parse(
        localStorage.getItem("search_history") || "[]",
      );
      const existingIdx = currentHistory.findIndex(
        (h: any) => h.query === query,
      );
      if (existingIdx >= 0) {
        currentHistory[existingIdx].summaryData = sumData;
        localStorage.setItem(
          "search_history",
          JSON.stringify(currentHistory),
        );
      }
    } catch (sumErr: any) {
      setSummaryData({
        url: article.url,
        summary: `⚠️ Tidak dapat membuat ringkasan: ${sumErr.message || "Terjadi kesalahan pada server."}`,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (summaryData?.summary) {
      const textToCopy = formatSummaryMarkdown(summaryData.summary);
      navigator.clipboard.writeText(textToCopy);
      alert("Ringkasan berhasil disalin!");
    } else {
      alert("Tidak ada ringkasan untuk disalin.");
    }
  };

  const handleSaveToNotes = async () => {
    if (!summaryData?.summary) {
      alert("Tidak ada ringkasan untuk disimpan.");
      return;
    }
    
    setIsSavingNote(true);
    try {
      const contentString = formatSummaryMarkdown(summaryData.summary);
      const res = await addNote(`Ringkasan: ${query}`, contentString);
      if (!res?.error) {
        alert("Ringkasan berhasil disimpan ke catatan!");
      } else {
        alert("Gagal menyimpan ke catatan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan catatan.");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative w-full overflow-hidden bg-[#f8fafc] font-sans">
      {/* Header
      <header className="flex-none px-8 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#0f766e] tracking-tight">
            Dashboard
          </h2>
        </div>
      </header> */}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 relative">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center mt-[-10vh]"
            >
              <div className="w-20 h-20 bg-[#0f766e]/10 rounded-3xl flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-[#0f766e]" />
              </div>
              <h1 className="text-3xl md:text-4xl text-slate-800 mb-4 font-bold tracking-tight">
                {greeting} {username || "User"}!
              </h1>
              <p className="text-base md:text-lg text-slate-500 mb-10 max-w-2xl leading-relaxed">
                Masukan kata kunci pembelajaran yang ingin dicari dan AI akan membantu mengklasifikasikan hasil berdasarkan jenjang dan mata pelajarannya.
              </p>

              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="relative bg-white shadow-lg shadow-slate-200/50 rounded-full border border-slate-100 overflow-hidden flex items-center pr-2 pl-4 focus-within:border-[#0f766e]/30 focus-within:ring-4 focus-within:ring-[#0f766e]/10 transition-all h-14">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tanya apapun tentang materi yang ingin dicari..."
                    className="w-full py-2 px-3 bg-transparent outline-none text-slate-700 text-sm placeholder:text-slate-400 mr-2"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                      query.trim()
                        ? "bg-[#0f766e] text-white hover:bg-[#0d645d] shadow-md shadow-[#0f766e]/20"
                        : "bg-[#0f766e] text-white opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="max-w-6xl mx-auto min-h-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-40"
            >
              {/* Left Column: Related Articles */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Materi terkait
                  </h3>
                  {searchData && (
                    <span className="px-3 py-1 bg-[#dcfce7] text-[#0f766e] text-xs font-medium rounded-full">
                      {searchData.articles.length} Sesuai
                    </span>
                  )}
                </div>

                {searchError ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-red-600 text-sm shadow-sm flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-1">Pencarian Gagal</span>
                      {searchError}
                    </div>
                  </div>
                ) : isSearching ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-40 bg-white border border-slate-100 shadow-sm animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  searchData?.articles.map((article, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                      onClick={() => handleSummarize(article)}
                      className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer hover:border-[#0f766e]/30"
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
                      <p className="text-slate-500 line-clamp-3 mb-4 text-sm leading-relaxed">
                        {article.abstract || "No abstract available."}
                      </p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-xs font-medium text-slate-400">
                          {article.year} • {article.authors?.[0] || "Unknown"}
                        </span>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = JSON.parse(
                                localStorage.getItem("saved_articles") || "[]",
                              );
                              if (
                                !current.find((a: any) => a.url === article.url)
                              ) {
                                localStorage.setItem(
                                  "saved_articles",
                                  JSON.stringify([
                                    {
                                      ...article,
                                      id: article.url,
                                      savedAt: Date.now(),
                                    },
                                    ...current,
                                  ]),
                                );
                                alert("Article saved to library!");
                              } else {
                                alert("Article already in library!");
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#0f766e] transition-colors"
                            title="Save to Library"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </motion.button>
                          {article.url && (
                            <motion.a
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              href={article.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-[#0f766e] hover:text-[#0d645d] transition-colors"
                              title="Read Original"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Right Column: AI Summary */}
              <div className="col-span-1 lg:col-span-8 lg:sticky lg:top-8 h-fit">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#e6f2f1] rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-[#0f766e]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          Ringkasan Materi
                        </h3>
                        <p className="text-sm text-slate-500">
                          Hasil ringkasan materi
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopySummary}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">
                          Salin
                        </span>
                      </button>
                      <button 
                        onClick={handleSaveToNotes}
                        disabled={isSavingNote || !summaryData?.summary}
                        className="px-4 py-2 bg-[#0f766e] text-white hover:bg-[#0d645d] rounded-lg transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50"
                      >
                        {isSavingNote ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                           <BookmarkPlus className="w-4 h-4" />
                        )}
                        Simpan ke Catatan
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none font-sans text-slate-700">
                    {searchError ? (
                      <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                        Tidak dapat membuat ringkasan karena pencarian gagal.
                      </div>
                    ) : isSummarizing ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                      </div>
                    ) : summaryData ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatSummaryMarkdown(summaryData.summary)}
                        </ReactMarkdown>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 pt-20 pb-10">
                        <Bot className="w-12 h-12 mb-4 opacity-30" />
                        <p>Silakan pilih salah satu materi di sebelah kiri<br/>untuk melihat ringkasan.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Search Bar Bottom */}
      {hasSearched && (
        <div className="absolute left-0 right-0 p-4 md:p-8 bottom-0 z-20 transition-all duration-500 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent pt-12 pointer-events-none">
          <div className="pointer-events-auto max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative bg-white shadow-lg shadow-slate-200/50 rounded-full border border-slate-100 overflow-hidden flex items-center pr-2 pl-4 focus-within:border-[#0f766e]/30 focus-within:ring-4 focus-within:ring-[#0f766e]/10 transition-all h-14">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your study materials..."
                  className="w-full py-2 px-3 bg-transparent outline-none text-slate-700 text-sm placeholder:text-slate-400 mr-2"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                    query.trim()
                      ? "bg-[#0f766e] text-white hover:bg-[#0d645d] shadow-md shadow-[#0f766e]/20"
                      : "bg-[#0f766e] text-white opacity-50 cursor-not-allowed",
                  )}
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
