"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  FileText,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { searchArticles, summarize, addNote, getProfile, saveArticle } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Article = {
  id: number;
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

const cleanMarkdownSymbols = (str: any): string => {
  if (!str) return "";
  if (typeof str !== "string") return String(str);
  return str
    .replace(/\*\*/g, "") // remove bold asterisks
    .replace(/^\s+|\s+$/g, "") // trim whitespace/newlines
    .trim();
};

const formatSummaryMarkdown = (
  summary: any,
  article?: Article | null,
  includeTitle = true
): string => {
  if (!summary) return "";

  const parts = [];

  if (article) {
    const summaryObj = typeof summary === "object" ? summary : {};
    const title = cleanMarkdownSymbols(
      summaryObj.judul || summaryObj.title || summaryObj.identitas || article.title
    );
    const author = cleanMarkdownSymbols(
      summaryObj.author || article.authors?.join(", ")
    );
    if (includeTitle && title) {
      parts.push(`# ${title}`);
    }
    if (author) {
      parts.push(`**Penulis:** ${author}`);
    }
    if (article.url) {
      parts.push(`**Link Dokumen:** [Buka Dokumen](${article.url})`);
    }
  }

  if (typeof summary === "string") {
    parts.push(summary);
  } else {
    // Only display identitas if we didn't prepend the article details
    if (summary.identitas && !article) {
      parts.push(`### Identitas\n${summary.identitas}`);
    }
    if (summary.kompetensi) {
      parts.push(`### Kompetensi\n${summary.kompetensi}`);
    }
    if (summary.isi_materi) {
      parts.push(`### Isi Materi\n${summary.isi_materi}`);
    }
    if (summary.temuan) {
      parts.push(`### Temuan\n${summary.temuan}`);
    }
    if (summary.kesimpulan) {
      parts.push(`### Kesimpulan\n${summary.kesimpulan}`);
    }
    if (summary.daftar_pustaka) {
      parts.push(`### Daftar Pustaka\n${summary.daftar_pustaka}`);
    }
  }

  if (parts.length > 0) return parts.join("\n\n");

  return summary.summary || summary.text || JSON.stringify(summary, null, 2);
};

const translateDuration = (duration: string): string => {
  let result = duration;
  result = result.replace(/(\d+)\.\d+s/g, "$1s");
  result = result
    .replace(/(\d+)h/g, "$1 jam ")
    .replace(/(\d+)m/g, "$1 menit ")
    .replace(/(\d+)s/g, "$1 detik ")
    .trim();
  return result.replace(/\s+/g, " ");
};

const formatInnerError = (msg: string): string => {
  const isRateLimit =
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("too many requests") ||
    msg.toLowerCase().includes("rate_limit_exceeded") ||
    msg.toLowerCase().includes("please try again") ||
    msg.toLowerCase().includes("429");

  if (isRateLimit) {
    const tryAgainMatch = msg.match(/Please try again in\s+([0-9a-zA-Z.]+)/i);
    if (tryAgainMatch && tryAgainMatch[1]) {
      let rawDuration = tryAgainMatch[1];
      if (rawDuration.endsWith(".")) {
        rawDuration = rawDuration.slice(0, -1);
      }
      const translated = translateDuration(rawDuration);
      return `Batas limit permintaan tercapai. Silakan coba lagi dalam ${translated}.`;
    }
    return "Batas limit permintaan tercapai. Silakan coba beberapa saat lagi.";
  }

  if (msg.includes("Koneksi gagal ke Groq API")) {
    return "Koneksi ke layanan AI (Groq) gagal. Silakan coba beberapa saat lagi.";
  }

  return msg;
};

