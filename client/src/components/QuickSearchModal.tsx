import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, FileText, Search, Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";
import { FATAWA, type Fatwa } from "@/data/fatawa";
import { useLanguage } from "./SiteShell";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_QUERIES = [
  { ur: "زکوٰۃ کا نصاب", en: "Zakat calculation & threshold" },
  { ur: "کرپٹو کرنسی اور ڈیجیٹل ٹریڈنگ", en: "Cryptocurrency & Online Trading" },
  { ur: "حالتِ غصہ میں طلاق", en: "Divorce in state of anger" },
  { ur: "بینک منافع اور سود", en: "Bank profit & interest rulings" },
  { ur: "وضو اور طہارت کے مسائل", en: "Ablution & Purification" },
  { ur: "ملازمت میں رشوت اور تحائف", en: "Gifts & bribery in employment" },
];

export function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredResults = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean && selectedCategory === "all") return FATAWA.slice(0, 6);

    return FATAWA.filter((f) => {
      const matchCat = selectedCategory === "all" || f.category === selectedCategory;
      if (!matchCat) return false;
      if (!clean) return true;

      const titleMatchUr = f.titleUr?.toLowerCase().includes(clean);
      const titleMatchEn = f.titleEn?.toLowerCase().includes(clean);
      const numMatch = f.number?.toLowerCase().includes(clean);
      const topicMatch = f.topics?.some((t) => t.toLowerCase().includes(clean));

      return titleMatchUr || titleMatchEn || numMatch || topicMatch;
    }).slice(0, 10);
  }, [query, selectedCategory]);

  const handleSelect = (fatwa: Fatwa) => {
    onClose();
    setLocation(`/fatawa/${fatwa.slug}`);
  };

  const handleSearchAll = () => {
    onClose();
    setLocation(query.trim() ? `/fatawa?q=${encodeURIComponent(query.trim())}` : "/fatawa");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#040C1A]/75 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#D1AC5B]/35 bg-[#FAF8F2] shadow-[0_25px_70px_rgba(4,12,26,0.45)] dark:bg-[#081B34] dark:border-[#D1AC5B]/25 text-[#10223A] dark:text-[#E8F0F8]"
            dir={urdu ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-label={urdu ? "فوری تلاش" : "Quick Search"}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b border-[#E5DECF] dark:border-white/10 px-4 py-3.5 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-[#075A9B] dark:text-[#D1AC5B]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={urdu ? "فتویٰ کا عنوان، نمبر یا موضوع تلاش کریں..." : "Search fatwas by topic, title, or ID..."}
                autoFocus
                className="w-full bg-transparent font-sans text-base outline-none placeholder:text-[#8E9EAF] dark:placeholder:text-white/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded p-1 text-[#8E9EAF] hover:text-[#10223A] dark:hover:text-white"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[#D5CDBC] dark:border-white/20 bg-white/60 dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono font-medium text-[#7A8B9C] dark:text-white/60">
                ESC
              </kbd>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5DECF] dark:border-white/10 bg-[#F2ECE1]/60 dark:bg-white/[0.02] px-4 py-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-[#075A9B] text-white shadow-sm"
                    : "text-[#5B6D82] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {urdu ? "تمام فتاویٰ" : "All Categories"}
              </button>
              {["Worship", "Transactions", "Marriage & Divorce", "Inheritance & Wills", "Belief & Conduct"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded px-2.5 py-1 font-medium transition ${
                    selectedCategory === cat
                      ? "bg-[#075A9B] text-white shadow-sm"
                      : "text-[#5B6D82] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {cat === "Worship" && (urdu ? "عبادات" : "Worship")}
                  {cat === "Transactions" && (urdu ? "معاملات" : "Transactions")}
                  {cat === "Marriage & Divorce" && (urdu ? "نکاح و طلاق" : "Family & Nikah")}
                  {cat === "Inheritance & Wills" && (urdu ? "وراثت" : "Inheritance")}
                  {cat === "Belief & Conduct" && (urdu ? "عقائد" : "Belief & Ethics")}
                </button>
              ))}
            </div>

            {/* Results or Suggested Queries */}
            <div className="max-h-[380px] overflow-y-auto p-3 sm:p-4">
              {filteredResults.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#8A9BAE] dark:text-white/45">
                    {query ? (urdu ? "تلاش کے نتائج" : "Search Results") : urdu ? "نمایاں فتاویٰ" : "Featured Fatwas"}
                  </p>
                  {filteredResults.map((fatwa) => (
                    <button
                      key={fatwa.slug}
                      type="button"
                      onClick={() => handleSelect(fatwa)}
                      className="group flex w-full items-start justify-between gap-3 rounded-lg p-2.5 text-left transition hover:bg-[#EAE2D2] dark:hover:bg-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#075A9B]/10 text-[#075A9B] dark:bg-[#D1AC5B]/15 dark:text-[#F3D794]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-urdu text-base font-semibold leading-relaxed text-[#10223A] dark:text-white group-hover:text-[#075A9B] dark:group-hover:text-[#F3D794]">
                            {fatwa.titleUr}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6B7C8E] dark:text-white/60">
                            <span>#{fatwa.number}</span>
                            <span aria-hidden="true">·</span>
                            <span>{fatwa.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{fatwa.scholar}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[#8E9EAF] opacity-0 transition group-hover:opacity-100 group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[#738496] dark:text-white/60">
                  <p>{urdu ? "کوئی فتویٰ دستیاب نہیں ملا۔" : "No matching fatwas found."}</p>
                </div>
              )}

              {/* Popular Query Chips */}
              {!query && (
                <div className="mt-4 border-t border-[#E5DECF] dark:border-white/10 pt-3">
                  <p className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#8A9BAE] dark:text-white/45">
                    <Sparkles className="h-3 w-3 text-[#D1AC5B]" />
                    {urdu ? "زیادہ تلاش کیے جانے والے سوالات" : "Popular Searches"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                    {POPULAR_QUERIES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuery(urdu ? item.ur : item.en)}
                        className="rounded-full border border-[#D8D0BF] dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-1 text-xs text-[#44566A] dark:text-white/80 transition hover:border-[#075A9B] hover:text-[#075A9B] dark:hover:text-[#D1AC5B]"
                      >
                        {urdu ? item.ur : item.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#E5DECF] dark:border-white/10 bg-[#F2ECE1]/80 dark:bg-white/[0.03] px-4 py-2.5 text-xs text-[#6B7C8E] dark:text-white/60">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#075A9B] dark:text-[#D1AC5B]" />
                {urdu ? "10,000+ مستند فتاویٰ آرکائیو میں موجود" : "10,000+ verified fatwas indexed"}
              </span>
              <button
                type="button"
                onClick={handleSearchAll}
                className="font-semibold text-[#075A9B] dark:text-[#F3D794] hover:underline"
              >
                {urdu ? "تمام فتاویٰ آرکائیو میں دیکھیں ←" : "Explore full archive →"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
