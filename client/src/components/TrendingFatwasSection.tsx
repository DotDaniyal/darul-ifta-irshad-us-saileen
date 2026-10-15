import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, CheckCircle2, Copy, Download, FileText, MessageCircle, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { FATAWA, type Fatwa } from "@/data/fatawa";
import { useLanguage } from "./SiteShell";

type TabId = "latest" | "popular" | "transactions" | "family";

export function TrendingFatwasSection() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [activeTab, setActiveTab] = useState<TabId>("latest");
  const [selectedFatwa, setSelectedFatwa] = useState<Fatwa | null>(null);

  const displayedFatwas = useMemo(() => {
    switch (activeTab) {
      case "transactions":
        return FATAWA.filter((f) => f.category === "Transactions" || f.category === "Inheritance & Wills").slice(0, 6);
      case "family":
        return FATAWA.filter((f) => f.category === "Marriage & Divorce").slice(0, 6);
      case "popular":
        return FATAWA.slice(10, 16);
      case "latest":
      default:
        return FATAWA.slice(0, 6);
    }
  }, [activeTab]);

  const copyFatwaLink = async (fatwa: Fatwa) => {
    const url = `${window.location.origin}/fatawa/${fatwa.slug}`;
    if (!navigator.clipboard?.writeText) {
      toast.error(urdu ? "لنک کاپی نہیں ہو سکا" : "Unable to copy link");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(urdu ? "فتویٰ کا لنک کاپی کر لیا گیا" : "Fatwa link copied to clipboard");
    } catch {
      toast.error(urdu ? "لنک کاپی نہیں ہو سکا" : "Unable to copy link");
    }
  };

  const shareToWhatsapp = (fatwa: Fatwa) => {
    const url = `${window.location.origin}/fatawa/${fatwa.slug}`;
    const text = `${urdu ? fatwa.titleUr : fatwa.titleEn}\n${urdu ? "دارالافتاء ارشاد السائلین کراچی کا شرعی فتویٰ:" : "Islamic Fatwa from Darul Ifta Irshad-us-Saileen:"}\n${url}`;
    const a = document.createElement("a");
    a.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#061830] px-5 py-20 sm:px-8 lg:py-28" id="trending-fatawa">
      <div className="mx-auto max-w-[1360px]">
        {/* Header and Filter Tabs */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#075A9B] dark:text-[#D1AC5B]">
              <span className="h-px w-8 bg-[#075A9B] dark:bg-[#D1AC5B]" />
              <span>{urdu ? "تحقیقی و معتبر فتاویٰ" : "Verified Fatawa"}</span>
            </div>
            <h2 className={`mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-[#10223A] dark:text-white ${
              urdu ? "font-urdu text-4xl sm:text-5xl leading-tight" : ""
            }`}>
              {urdu ? "تازہ ترین اور اہم سوالات و جوابات" : "Recent & Trending Jurisprudence"}
            </h2>
          </div>

          {/* Interactive Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#D5CDC0] dark:border-white/10 bg-[#FAF7F0] dark:bg-white/5 p-1 text-xs">
            {[
              { id: "latest", ur: "تازہ ترین فتاویٰ", en: "Latest Fatwas" },
              { id: "popular", ur: "مقبول ترین مسائل", en: "Most Viewed" },
              { id: "transactions", ur: "معاملات و مالیات", en: "Finance & Trade" },
              { id: "family", ur: "نکاح و خاندانی امور", en: "Family & Nikah" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`rounded-md px-3.5 py-2 font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#075A9B] text-white shadow-sm dark:bg-[#D1AC5B] dark:text-[#061830]"
                    : "text-[#546578] dark:text-white/70 hover:text-[#10223A] dark:hover:text-white"
                }`}
              >
                {urdu ? tab.ur : tab.en}
              </button>
            ))}
          </div>
        </div>

        {/* Fatwa Cards Grid */}
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {displayedFatwas.map((fatwa) => (
            <motion.article
              key={fatwa.slug}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="group flex flex-col justify-between rounded-xl border border-[#D7CEC0] dark:border-white/10 bg-[#FCFAF6] dark:bg-[#071F3D] p-6 shadow-[0_6px_20px_rgba(4,18,38,0.05)] transition hover:-translate-y-1 hover:border-[#075A9B]/40 hover:shadow-[0_16px_36px_rgba(4,18,38,0.12)]"
            >
              <div>
                {/* Clean unboxed metadata with typographic separators (anti-pill compliant) */}
                <div className="flex items-center justify-between text-xs text-[#6B7E92] dark:text-white/60">
                  <div className="flex items-center gap-1.5 font-mono font-semibold">
                    <span className="text-[#075A9B] dark:text-[#F3D794]">#{fatwa.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{fatwa.category}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#1E7246] dark:text-[#78C99B]">
                    <CheckCircle2 className="h-3 w-3" />
                    {urdu ? "مستند فتویٰ" : "Verified"}
                  </span>
                </div>

                <h3 className={`mt-4 text-xl font-bold text-[#10223A] dark:text-white transition group-hover:text-[#075A9B] dark:group-hover:text-[#F3D794] ${
                  urdu ? "font-urdu text-2xl leading-[1.65]" : "font-display text-xl"
                }`}>
                  {fatwa.titleUr}
                </h3>

                <p className={`mt-3 line-clamp-3 text-sm leading-relaxed text-[#57697D] dark:text-white/70 ${
                  urdu ? "font-urdu text-base leading-8" : "font-sans"
                }`}>
                  {urdu ? fatwa.questionUr : fatwa.questionEn}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-[#EDE5D8] dark:border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedFatwa(fatwa)}
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wider text-[#075A9B] dark:text-[#F3D794] hover:text-[#C89C46]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{urdu ? "مکمل فتویٰ پڑھیں" : "Read Full Fatwa"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shareToWhatsapp(fatwa)}
                    title={urdu ? "واٹس ایپ پر شیئر کریں" : "Share on WhatsApp"}
                    className="rounded p-1.5 text-[#6B7E92] dark:text-white/60 hover:text-[#25D366] transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyFatwaLink(fatwa)}
                    title={urdu ? "لنک کاپی کریں" : "Copy Link"}
                    className="rounded p-1.5 text-[#6B7E92] dark:text-white/60 hover:text-[#075A9B] dark:hover:text-[#D1AC5B] transition"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {fatwa.pdfUrl && (
                    <a
                      href={fatwa.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={urdu ? "پی ڈی ایف ڈاؤن لوڈ" : "Download PDF"}
                      className="rounded p-1.5 text-[#6B7E92] dark:text-white/60 hover:text-[#C89C46] transition"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Full Fatwa Modal Drawer */}
      <AnimatePresence>
        {selectedFatwa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFatwa(null)}
              className="fixed inset-0 bg-[#040D1C]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#D1AC5B]/40 bg-[#FCFAF5] dark:bg-[#071E3A] p-6 sm:p-9 shadow-2xl text-[#10223A] dark:text-white"
              dir={urdu ? "rtl" : "ltr"}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between border-b border-[#E5DDD0] dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#075A9B] dark:text-[#D1AC5B]">
                    <span>#{selectedFatwa.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedFatwa.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedFatwa.scholar}</span>
                  </div>
                  <h2 className={`mt-2 text-2xl sm:text-3xl font-bold ${
                    urdu ? "font-urdu leading-relaxed" : "font-display"
                  }`}>
                    {selectedFatwa.titleUr}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFatwa(null)}
                  className="rounded-full border border-black/10 dark:border-white/10 p-2 text-[#76879A] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Fatwa Content Body */}
              <div className="mt-6 space-y-6">
                {/* Question Section */}
                <div className="rounded-lg border border-[#E8DFD0] dark:border-white/10 bg-[#F4EFE6]/70 dark:bg-white/[0.03] p-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#075A9B] dark:text-[#D1AC5B]">
                    <FileText className="h-4 w-4" />
                    <span>{urdu ? "استفتاء / سوال" : "Inquiry / Question"}</span>
                  </h4>
                  <p className={`mt-3 text-base leading-relaxed text-[#23354B] dark:text-white/90 ${
                    urdu ? "font-urdu text-lg leading-9" : ""
                  }`}>
                    {urdu ? selectedFatwa.questionUr : selectedFatwa.questionEn}
                  </p>
                </div>

                {/* Answer Section */}
                <div className="rounded-lg border border-[#D1AC5B]/35 bg-white dark:bg-[#061830] p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#EADFCF] dark:border-white/10 pb-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10223A] dark:text-[#D1AC5B]">
                      <CheckCircle2 className="h-4 w-4 text-[#1E7246]" />
                      <span>{urdu ? "الجواب وباللہ التوفیق" : "The Legal Ruling (Al-Jawab)"}</span>
                    </h4>
                    <span className="font-urdu text-sm font-semibold text-[#8B6B23] dark:text-[#E4C77F]">
                      حامداً و مصلیاً و مسلماً
                    </span>
                  </div>
                  <p className={`mt-4 text-base leading-relaxed text-[#10223A] dark:text-white/90 ${
                    urdu ? "font-urdu text-lg leading-9" : ""
                  }`}>
                    {urdu ? selectedFatwa.answerUr : selectedFatwa.answerEn}
                  </p>

                  {/* Scholarly References */}
                  <div className="mt-6 border-t border-[#E8DFD0] dark:border-white/10 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#738497] dark:text-white/50">
                      {urdu ? "شرعی و فقہی مآخذ و حوالہ جات" : "Scholarly References & Fiqh Citations"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#4B5E72] dark:text-white/80">
                      {selectedFatwa.reference || "القرآن الکریم، کتبِ فقہ حنفی و فتاویٰ دارالعلوم کراچی"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5DDD0] dark:border-white/10 pt-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shareToWhatsapp(selectedFatwa)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-sans text-xs font-bold text-white transition hover:bg-[#1EBE5D]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{urdu ? "واٹس ایپ پر شیئر" : "Share on WhatsApp"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyFatwaLink(selectedFatwa)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D8CEBE] dark:border-white/20 bg-white/70 dark:bg-white/5 px-4 py-2 font-sans text-xs font-semibold text-[#10223A] dark:text-white transition hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{urdu ? "لنک کاپی کریں" : "Copy Link"}</span>
                  </button>
                </div>

                {selectedFatwa.pdfUrl && (
                  <a
                    href={selectedFatwa.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D1AC5B] px-5 py-2 font-sans text-xs font-bold uppercase tracking-wider text-[#06152E] shadow-md transition hover:bg-[#E4C77F]"
                  >
                    <Download className="h-4 w-4" />
                    <span>{urdu ? "اصل پی ڈی ایف فتویٰ" : "Download Official PDF"}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