const cleanErrorMessage = (rawMessage: string): string => {
  if (!rawMessage) return "Terjadi kesalahan pada server.";

  const detailIndex = rawMessage.indexOf("Detail:");
  if (detailIndex !== -1) {
    const jsonStr = rawMessage.substring(detailIndex + 7).trim();
    try {
      const parsed = JSON.parse(jsonStr);
      const innerMessage = parsed?.error?.message || parsed?.message;
      if (innerMessage) {
        return formatInnerError(innerMessage);
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  return formatInnerError(rawMessage);
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

  const currentArticle = searchData?.articles?.find(
    (a) => a.url === summaryData?.url
  );

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const [leftProgress, setLeftProgress] = useState(0);
  const [rightProgress, setRightProgress] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleLeftScroll = () => {
    const container = leftScrollRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setLeftProgress(progress);
      setShowLeftArrow(scrollTop < 10 && totalScroll > 0);
    }
  };

  const handleRightScroll = () => {
    const container = rightScrollRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setRightProgress(progress);
      setShowRightArrow(scrollTop < 10 && totalScroll > 0);
    }
  };

  useEffect(() => {
    const container = leftScrollRef.current;
    if (!container) {
      setShowLeftArrow(false);
      return;
    }

    setLeftProgress(0);
    container.scrollTop = 0;

    const check = () => {
      setShowLeftArrow(container.scrollHeight > container.clientHeight);
    };

    const t1 = setTimeout(check, 100);
    const t2 = setTimeout(check, 400);
    const t3 = setTimeout(check, 1000);

    const ro = new ResizeObserver(check);
    ro.observe(container);

    const mo = new MutationObserver(check);
    mo.observe(container, { childList: true, subtree: false });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      mo.disconnect();
    };
  }, [searchData]);

  useEffect(() => {
    const container = rightScrollRef.current;
    if (!container) {
      setShowRightArrow(false);
      return;
    }

    setRightProgress(0);
    container.scrollTop = 0;

    const check = () => {
      setShowRightArrow(container.scrollHeight > container.clientHeight);
    };

    const t1 = setTimeout(check, 100);
    const t2 = setTimeout(check, 400);
    const t3 = setTimeout(check, 1000);

    const ro = new ResizeObserver(check);
    ro.observe(container);

    const mo = new MutationObserver(check);
    mo.observe(container, { childList: true, subtree: false });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      mo.disconnect();
    };
  }, [summaryData, isSummarizing]);

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
            ...currentHistory.filter(
              (_: any, idx: number) => idx !== existingIdx,
            ),
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
      if (error.message && error.message.includes("401")) {
        setSearchError(
          "Sesi Anda telah berakhir. Mengarahkan ke halaman login...",
        );
        Cookies.remove("auth_token");
        router.push("/login");
      } else {
        setSearchError(
          error.message || "Terjadi kesalahan saat melakukan pencarian.",
        );
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
        localStorage.setItem("search_history", JSON.stringify(currentHistory));
      }
    } catch (sumErr: any) {
      const userFriendlyMessage = cleanErrorMessage(sumErr.message);
      setSummaryData({
        url: article.url,
        summary: `Tidak dapat membuat ringkasan: ${userFriendlyMessage}`,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (summaryData?.summary) {
      const textToCopy = formatSummaryMarkdown(summaryData.summary, currentArticle, true);
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
      const contentString = formatSummaryMarkdown(summaryData.summary, currentArticle, false);
      const noteTitle = currentArticle?.title ? `Ringkasan: ${currentArticle.title}` : `Ringkasan: ${query}`;
      const res = await addNote(noteTitle, contentString);
      if (!res?.error) {
        alert("Ringkasan berhasil disimpan ke catatan!");
      } else {
        alert("Gagal menyimpan ke catatan.");
      }
    } catch (err) {
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
      <div
        className={cn(
          "flex-1 overflow-x-hidden px-4 md:px-8 relative flex flex-col",
          hasSearched ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
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
                Masukan kata kunci pembelajaran yang ingin dicari dan AI akan
                membantu mengklasifikasikan hasil berdasarkan jenjang dan mata
                pelajarannya.
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
              className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 lg:h-full gap-6 pt-4 lg:pt-8 pb-36 lg:pb-32 min-h-0"
            >
              {/* Left Column: Related Articles */}
              <div className="col-span-1 lg:col-span-4 flex flex-col lg:h-full lg:min-h-0 relative">
                <div className="flex items-center justify-between pb-3 bg-transparent z-10 shrink-0">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Materi terkait
                  </h3>
                </div>

                <div
                  ref={leftScrollRef}
                  onScroll={handleLeftScroll}
                  className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 pb-8 lg:pb-4 no-scrollbar"
                >
                  {searchError ? (
                    <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl p-5 text-red-600 text-sm shadow-sm flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-1">
                          Pencarian Gagal
                        </span>
                        {searchError}
                      </div>
                    </div>
                  ) : isSearching ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-40 bg-white border border-slate-100 shadow-sm animate-pulse rounded-xl"
                        />
                      ))}
                    </>
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
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  // save artikel
                                  await saveArticle(article.id);
                                  alert(
                                    "Artikel berhasil disimpan ke library!",
                                  );
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                } catch (error: any) {
                                  alert(
                                    error.message || "Gagal menyimpan artikel.",
                                  );
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
                {/* Scroll Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50 rounded-full overflow-hidden shrink-0 z-20">
                  <div
                    className="h-full bg-[#0f766e] transition-all duration-75"
                    style={{ width: `${leftProgress}%` }}
                  />
                </div>
              </div>

              {/* Right Column: AI Summary */}
              <div className="col-span-1 lg:col-span-8 flex flex-col lg:h-full lg:min-h-0 mb-6 lg:mb-0">
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-6 lg:p-8 min-h-[350px] lg:min-h-0 lg:h-full flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#e6f2f1] rounded-full flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f766e]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-tight">
                          Ringkasan Materi
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                          Hasil ringkasan materi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={handleCopySummary}
                        className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Salin"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">
                          Salin
                        </span>
                      </button>
                      <button
                        onClick={handleSaveToNotes}
                        disabled={isSavingNote || !summaryData?.summary}
                        className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#0f766e] text-white hover:bg-[#0d645d] rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs sm:text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSavingNote ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        <span className="hidden sm:inline">
                          Simpan ke Catatan
                        </span>
                        <span className="sm:hidden">Simpan</span>
                      </button>
                    </div>
                  </div>

                  <div
                    ref={rightScrollRef}
                    onScroll={handleRightScroll}
                    className="flex-1 overflow-y-auto pr-1 no-scrollbar prose prose-slate max-w-none font-sans text-slate-700"
                  >
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
                        className="space-y-6"
                      >
                        {(() => {
                          const summaryObj = typeof summaryData.summary === "object" ? summaryData.summary : {};
                           const title = cleanMarkdownSymbols(
                             (summaryObj as any).judul ||
                               (summaryObj as any).title ||
                               (summaryObj as any).identitas ||
                               currentArticle?.title
                           );
                          const author = cleanMarkdownSymbols(
                            (summaryObj as any).author ||
                              currentArticle?.authors?.join(", ")
                          );

                          if (!title && !author) return null;

                          return (
                            <div className="border-b border-slate-100 pb-4 mb-2">
                              {title && (
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-3">
                                  {title}
                                </h2>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                                {author && (
                                  <span className="font-medium bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100">
                                    Penulis: {author}
                                  </span>
                                )}
                                {currentArticle?.year && (
                                  <span className="font-medium bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100">
                                    Tahun: {currentArticle.year}
                                  </span>
                                )}
                                {currentArticle?.url && (
                                  <a
                                    href={currentArticle.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-medium bg-[#e6f2f1] text-[#0f766e] hover:bg-[#0f766e] hover:text-white px-3 py-1 rounded-full border border-[#0f766e]/10 transition-all duration-200"
                                  >
                                    <span>Buka Dokumen</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatSummaryMarkdown(summaryData.summary)}
                        </ReactMarkdown>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 pt-20 pb-10">
                        <Bot className="w-12 h-12 mb-4 opacity-30" />
                        <p>
                          Silakan pilih salah satu materi di sebelah kiri
                          <br />
                          untuk melihat ringkasan.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Scroll Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50 rounded-full overflow-hidden shrink-0 z-20">
                    <div
                      className="h-full bg-[#0f766e] transition-all duration-75"
                      style={{ width: `${rightProgress}%` }}
                    />
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
