import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, Download, Eye, ExternalLink, Sparkles, X, ChevronRight } from "lucide-react";
import { useLanguage } from "./SiteShell";

interface VolumeInfo {
  volume: number;
  titleUr: string;
  titleEn: string;
  pages: number;
  chapters: string[];
  pdfUrl: string;
}

const VOLUMES: VolumeInfo[] = [
  {
    volume: 1,
    titleUr: "ارشاد السائلین · جلد اول",
    titleEn: "Irshad us Saileen · Volume 1",
    pages: 640,
    chapters: [
      "کتاب الإیمان والعقائد (ایمانیات و توحید)",
      "کتاب الطہارۃ (وضو، غسل و پاکی کے احکام)",
      "کتاب الصلاۃ (نماز، جماعت و امامت)",
      "کتاب الزکاۃ والصدقات (زکوٰۃ و عشر)",
      "کتاب الصوم والاعتکاف (روزہ و اعتکاف)",
      "کتاب الحج والعمرۃ (مناسکِ حج)",
    ],
    pdfUrl: "/manus-storage/sanitized-fatwa-a0001-1_93401ca8.pdf",
  },
  {
    volume: 2,
    titleUr: "ارشاد السائلین · جلد دوم",
    titleEn: "Irshad us Saileen · Volume 2",
    pages: 720,
    chapters: [
      "کتاب النکاح والطلاق (نکاح، مہر و طلاق)",
      "کتاب البیوع والمعاملات (تجارت و بیع)",
      "کتاب الشرکۃ والمضاربۃ (شراکت و انویسٹمنٹ)",
      "کتاب الفرائض والمواریث (ترکہ و وصیت)",
      "کتاب الحظر والإباحۃ (حلال و حرام)",
      "جدید فقہی اور عصری مسائل کا حل",
    ],
    pdfUrl: "/manus-storage/sanitized-fatwa-a0002-2_9deaa4c0.pdf",
  },
];

