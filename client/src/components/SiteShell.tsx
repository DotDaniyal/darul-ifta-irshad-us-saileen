/**
 * Royal Calligraphy House: Centered transparent identity, Bismillah masthead, royal-blue/navy/black/white/gold palette,
 * ceremonial calligraphy, and clear bilingual navigation for a premium Darul Ifta experience.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Menu, X, Phone, Mail, MessageCircle, ChevronRight, HeartHandshake, BookOpenCheck, ExternalLink, ArrowUp, Radio } from "lucide-react";
import { Link, useLocation } from "wouter";

const officialLogo = "/manus-storage/darul-ifta-logo-transparent_c2993680.png";
const onlineBayanUrl = "https://faisal-hayat.mixlr.com/events/5246475?utm_source=new_broadcast_alert&utm_medium=email&utm_campaign=alert";
const whatsappChannelUrl = "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q";

type Language = "ur" | "en";

const copy = {
  en: {
    home: "Home", about: "Introduction", services: "Services", fatawa: "Fatawa", dailyPosts: "Daily Posts", methodology: "Methodology", scholars: "Scholars", contact: "Contact", donate: "Donate",
    lang: "اردو", quick: "Quick links", aboutText: "A trusted space for considered Islamic guidance grounded in the Qur’an and Sunnah.",
    rights: "All rights reserved.", location: "Al Mujeeb Garden A31, Karachi, Pakistan", contactUs: "Contact", serviceLinks: "Our services",
  },
  ur: {
    home: "سرورق", about: "تعارف", services: "خدمات", fatawa: "فتاویٰ", dailyPosts: "روزانہ پوسٹس", methodology: "منہج", scholars: "علماء", contact: "رابطہ", donate: "عطیات",
    lang: "English", quick: "اہم روابط", aboutText: "قرآن و سنت کی روشنی میں معتبر اور ذمہ دار شرعی رہنمائی کا مرکز۔", 
    rights: "تمام حقوق محفوظ ہیں۔", location: "المجیب گارڈن اے 31، کراچی، پاکستان", contactUs: "رابطہ", serviceLinks: "ہماری خدمات",
  },
};

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "ur";
  return localStorage.getItem("darul-ifta-language") === "en" ? "en" : "ur";
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);
  useEffect(() => {
    const syncLanguage = (event: Event) => setLanguageState((event as CustomEvent<Language>).detail);
    window.addEventListener("darul-ifta-language", syncLanguage);
    return () => window.removeEventListener("darul-ifta-language", syncLanguage);
  }, []);
  useEffect(() => {
    localStorage.setItem("darul-ifta-language", language);
    document.documentElement.lang = language === "ur" ? "ur" : "en";
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language]);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.dispatchEvent(new CustomEvent<Language>("darul-ifta-language", { detail: next }));
  };
  return { language, setLanguage };
}

export function BrandMark({ compact = false, centered = false }: { compact?: boolean; centered?: boolean }) {
  return (
    <Link href="/" className={`group flex items-center gap-3 ${centered ? "brand-mark-center flex-col gap-0.5" : "text-left"}`} aria-label="Darul Ifta Irshad-us-Saileen home">
      <span className={`${centered ? "h-[62px] w-[62px] sm:h-[72px] sm:w-[72px]" : compact ? "h-11 w-11" : "h-14 w-14"} flex shrink-0 items-center justify-center overflow-hidden bg-transparent transition duration-300 group-hover:-translate-y-0.5`}>
        <img src={officialLogo} alt="Darul Ifta Irshad-us-Saileen official logo" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
      </span>
      <span className={`min-w-0 leading-none ${centered ? "text-center" : "text-white"}`}>
        <span className={`block font-urdu ${centered ? "brand-urdu-name text-[21px] leading-[1.55] text-[#101E42] sm:text-[25px]" : "text-[13px] leading-6 text-[#E9D4A2]"}`}>دارالافتاء ارشاد السائلین</span>
        <span className={`block font-sans font-semibold uppercase ${centered ? "brand-english-name mt-1 text-[11px] tracking-[0.20em] text-[#1F4394] sm:text-[13px]" : "text-[9px] tracking-[0.18em] text-white/85 sm:text-[10px]"}`}>Darul Ifta Irshad-us-Saileen</span>
      </span>
    </Link>
  );
}

function InstitutionalLetterhead() {
  return (
    <div className="institutional-letterhead">
      <div className="letterhead-grid">
        <div className="letterhead-english" lang="en">
          <p className="letterhead-english-name">Darul Ifta <span>Irshad-us-Saileen</span><small>Karachi</small></p>
          <p className="letterhead-address letterhead-address-en">Al-Mujeeb Garden A-31, Model Colony, Karachi</p>
        </div>

        <Link href="/" className="letterhead-logo-link" aria-label="Darul Ifta Irshad-us-Saileen home">
          <span className="letterhead-logo-frame">
            <img src={officialLogo} alt="Darul Ifta Irshad-us-Saileen official logo" className="letterhead-logo" />
          </span>
          <span className="letterhead-logo-caption" aria-hidden="true">Darul Ifta<br />Irshad-us-Saileen</span>
        </Link>

        <div className="letterhead-urdu" lang="ur" dir="rtl">
          <p className="letterhead-urdu-name">
            <span className="letterhead-urdu-accessible-text">دارالافتاء ارشاد السائلین کراچی</span>
            <img
              src="/manus-storage/masthead-urdu-calligraphy-reference_da060155.png"
              alt=""
              aria-hidden="true"
              className="letterhead-urdu-calligraphy-image"
            />
          </p>
          <p className="letterhead-address letterhead-address-ur">المجیب گارڈن اے-31 ماڈل کالونی کراچی</p>
        </div>
      </div>
      <span className="letterhead-baseline" aria-hidden="true" />
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "start", tone = "navy" }: { eyebrow: string; title: string; description?: string; align?: "start" | "center"; tone?: "navy" | "light" }) {
  return (
    <div className={`section-heading ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <div className={`section-eyebrow mb-4 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-9 bg-[#C89C46]" /><span className={`font-sans text-[10px] font-bold uppercase tracking-[0.22em] ${tone === "light" ? "text-[#F2E3BC]" : "text-[#075A9B]"}`}>{eyebrow}</span><span className="h-1.5 w-1.5 rotate-45 bg-[#C89C46]" />
      </div>
      <h2 className={`section-title font-display text-4xl leading-[1.05] ${tone === "light" ? "text-[#FFF9E8]" : "text-[#0B2A4A]"} sm:text-5xl`}>{title}</h2>
      {description && <p className={`section-description mt-5 max-w-xl font-sans text-sm leading-7 ${tone === "light" ? "text-white/80" : "text-[#52627A]"} sm:text-base`}>{description}</p>}
    </div>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [location] = useLocation();
  const t = copy[language];
  const homePrefix = location === "/" ? "" : "/";
  const links = [
    { href: `${homePrefix}#about`, label: t.about }, { href: `${homePrefix}#services`, label: t.services },
    { href: "/fatawa", label: t.fatawa }, { href: "/daily-posts", label: t.dailyPosts }, { href: "/methodology", label: t.methodology }, { href: "/scholars", label: t.scholars },
    { href: `${homePrefix}#contact`, label: t.contact },
  ];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    if (!sections.length) return;

    const reveal = (section: HTMLElement) => {
      section.classList.remove("is-reveal-pending");
      section.classList.add("is-visible");
    };

    try {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }),
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
      );

      sections.forEach((section, index) => {
        section.classList.add("motion-section", "is-reveal-pending");
        section.style.setProperty("--motion-delay", `${Math.min(index * 45, 180)}ms`);
      });

      const activationFrame = window.requestAnimationFrame(() => {
        sections.forEach((section) => {
          const { bottom, top } = section.getBoundingClientRect();
          if (top < window.innerHeight && bottom > 0) reveal(section);
          observer.observe(section);
        });
      });
      const visibilityFailsafe = window.setTimeout(() => sections.forEach(reveal), 1000);

      return () => {
        window.cancelAnimationFrame(activationFrame);
        window.clearTimeout(visibilityFailsafe);
        observer.disconnect();
      };
    } catch {
      // Motion must never make reading content dependent on an optional browser API.
    }
  }, [location]);

  useEffect(() => {
    const updateScrollState = () => {
      const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / maximum, 1);
      setScrollProgress(progress);
      setShowBackToTop(window.scrollY > 520);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const returnToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className={`site-shell min-h-screen overflow-x-hidden bg-white ${language === "ur" ? "font-urdu" : "font-sans"}`}>
      <div className="site-reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <div className="bismillah-bar px-4 py-2 sm:px-8">
        <div className="mx-auto grid max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center gap-4 font-sans text-[10px] tracking-wide sm:text-xs">
          <a href="tel:+923332617671" className="flex items-center gap-2 text-white/72 transition hover:text-[#E9D4A2]"><Phone className="h-3.5 w-3.5" />+92 333 2617671</a>
          <span className="bismillah-script text-center">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
          <a href="https://wa.me/923332617671" className="flex items-center justify-end gap-2 text-white/72 transition hover:text-[#E9D4A2]" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">WhatsApp</span></a>
        </div>
      </div>
      <header className={`site-header sticky top-0 z-50 shadow-[0_14px_32px_rgba(4,11,29,.14)] ${scrollProgress > 0.025 ? "site-header-condensed" : ""}`}>
        <div className="royal-masthead"><InstitutionalLetterhead /></div>
        <div className="royal-nav">
          <div className="relative mx-auto flex min-h-[57px] max-w-[1360px] items-center justify-center px-4 sm:px-8">
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
              <Link href="/" className={`nav-link ${location === "/" ? "nav-link-active" : ""}`}>{t.home}</Link>
              {links.map((item) => <a key={item.label} href={item.href} className={`nav-link ${location === item.href ? "nav-link-active" : ""}`}>{item.label}</a>)}
              <a href={onlineBayanUrl} target="_blank" rel="noreferrer" className="nav-link nav-link-bayan">{language === "ur" ? "آن لائن بیان" : "Online Bayan"}<ExternalLink className="h-3 w-3" /></a>
            </nav>
            <div className="absolute right-4 flex items-center gap-2 sm:right-8 sm:gap-3">
              <button onClick={() => setLanguage(language === "ur" ? "en" : "ur")} className="rounded-none border border-white/25 px-2.5 py-2 font-sans text-[10px] font-bold tracking-wide text-white transition hover:border-[#E9D4A2] hover:text-[#E9D4A2]" aria-label="Switch language">{t.lang}</button>
              <Link href="/ask-fatwa" className="hidden items-center gap-2 rounded-none bg-[#D1AC5B] px-4 py-2.5 font-sans text-[11px] font-bold text-[#07152E] transition hover:bg-[#F1DC9B] sm:flex"><BookOpenCheck className="h-4 w-4" />{language === "ur" ? "فتویٰ دریافت کریں" : "Ask a Fatwa"}</Link>
              <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center text-white lg:hidden" aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-primary-navigation">{open ? <X /> : <Menu />}</button>
            </div>
          </div>
          {open && <div className="mobile-nav-overlay lg:hidden" role="presentation"><button type="button" className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} /><div id="mobile-primary-navigation" className="mobile-nav-panel"><div className="mb-5 flex items-center justify-between"><p className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-[#E9D4A2]">{language === "ur" ? "رہنمائی کے راستے" : "Explore guidance"}</p><button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center border border-white/20 text-white" aria-label="Close navigation"><X className="h-4 w-4" /></button></div><nav className="flex flex-col gap-1">{[{ href: "/", label: t.home }, ...links, { href: "/ask-fatwa", label: language === "ur" ? "فتویٰ دریافت کریں" : "Ask a Fatwa" }].map((item, index) => <a onClick={() => setOpen(false)} key={item.label} href={item.href} className="mobile-nav-link" style={{ "--mobile-nav-index": index } as CSSProperties}><span>{item.label}</span><ChevronRight className="h-4 w-4 text-[#D1AC5B]" /></a>)}<a href={onlineBayanUrl} target="_blank" rel="noreferrer" className="mobile-nav-bayan"><span>{language === "ur" ? "آن لائن بیان سنیں" : "Listen to Online Bayan"}</span><ExternalLink className="h-4 w-4" /></a></nav></div></div>}
        </div>
      </header>
      <div className="page-canvas page-canvas-enter">{children}</div>
      <footer className="site-footer relative overflow-hidden bg-[#061A34] text-white">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "url('/manus-storage/darul-ifta-geometric-pattern_a1249f4a.jpg')", backgroundSize: "360px" }} />
        <div className="relative mx-auto max-w-[1360px] px-5 pb-7 pt-16 sm:px-8 lg:pt-20">
          <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.45fr_0.75fr_0.9fr_1fr]">
            <div><BrandMark /><p className="mt-6 max-w-sm font-sans text-sm leading-7 text-white/65">{t.aboutText}</p><div className="mt-6 flex gap-3"><a href="https://wa.me/923332617671" target="_blank" rel="noreferrer" className="footer-icon" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a><a href={whatsappChannelUrl} target="_blank" rel="noreferrer" className="footer-icon" aria-label={language === "ur" ? "واٹس ایپ چینل" : "WhatsApp Channel"}><Radio className="h-4 w-4" /></a><a href="tel:+923332617671" className="footer-icon" aria-label="Call Darul Ifta"><Phone className="h-4 w-4" /></a><a href="mailto:ask.darulifa.irshadussaaileen@gmail.com" className="footer-icon" aria-label="Email Darul Ifta"><Mail className="h-4 w-4" /></a></div></div>
            <div><h3 className="footer-title">{t.quick}</h3><div className="footer-links">{links.slice(0, 5).map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}</div></div>
            <div><h3 className="footer-title">{t.serviceLinks}</h3><div className="footer-links"><a href="/fatawa">{language === "ur" ? "فتویٰ سروس" : "Fatwa Service"}</a><a href="/#services">{language === "ur" ? "اسلامی تعلیم" : "Islamic Education"}</a><a href="/#services">{language === "ur" ? "اشاعت و طباعت" : "Publications"}</a><a href="/ask-fatwa">{language === "ur" ? "علمی مشاورت" : "Scholarly Consultation"}</a><a href={onlineBayanUrl} target="_blank" rel="noreferrer" className="text-[#E9D4A2]">{language === "ur" ? "آن لائن بیان" : "Online Bayan"}</a></div></div>
            <div><h3 className="footer-title">{t.contactUs}</h3><p className="font-sans text-sm leading-7 text-white/70">{t.location}</p><a href="tel:+923332617671" className="mt-4 block font-sans text-sm font-semibold text-[#E9D4A2]">+92 333 2617671</a><a href="mailto:ask.darulifa.irshadussaaileen@gmail.com" className="mt-2 block break-all font-sans text-xs text-[#E9D4A2] transition hover:text-white">ask.darulifa.irshadussaaileen@gmail.com</a><a href={whatsappChannelUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-sans text-xs text-[#E9D4A2] transition hover:text-white"><Radio className="h-3.5 w-3.5" />{language === "ur" ? "واٹس ایپ چینل" : "WhatsApp Channel"}<ExternalLink className="h-3 w-3" /></a><Link href="/ask-fatwa" className="mt-5 inline-flex items-center gap-2 text-sm text-white transition hover:text-[#E9D4A2]"><HeartHandshake className="h-4 w-4 text-[#C89C46]" />{language === "ur" ? "شرعی سوال جمع کروائیں" : "Submit a question"}</Link></div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-7 font-sans text-[11px] text-white/45 sm:flex-row"><span>© {new Date().getFullYear()} Darul Ifta Irshad-us-Saileen Karachi</span><span>{t.rights}</span></div>
        </div>
      </footer>
      {showBackToTop && <button type="button" onClick={returnToTop} className="back-to-top" aria-label={language === "ur" ? "اوپر جائیں" : "Back to top"}><ArrowUp className="h-4 w-4" /><span>{language === "ur" ? "اوپر" : "Top"}</span></button>}
    </div>
  );
}
