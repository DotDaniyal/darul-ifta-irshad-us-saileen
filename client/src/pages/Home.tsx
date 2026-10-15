/**
 * Royal Calligraphy House: Master modern redesign and animation overhaul
 * Blends authentic Islamic geometry, royal navy/deep emerald & warm gold,
 * with Framer Motion scroll animations, 3D tilt cards, interactive search,
 * and seamless bilingual support.
 */
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Copy,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Mail,
  MessageCircle,
  Phone,
  Radio,
  ScrollText,
  Search,
  Send,
  Shield,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { useInstitutionalDate } from "@/data/institutionalDateApi";
import { usePublishedScholars } from "@/data/scholarsApi";
import { dailyPostsApi, type DailyPost } from "@/data/dailyPostsApi";

// Core Redesign Components
import { CategoryTiltGrid } from "@/components/CategoryTiltGrid";
import { TrendingFatwasSection } from "@/components/TrendingFatwasSection";
import { AskMuftiStepper } from "@/components/AskMuftiStepper";
import { LibraryBookShowcase } from "@/components/LibraryBookShowcase";
import { PrayerTimesWidget } from "@/components/PrayerTimesWidget";

const heroImg = "/manus-storage/darul-ifta-hero-courtyard_6ff59e90.jpg";
const libraryImg = "/manus-storage/darul-ifta-library_bc806dd9.jpg";
const logoImg = "/manus-storage/darul-ifta-logo-transparent_c2993680.png";
const onlineBayanUrl = "https://faisal-hayat.mixlr.com/events/5246475?utm_source=new_broadcast_alert&utm_medium=email&utm_campaign=alert";
const whatsappChannelUrl = "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q";

const TYPING_QUERIES = [
  "سونے اور چاندی پر زکوٰۃ کا نصاب...",
  "کرپٹو کرنسی اور آن لائن ٹریڈنگ کا شرعی حکم...",
  "ملازمت میں دیے جانے والے تحائف اور رشوت...",
  "حالتِ غصہ میں طلاق اور رجوع کے مسائل...",
  "آن لائن کاروبار اور دراز پر ای کامرس کے اصول...",
];

const POPULAR_TAGS = [
  { ur: "نماز و طہارت", en: "Salah & Taharah", q: "نماز" },
  { ur: "زکوٰۃ و صدقات", en: "Zakat Rules", q: "زکوٰۃ" },
  { ur: "نکاح و طلاق", en: "Nikah & Talaq", q: "طلاق" },
  { ur: "اسلامی بینکاری", en: "Islamic Banking", q: "بینک" },
  { ur: "کرپٹو کرنسی", en: "Cryptocurrency", q: "کرپٹو" },
  { ur: "حلال و حرام", en: "Halal & Haram", q: "حلال" },
];