export function LibraryBookShowcase() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [activeVolumeIdx, setActiveVolumeIdx] = useState(0);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);

  const activeVol = VOLUMES[activeVolumeIdx];

  // 3D Tilt for Book Cover
  const bookRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((y - centerY) / centerY) * -12);
    setRotateY(((x - centerX) / centerX) * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section className="relative overflow-hidden bg-[#071D3A] text-white px-5 py-20 sm:px-8 lg:py-28" id="library-showcase">
      {/* Background Islamic Geometry Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url('/manus-storage/darul-ifta-geometric-pattern_a1249f4a.jpg')",
          backgroundSize: "360px",
        }}
      />

      <div className="relative mx-auto max-w-[1360px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D1AC5B]">
              <span className="h-px w-8 bg-[#D1AC5B]" />
              <span>{urdu ? "دارالکتب و علمی ذخیرہ" : "Scholarly Library"}</span>
            </div>
            <h2 className={`mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold ${
              urdu ? "font-urdu leading-tight text-[#FFF8DE]" : "font-display text-white"
            }`}>
              {urdu ? "مجموعہ فتاویٰ ارشاد السائلین (دو جلدیں)" : "The Authoritative Fatwa Compendium: Irshad us Saileen"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              {urdu
                ? "حضرت مولانا مفتی محمد سلمان منصورپوری دامت برکاتہم کا مایہ ناز اور جامع فقہی انسائیکلوپیڈیا۔"
                : "The classical 2-volume compendium by Hazrat Maulana Mufti Muhammad Salman Mansoorpuri, systematically organized across all chapters of Islamic jurisprudence."}
            </p>
          </div>

          {/* Volume Switcher Tabs */}
          <div className="flex gap-2">
            {VOLUMES.map((vol, idx) => (
              <button
                key={vol.volume}
                type="button"
                onClick={() => setActiveVolumeIdx(idx)}
                className={`rounded-lg px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider transition ${
                  activeVolumeIdx === idx
                    ? "bg-[#D1AC5B] text-[#06152E] shadow-md"
                    : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {urdu ? `جلد ${vol.volume}` : `Volume ${vol.volume}`}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          {/* 3D Interactive Book Mockup */}
          <div className="flex justify-center">
            <div
              ref={bookRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                perspective: "1200px",
              }}
              className="group cursor-pointer"
            >
              <div
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.15s ease-out",
                }}
                className="relative h-[420px] w-[280px] sm:h-[460px] sm:w-[310px] rounded-r-xl rounded-l-sm bg-gradient-to-r from-[#031124] via-[#082245] to-[#0D3160] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-r-2 border-y-2 border-[#D1AC5B]/50"
              >
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#020A17] to-transparent border-r border-[#D1AC5B]/30" />

                {/* Gold Embossed Frame */}
                <div className="h-full w-full rounded-md border border-[#D1AC5B]/40 p-4 flex flex-col justify-between text-center">
                  <div className="space-y-1">
                    <p className="font-urdu text-xs text-[#E8D098]">
                      دارالافتاء ارشاد السائلین
                    </p>
                    <p className="font-arabic-display text-sm tracking-widest text-[#D1AC5B]">
                      مجموعہ فتاویٰ
                    </p>
                  </div>

                  <div>
                    <h3 className="font-urdu text-3xl font-bold leading-relaxed text-[#FFF6D4] drop-shadow-md">
                      ارشاد السائلین
                    </h3>
                    <p className="mt-1 font-sans text-xs uppercase tracking-widest text-[#D1AC5B]">
                      {urdu ? `جلد ${activeVol.volume}` : `Volume ${activeVol.volume}`}
                    </p>
                    <div className="mx-auto my-3 h-px w-20 bg-gradient-to-r from-transparent via-[#D1AC5B] to-transparent" />
                    <p className="font-urdu text-xs text-white/80">
                      تاليف: حضرت مولانا مفتی محمد سلمان منصورپوری
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#A5B7CC]">
                    <p>{activeVol.pages} {urdu ? "صفحات" : "Pages"}</p>
                    <p className="font-mono text-[10px] text-[#D1AC5B]/70">Edition: Karachi Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book Content Details */}
          <div className="space-y-6" dir={urdu ? "rtl" : "ltr"}>
            <div>
              <span className="font-mono text-xs font-bold text-[#D1AC5B]">
                {urdu ? `جلد ${activeVol.volume} کے مندرجات` : `Volume ${activeVol.volume} Contents & Chapters`}
              </span>
              <h3 className={`mt-2 text-2xl sm:text-3xl font-bold text-white ${
                urdu ? "font-urdu" : "font-display"
              }`}>
                {activeVol.titleUr}
              </h3>
            </div>

            {/* Chapter List */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {activeVol.chapters.map((chap, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white/90"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D1AC5B]/20 font-mono text-[10px] font-bold text-[#F3D794]">
                    {idx + 1}
                  </span>
                  <span className={urdu ? "font-urdu text-sm" : ""}>{chap}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsReadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#D1AC5B] px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-[#06152E] shadow-lg transition hover:bg-[#E4C77F]"
              >
                <Eye className="h-4 w-4" />
                <span>{urdu ? "آن لائن مطالعہ کریں" : "Read Online Preview"}</span>
              </button>

              <a
                href={activeVol.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                <span>{urdu ? "مکمل پی ڈی ایف ڈاؤن لوڈ" : "Download Volume PDF"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Online Reading Modal */}
      <AnimatePresence>
        {isReadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReadModalOpen(false)}
              className="fixed inset-0 bg-[#040C1A]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D1AC5B]/40 bg-[#08203E] p-6 sm:p-8 text-white shadow-2xl"
              dir={urdu ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-urdu text-2xl font-bold text-[#FFE29A]">
                    {activeVol.titleUr}
                  </h3>
                  <p className="text-xs text-white/60">
                    {urdu ? "فہرست ابواب و تحقیقی مقدمہ" : "Table of Contents & Scholarly Introduction"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReadModalOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4 text-sm text-white/85">
                <p className="font-urdu text-base leading-relaxed text-[#FFF8DE]">
                  {urdu
                    ? "مجموعہ فتاویٰ ارشاد السائلین میں روزمرہ فقہی، عباداتی اور عصری مسائل کو نہایت عام فہم، محقق اور مدلل انداز میں جمع کیا گیا ہے۔ ہر مسئلے میں قرآن کریم، احادیثِ نبویہ ﷺ اور معتبر فقہی کتب (شامی، ہدایہ، فتاویٰ ہندیہ) سے براہِ راست مآخذ و حوالہ جات فراہم کیے گئے ہیں۔"
                    : "Irshad us Saileen presents systematically codified responsa with rigorous citations from classic Hanafi authorities (Radd al-Muhtar, Al-Hidayah, Al-Fatawa al-Hindiyyah)."}
                </p>

                <div className="rounded-lg bg-black/25 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D1AC5B]">
                    {urdu ? "اہم خصوصیات" : "Key Features"}
                  </p>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    <li>✓ {urdu ? "مفتیانِ کرام کی تصدیق و مہر" : "Verified by authoritative muftis"}</li>
                    <li>✓ {urdu ? "عربی عبارتوں اور اصل مآخذ کا اندراج" : "Complete Arabic citations with volume & page numbers"}</li>
                    <li>✓ {urdu ? "جدید لین دین اور میڈیکل مسائل پر مدلل فیصلے" : "Contemporary financial & medical rulings"}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
                <a
                  href={activeVol.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D1AC5B] px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#06152E]"
                >
                  <Download className="h-4 w-4" />
                  <span>{urdu ? "پی ڈی ایف کھولیں" : "Open Full PDF Document"}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