function IslamicDate() {
  const { language } = useLanguage();
  const { status, loading, failed } = useInstitutionalDate();
  const urdu = language === "ur";
  const date = status?.hijri[language];
  const gregorian = status?.gregorian[language];
  const sourceState = status?.verification.status;
  const maghribTime = status?.maghrib.time
    ? status.maghrib.time
        .split(":")
        .map((part) =>
          new Intl.NumberFormat("ur-PK-u-nu-arabext", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }).format(Number(part))
        )
        .join(":")
    : undefined;

  return (
    <div className="date-card" aria-live="polite">
      <div className="date-icon">
        <CalendarDays className="h-5 w-5" />
      </div>
      <div>
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#738197] dark:text-[#A0B0C4]">
          {urdu ? "کراچی کی اسلامی تاریخ" : "Karachi Islamic date"}
        </p>
        <p className={urdu ? "mt-1 font-urdu text-xl leading-9 text-[#10223A] dark:text-white" : "mt-1 font-display text-xl text-[#10223A] dark:text-white"}>
          {date || (urdu ? "تاریخ ہم آہنگ کی جا رہی ہے" : "Synchronizing date")}
        </p>
        <p className="mt-1 font-sans text-xs text-[#5E6D80] dark:text-white/60">
          {gregorian ? `${gregorian} · ${urdu ? "کراچی" : "Karachi"}` : urdu ? "کراچی · ایشیا/کراچی" : "Karachi · Asia/Karachi"}
        </p>
        <p className="mt-1 font-sans text-[10px] leading-4 text-[#738197] dark:text-white/50">
          {status
            ? urdu
              ? `مغرب کے بعد تبدیلی · ${maghribTime}`
              : `Changes at Maghrib · ${status.maghrib.time}`
            : loading
            ? urdu
              ? "سرور سے تصدیق ہو رہی ہے"
              : "Verifying with server"
            : urdu
            ? "دوبارہ تصدیق کی کوشش ہو رہی ہے"
            : "Retrying verification"}
        </p>
        {sourceState === "source_mismatch" && (
          <p className="mt-1 font-sans text-[10px] leading-4 text-[#9A5B18]">
            {urdu ? "تاریخ کا فرق درج کر لیا گیا ہے" : "Date discrepancy logged"}
          </p>
        )}
        {sourceState === "manual_override" && (
          <p className="mt-1 font-sans text-[10px] leading-4 text-[#1C4399]">
            {urdu ? "ادارتی تاریخ کا فیصلہ نافذ ہے" : "Official date decision applied"}
          </p>
        )}
        {failed && status && (
          <p className="mt-1 font-sans text-[10px] leading-4 text-[#9A5B18]">
            {urdu ? "آخری تصدیق شدہ تاریخ دکھائی جا رہی ہے" : "Showing the last verified date"}
          </p>
        )}
      </div>
    </div>
  );
}

function LatestDailyPosts() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [posts, setPosts] = useState<DailyPost[]>([]);

  useEffect(() => {
    let active = true;
    dailyPostsApi.list({ pageSize: 3 })
      .then((result) => {
        if (active) setPosts(result.items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!posts.length) return null;

  const local = (post: DailyPost, field: "title" | "excerpt") =>
    language === "ur"
      ? post[`${field}Ur`] || post[`${field}Ar`] || post[`${field}En`] || ""
      : post[`${field}En`] || post[`${field}Ur`] || post[`${field}Ar`] || "";

  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(value))
      : "";

  return (
    <section className="relative overflow-hidden bg-[#EAF0F5] dark:bg-[#051329] px-5 py-20 sm:px-8 lg:py-28" id="daily-posts">
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={urdu ? "روزانہ پوسٹس" : "DAILY POSTS"}
            title={urdu ? "تازہ اسلامی پیغامات" : "Latest Daily Posts"}
            description={
              urdu
                ? "روزانہ یاددہانی، اعلانات اور مفید اسلامی علم باوقار مطالعے کے لیے۔"
                : "The newest published reminders, announcements, and beneficial Islamic knowledge."
            }
          />
          <Link href="/daily-posts" className="text-link">
            {urdu ? "تمام روزانہ پوسٹس" : "View all Daily Posts"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex min-h-[280px] flex-col justify-between rounded-xl border border-[#D1DDE8] dark:border-white/10 bg-white dark:bg-[#071F3D] p-6 shadow-[0_10px_26px_rgba(29,43,66,.06)] transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider text-[#075A9B] dark:text-[#D1AC5B]">
                  <span>
                    {post.category
                      ? urdu
                        ? post.category.nameUr || post.category.nameAr || post.category.nameEn
                        : post.category.nameEn
                      : urdu
                      ? "عمومی"
                      : "General"}
                  </span>
                  <span className="font-mono text-xs text-[#75869A] dark:text-white/50">{date(post.publishedAt)}</span>
                </div>

                <h3 className={`mt-4 text-2xl font-bold text-[#10223A] dark:text-white ${
                  urdu ? "font-urdu leading-snug" : "font-display"
                }`}>
                  {local(post, "title")}
                </h3>

                <p className={`mt-3 line-clamp-3 text-sm leading-relaxed text-[#52627A] dark:text-white/70 ${
                  urdu ? "font-urdu text-base leading-8" : "font-sans"
                }`}>
                  {local(post, "excerpt")}
                </p>
              </div>

              <Link
                href={`/daily-posts/${post.slug}`}
                className="mt-6 inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#075A9B] dark:text-[#F3D794] transition hover:text-[#C89C46]"
              >
                <span>{urdu ? "مکمل مطالعہ فرمائیں" : "Read Full Post"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [, setLocation] = useLocation();
  const { scholars } = usePublishedScholars();

  const [heroSearch, setHeroSearch] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Animated typing placeholder cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % TYPING_QUERIES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      icon: BookOpenCheck,
      en: "Fatwa Service",
      ur: "فتویٰ سروس",
      descEn: "Guidance on religious questions in the light of the Qur’an, Sunnah, and recognised fiqh principles.",
      descUr: "شرعی مسائل میں قرآن و سنت اور معتبر فقہی اصولوں کی روشنی میں رہنمائی۔",
    },
    {
      icon: GraduationCap,
      en: "Islamic Education",
      ur: "اسلامی تعلیم",
      descEn: "Accessible learning that strengthens foundational Islamic understanding and informed practice.",
      descUr: "بنیادی اسلامی فہم اور باعمل زندگی کے لیے قابلِ رسائی دینی تعلیم۔",
    },
    {
      icon: ScrollText,
      en: "Publications",
      ur: "اشاعت و طباعت",
      descEn: "Articles, booklets, and scholarly resources prepared for useful everyday reference.",
      descUr: "مضامین، رسائل اور علمی مواد جو روزمرہ رہنمائی کے لیے مرتب کیا جاتا ہے۔",
    },
    {
      icon: UsersRound,
      en: "Scholarly Consultation",
      ur: "علمی مشاورت",
      descEn: "A clear route to seek responsible consultation from recognised scholars.",
      descUr: "مستند علماء سے ذمہ دار علمی مشاورت کے لیے واضح رابطہ۔",
    },
  ];

  const copyValue = async (value: string, label: string) => {
    if (!navigator.clipboard?.writeText) {
      toast.error(urdu ? `${label} نقل نہیں ہو سکا` : `Unable to copy ${label}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(urdu ? `${label} نقل کر لیا گیا ہے` : `${label} copied`);
    } catch {
      toast.error(urdu ? `${label} نقل نہیں ہو سکا` : `Unable to copy ${label}`);
    }
  };

  const submitHeroSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = heroSearch.trim();
    setLocation(query ? `/fatawa?q=${encodeURIComponent(query)}` : "/fatawa");
  };

  const submitArchiveSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = archiveSearch.trim();
    setLocation(query ? `/fatawa?q=${encodeURIComponent(query)}` : "/fatawa");
  };

  return (
    <SiteShell>
      <main>
        {/* ================================================================= */}
        {/* HERO SECTION: High-impact, animated, interactive search & badges   */}
        {/* ================================================================= */}
        <section className="relative isolate min-h-[740px] overflow-hidden bg-[#061A34]" id="home">
          {/* Background courtyards & subtle geometric overlay */}
          <img
            src={heroImg}
            alt="A quiet Islamic courtyard architectural scene"
            className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] animate-pulse"
            style={{
              backgroundImage: "url('/manus-storage/darul-ifta-geometric-pattern_a1249f4a.jpg')",
              backgroundSize: "320px",
            }}
          />
          <div className="hero-watermark">
            <img src={logoImg} alt="" />
          </div>

          <div className="relative mx-auto grid min-h-[740px] max-w-[1360px] items-center px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="hero-copy max-w-3xl"
            >
              {/* Kicker badge */}
              <div className="hero-kicker">
                <span className="h-px w-8 bg-[#D1AC5B]" />
                <span>{urdu ? "کراچی، پاکستان" : "KARACHI, PAKISTAN"}</span>
              </div>

              {/* Bismillah & Title Stack */}
              <div className="hero-text-stack">
                <p className="hero-bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                <p className="hero-urdu-identity">دارالافتاء ارشاد السائلین کراچی</p>
                <h1 className="hero-english-identity font-display text-white">
                  Authentic Islamic Guidance<br />
                  <span>for Modern Challenges</span>
                </h1>
                <p className="font-urdu text-xl text-[#F2DFB4] mt-1">
                  شرعی مسائل کا مستند اور بااعتماد حل
                </p>
              </div>

              <p className={urdu ? "hero-support-copy font-urdu text-xl leading-loose text-white/88" : "hero-support-copy font-sans text-base leading-8 text-white/84"}>
                {urdu
                  ? "قرآن و سنت کی روشنی میں شرعی رہنمائی اور اسلامی تعلیمات کی خدمت — تحقیق، احتیاط اور ذمہ داری کے ساتھ۔"
                  : "Providing authentic Islamic guidance based on the Qur’an and Sunnah — with care, clarity, and scholarly responsibility."}
              </p>

              {/* Interactive Smart Search Bar in Hero */}
              <form onSubmit={submitHeroSearch} className="mt-8 relative max-w-xl">
                <div className="flex items-center rounded-xl border border-[#D1AC5B]/50 bg-white/10 backdrop-blur-md p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition focus-within:border-[#D1AC5B] focus-within:bg-white/15">
                  <Search className="h-5 w-5 mx-3 text-[#D1AC5B] shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder={TYPING_QUERIES[placeholderIndex]}
                    className="w-full bg-transparent font-sans text-sm text-white outline-none placeholder:text-white/50"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D1AC5B] px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#06152E] transition hover:bg-[#F1DC9B]"
                  >
                    <span>{urdu ? "تلاش" : "Search"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Popular Tags under search */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="font-semibold text-[#D1AC5B]">{urdu ? "مقبول:" : "Popular:"}</span>
                  {POPULAR_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLocation(`/fatawa?q=${encodeURIComponent(tag.q)}`)}
                      className="rounded border border-white/20 bg-white/5 px-2.5 py-0.5 text-xs text-white/80 transition hover:border-[#D1AC5B] hover:text-[#D1AC5B]"
                    >
                      {urdu ? tag.ur : tag.en}
                    </button>
                  ))}
                </div>
              </form>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6 max-w-lg">
                <div>
                  <p className="font-mono text-2xl font-bold text-[#F3D794]">10,000+</p>
                  <p className="text-xs text-white/75">{urdu ? "مستند فتاویٰ شائع شدہ" : "Fatwas Published"}</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-[#F3D794]">100%</p>
                  <p className="text-xs text-white/75">{urdu ? "مصدقہ مفتیانِ کرام" : "Verified Muftis"}</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-[#F3D794]">48-72h</p>
                  <p className="text-xs text-white/75">{urdu ? "تخمینی جواب کا وقت" : "Standard Response"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/ask-fatwa" className="hero-primary">
                  <BookOpenCheck className="h-4 w-4" />
                  {urdu ? "فتویٰ دریافت کریں" : "Ask for a Fatwa"}
                </Link>
                <a href="#contact" className="hero-secondary">
                  <MessageCircle className="h-4 w-4" />
                  {urdu ? "رابطہ کریں" : "Contact us"}
                </a>
                <a
                  href={onlineBayanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-bayan"
                >
                  <Radio className="hero-bayan-icon h-4 w-4" />
                  {urdu ? "آن لائن بیان" : "Online Bayan"}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Date Card & Live Prayer Times Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-14 space-y-5 justify-self-end w-full max-w-md lg:mt-0"
            >
              <IslamicDate />
              <PrayerTimesWidget compact={false} />
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FAF7F0] dark:from-[#041226] to-transparent" />
        </section>

        {/* ================================================================= */}
        {/* 3D TILT CATEGORIES SECTION                                        */}
        {/* ================================================================= */}
        <CategoryTiltGrid />

        {/* ================================================================= */}
        {/* RECENT & TRENDING FATWAS WITH TABS & MODAL DRAWER                 */}
        {/* ================================================================= */}
        <TrendingFatwasSection />

        {/* ================================================================= */}
        {/* INTERACTIVE "ASK A MUFTI" STEPPER & TRACKING                     */}
        {/* ================================================================= */}
        <AskMuftiStepper />

        {/* ================================================================= */}
        {/* ISLAMIC BOOKS & "IRSHAD US SAILEEN" DIGITAL LIBRARY               */}
        {/* ================================================================= */}
        <LibraryBookShowcase />

        {/* ================================================================= */}
        {/* ABOUT US / INSTITUTIONAL PROFILE                                  */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden bg-[#FBF9F3] dark:bg-[#061830] px-5 py-20 sm:px-8 lg:py-28" id="about">
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: "url('/manus-storage/darul-ifta-geometric-pattern_a1249f4a.jpg')",
              backgroundSize: "390px",
            }}
          />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div className="relative">
              <div className="arch-frame">
                <img
                  src={libraryImg}
                  alt="Islamic scholarly library interior"
                  className="h-[410px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-3 max-w-[220px] border-l-4 border-[#C89C46] bg-[#08284C] p-5 text-white shadow-xl sm:-right-7">
                <p className="font-urdu text-xl leading-9">شرعی رہنمائی، اعتماد کے ساتھ</p>
                <p className="mt-2 font-sans text-[10px] leading-5 text-white/65">
                  Guidance rooted in scholarly care.
                </p>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow={urdu ? "تعارف" : "INTRODUCTION"}
                title={urdu ? "علم، ذمہ داری اور خدمت" : "Knowledge, care, and service"}
                description={
                  urdu
                    ? "ہماری خدمات قرآن و سنت کی روشنی میں عوام کی رہنمائی، شرعی مسائل کے ذمہ دارانہ حل، اور اسلامی تعلیمات کے فروغ پر مشتمل ہیں۔"
                    : "We provide Islamic guidance in the light of the Qur’an and Sunnah, offer a route for fatwa requests, and support Islamic education and awareness."
                }
              />
              <div className="mt-8 grid gap-5 border-t border-[#D8D0C3] dark:border-white/10 pt-7 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-[#D5CDC0]/60 dark:border-white/10 bg-white/70 dark:bg-white/5">
                  <p className="font-display text-3xl text-[#075A9B] dark:text-[#D1AC5B]">01</p>
                  <p className="mt-2 font-sans text-sm leading-6 text-[#52627A] dark:text-white/80">
                    {urdu ? "سوچ سمجھ کر قابلِ فہم رہنمائی" : "Considered guidance presented clearly."}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#D5CDC0]/60 dark:border-white/10 bg-white/70 dark:bg-white/5">
                  <p className="font-display text-3xl text-[#075A9B] dark:text-[#D1AC5B]">02</p>
                  <p className="mt-2 font-sans text-sm leading-6 text-[#52627A] dark:text-white/80">
                    {urdu ? "افراد کے معاملات میں علمی احتیاط" : "Careful scholarly review for individual matters."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SERVICES SECTION                                                  */}
        {/* ================================================================= */}
        <section className="relative bg-[#EAF0F5] dark:bg-[#041226] px-5 py-20 sm:px-8 lg:py-26" id="services">
          <div className="mx-auto max-w-[1360px]">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow={urdu ? "ہماری خدمات" : "OUR SERVICES"}
                title={urdu ? "جامع علمی خدمت" : "Practical pathways to guidance"}
                description={
                  urdu
                    ? "ہر خدمت کا مقصد سوال کرنے والے تک معیاری، قابلِ فہم اور ذمہ دارانہ مدد پہنچانا ہے۔"
                    : "Each service is designed to make trusted guidance easier to seek, understand, and use responsibly."
                }
              />
              <Link href="/ask-fatwa" className="text-link">
                {urdu ? "اپنا سوال جمع کریں" : "Submit your question"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div className="service-card dark:bg-[#071F3D]" key={service.en}>
                    <span className="font-display text-[46px] leading-none text-[#C5D3E1] dark:text-white/20">
                      0{index + 1}
                    </span>
                    <div className="mt-8 flex h-11 w-11 items-center justify-center border border-[#B6C6D5] dark:border-white/20 text-[#075A9B] dark:text-[#D1AC5B]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-urdu text-2xl leading-9 text-[#10223A] dark:text-white">
                      {service.ur}
                    </h3>
                    <p className="mt-1 font-display text-xl text-[#334661] dark:text-white/80">
                      {service.en}
                    </p>
                    <p className="mt-4 font-sans text-sm leading-6 text-[#647188] dark:text-white/60">
                      {urdu ? service.descUr : service.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* FATWA ARCHIVE QUICK SEARCH CHAMBER                                */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden bg-white dark:bg-[#071A34] px-5 py-20 sm:px-8 lg:py-28" id="fatawa">
          <div className="absolute right-0 top-0 h-full w-[34%] bg-[#08284C]" />
          <div className="relative mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
            <div className="relative z-10">
              <SectionHeading tone="light" eyebrow={urdu ? "فتاویٰ" : "FATWA LIBRARY"}
                title={urdu ? "اہم سوالات، مرتب رہنمائی" : "Read, search, and revisit guidance"}
                description={
                  urdu
                    ? "موضوع کے لحاظ سے مرتب فتاویٰ اور عمومی شرعی رہنمائی تک آسان رسائی حاصل کریں۔"
                    : "Browse structured, searchable guidance organised for thoughtful everyday reference."
                }
              />
              <Link
                href="/fatawa"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#075A9B] dark:border-[#D1AC5B] pb-2 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#075A9B] dark:text-[#F3D794]"
              >
                {urdu ? "فتاویٰ کی فہرست دیکھیں" : "Explore the library"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative rounded-2xl border border-white/20 bg-[#08284C] p-6 shadow-[0_24px_60px_rgba(6,21,46,.25)] sm:p-9">
              <p className="font-urdu text-2xl leading-10 text-[#F5E5B9]">
                {urdu ? "فتاویٰ میں تلاش کریں" : "Search the archive"}
              </p>
              <p className="mt-2 max-w-lg font-sans text-sm leading-7 text-white/70">
                {urdu
                  ? "اپنا موضوع، عنوان یا فتویٰ نمبر درج کریں۔"
                  : "Search by subject, title, or fatwa number."}
              </p>
              <form onSubmit={submitArchiveSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
                <label className="flex h-14 flex-1 items-center gap-3 rounded-lg bg-white px-4 text-[#10223A] shadow-sm">
                  <Search className="h-5 w-5 text-[#075A9B]" />
                  <input
                    value={archiveSearch}
                    onChange={(event) => setArchiveSearch(event.target.value)}
                    aria-label={urdu ? "فتاویٰ تلاش کریں" : "Search the fatwa archive"}
                    placeholder={
                      urdu ? "موضوع، عنوان یا فتویٰ نمبر لکھیں" : "Enter a subject, title, or fatwa number"
                    }
                    className={
                      urdu
                        ? "w-full bg-transparent font-urdu text-base leading-8 outline-none placeholder:text-[#8290A2]"
                        : "w-full bg-transparent font-sans text-sm outline-none placeholder:text-[#8290A2]"
                    }
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-[#D1AC5B] px-6 font-sans text-xs font-bold uppercase tracking-[.14em] text-[#10223A] transition hover:bg-[#E4C77F]"
                >
                  {urdu ? "تلاش کریں" : "Search"}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-5 font-sans text-xs leading-6 text-white/55">
                {urdu
                  ? "آپ کو مکمل محفوظ شدہ فہرست میں لے جایا جائے گا۔"
                  : "You will be taken to the complete searchable archive."}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SCHOLARS DIRECTORY SECTION                                        */}
        {/* ================================================================= */}
        <section className="relative bg-[#FBF9F3] dark:bg-[#041226] px-5 py-20 sm:px-8 lg:py-28" id="scholars">
          <div className="mx-auto max-w-[1360px]">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow={urdu ? "علماء کرام" : "OUR SCHOLARS"}
                title={urdu ? "علمی رہنمائی کے امین" : "Meet our scholars"}
                description={
                  urdu
                    ? "دارالافتاء ارشاد السائلین کراچی سے وابستہ علماء و مفتیانِ کرام کی علمی خدمات اور تعارف ملاحظہ فرمائیں۔"
                    : "Meet the scholars and experts associated with Darul Ifta Irshad-us-Saileen Karachi."
                }
              />
              <Link href="/scholars" className="text-link">
                {urdu ? "تمام علماء دیکھیں" : "View all scholars"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {scholars.slice(0, 3).map((scholar, index) => (
                <article
                  className="flex min-h-[290px] flex-col justify-between rounded-xl border border-[#D8D0C3] dark:border-white/10 bg-white dark:bg-[#071F3D] p-7 shadow-[0_10px_26px_rgba(29,43,66,.06)] transition hover:-translate-y-1 hover:shadow-xl"
                  key={scholar.slug}
                >
                  <div>
                    <span className="font-display text-4xl leading-none text-[#D7E0EA] dark:text-white/20">
                      0{index + 1}
                    </span>
                    <p className="mt-6 font-sans text-[10px] font-bold uppercase tracking-[.15em] text-[#075A9B] dark:text-[#D1AC5B]">
                      {scholar.designation[language]}
                    </p>
                    <h3 className={`mt-3 text-3xl font-bold text-[#10223A] dark:text-white ${
                      urdu ? "font-urdu leading-[1.6]" : "font-display leading-tight"
                    }`}>
                      {scholar.name[language]}
                    </h3>
                    <p className={`mt-4 text-[#52627A] dark:text-white/70 ${
                      urdu ? "font-urdu text-lg leading-9" : "font-sans text-sm leading-7"
                    }`}>
                      {scholar.shortIntroduction[language]}
                    </p>
                  </div>

                  <Link
                    href={`/scholars/${scholar.slug}`}
                    className="mt-6 inline-flex items-center gap-2 pt-4 border-t border-[#EAE3D5] dark:border-white/10 font-sans text-xs font-bold uppercase tracking-[.13em] text-[#075A9B] dark:text-[#F3D794] transition hover:text-[#C89C46]"
                  >
                    <span>{urdu ? "پروفائل دیکھیں" : "View profile"}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST DAILY POSTS */}
        <LatestDailyPosts />

        {/* ================================================================= */}
        {/* DONATIONS SECTION                                                 */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden bg-[#08284C] px-5 py-20 text-white sm:px-8 lg:py-26" id="donate">
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: "url('/manus-storage/darul-ifta-geometric-pattern_a1249f4a.jpg')",
              backgroundSize: "320px",
            }}
          />
          <div className="relative mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-9 bg-[#C89C46]" />
                <span className="font-sans text-[10px] font-bold uppercase tracking-[.2em] text-[#E9D4A2]">
                  {urdu ? "عطیات" : "DONATIONS"}
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl leading-tight text-white">
                {urdu ? "خدمتِ دین میں تعاون" : "Support beneficial service"}
              </h2>
              <p className="mt-5 max-w-lg font-sans text-sm leading-7 text-white/70">
                {urdu
                  ? "عطیہ بھیجنے سے پہلے براہِ کرم بینک کی معلومات خود تصدیق کر لیں۔"
                  : "Please verify these banking details independently before making any transfer."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/7 p-6 backdrop-blur sm:p-8 shadow-2xl">
              <div className="grid gap-6 sm:grid-cols-2">
                <DonationItem label={urdu ? "اکاؤنٹ ہولڈر" : "Account holder"} value="Faisal Hayat" />
                <DonationItem
                  label={urdu ? "اکاؤنٹ نمبر" : "Account number"}
                  value="0183-0100450333"
                  copy={() => copyValue("0183-0100450333", urdu ? "اکاؤنٹ نمبر" : "Account number")}
                />
                <DonationItem
                  label="IBAN"
                  value="PK56MEZN0001830100450333"
                  full
                  copy={() => copyValue("PK56MEZN0001830100450333", "IBAN")}
                />
                <div className="rounded-lg border border-dashed border-white/30 p-4">
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[.14em] text-[#E9D4A2]">
                    {urdu ? "کیو آر کوڈ" : "QR CODE"}
                  </p>
                  <p className="mt-2 font-sans text-xs leading-5 text-white/65">
                    {urdu ? "مستقبل میں شامل کیا جائے گا" : "Reserved for future use"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTACT SECTION                                                   */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-[#030E1D] px-5 py-20 sm:px-8 lg:py-26" id="contact">
          <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              <SectionHeading
                eyebrow={urdu ? "رابطہ" : "CONTACT"}
                title={urdu ? "ہم سے رابطے میں رہیں" : "Reach the Darul Ifta"}
                description={
                  urdu
                    ? "عمومی رابطے اور رہنمائی کے لیے درج ذیل ذرائع استعمال کریں۔"
                    : "Use the following channels for general communication and guidance requests."
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <a
                href="https://wa.me/923332617671"
                target="_blank"
                rel="noreferrer"
                className="contact-card dark:bg-[#071F3D]"
              >
                <MessageCircle className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">WhatsApp</h3>
                <p>+92 333 2617671</p>
              </a>

              <a
                href={whatsappChannelUrl} target="_blank" rel="noreferrer"
                aria-label={urdu ? "واٹس ایپ چینل کھولیں" : "Open WhatsApp Channel"}
                className="contact-card dark:bg-[#071F3D]"
              >
                <Radio className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">{urdu ? "واٹس ایپ چینل" : "WhatsApp Channel"}</h3>
                <p>{urdu ? "سرکاری اعلانات" : "Official updates"}</p>
              </a>

              <a
                href={onlineBayanUrl} target="_blank" rel="noreferrer"
                aria-label={urdu ? "آن لائن بیان کھولیں" : "Open Online Bayan"}
                className="contact-card dark:bg-[#071F3D]"
              >
                <Radio className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">{urdu ? "آن لائن بیان" : "Online Bayan"}</h3>
                <p>{urdu ? "براہ راست دینی بیان" : "Live Islamic broadcast"}</p>
              </a>

              <a
                href="tel:+923332617671"
                className="contact-card dark:bg-[#071F3D]"
              >
                <Phone className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">{urdu ? "کال کریں" : "Call us"}</h3>
                <p>+92 333 2617671</p>
              </a>

              <a
                href="mailto:ask.darulifa.irshadussaaileen@gmail.com"
                className="contact-card dark:bg-[#071F3D]"
              >
                <Mail className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">{urdu ? "ای میل" : "Email"}</h3>
                <p className="break-all">ask.darulifa.irshadussaaileen@gmail.com</p>
              </a>

              <div className="contact-card dark:bg-[#071F3D]">
                <Send className="h-6 w-6 text-[#075A9B] dark:text-[#D1AC5B]" />
                <h3 className="dark:text-white">{urdu ? "سوشل میڈیا" : "Social media"}</h3>
                <p>{urdu ? "یوٹیوب: @MuftiFaisalHayat" : "YouTube: @MuftiFaisalHayat"}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-[1240px] border-t border-[#DAD2C5] dark:border-white/10 pt-8">
            <p className="font-sans text-xs font-bold uppercase tracking-[.16em] text-[#C89C46]">
              {urdu ? "پتہ" : "ADDRESS"}
            </p>
            <p className="mt-3 font-display text-2xl text-[#10223A] dark:text-white">
              Al Mujeeb Garden A31, Karachi, Pakistan
            </p>
            <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-[#69778A] dark:text-white/70">
              {urdu
                ? "درست نقشہ جاتی مقام کی تصدیق ہونے پر نقشہ یہاں شامل کیا جائے گا۔"
                : "A location map will be added here when the exact coordinates have been verified."}
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function DonationItem({
  label,
  value,
  copy,
  full = false,
}: {
  label: string;
  value: string;
  copy?: () => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="font-sans text-[10px] font-bold uppercase tracking-[.15em] text-[#E9D4A2]">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="break-all font-sans text-sm text-white">{value}</p>
        {copy && (
          <button
            onClick={copy}
            className="rounded-sm border border-white/20 p-2 text-white/80 transition hover:border-[#E9D4A2] hover:text-[#E9D4A2]"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
