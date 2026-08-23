/**
 * Blue Minbar Heritage: a manuscript-led scholarly catalogue where Urdu titles lead,
 * record folios establish authority, and original-PDF access remains explicit.
 */
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpRight, FileText, Filter, ExternalLink, X } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { CATEGORY_LABELS, FATAWA, type Fatwa } from "@/data/fatawa";
import { FATWA_CATEGORY_LABELS, getTranslationStatusLabel, localizeFatwa } from "@/data/fatwaLocalization";
import { filterFatawa, readArchiveSearchQuery } from "@/data/fatawaSearch";

export default function Fatawa() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const urlQuery = useMemo(() => readArchiveSearchQuery(search), [search]);
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  const [category, setCategory] = useState<"All" | Fatwa["category"]>("All");
  const categories = useMemo(() => Object.keys(CATEGORY_LABELS) as Fatwa["category"][], []);
  const result = useMemo(() => filterFatawa(FATAWA, query, category, language), [category, language, query]);
  const submitArchiveSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setLocation(nextQuery ? `/fatawa?q=${encodeURIComponent(nextQuery)}` : "/fatawa");
  };
  const clearArchiveSearch = () => {
    setQuery("");
    setLocation("/fatawa");
  };
  const text = language === "ur" ? {
    eyebrow: "فتاویٰ کی فہرست", title: "مرتب شرعی رہنمائی", description: "موضوع، فتویٰ نمبر یا عنوان کے ذریعے اصل فتاویٰ تلاش کریں۔ ہر اندراج کے ساتھ اصل پی ڈی ایف دستاویز دستیاب ہے۔", all: "تمام موضوعات", search: "عنوان یا فتویٰ نمبر تلاش کریں", results: "فتاویٰ", more: "مکمل رہنمائی پڑھیں", original: "اصل پی ڈی ایف کھولیں", noResults: "آپ کی تلاش کے مطابق کوئی فتویٰ نہیں ملا۔", note: "نوٹ: ہر اندراج دارالافتاء کی فراہم کردہ اصل پی ڈی ایف دستاویز سے منسلک ہے۔ ذاتی یا پیچیدہ معاملے میں مکمل تفصیلات کے ساتھ مستند مفتی سے رجوع ضروری ہے۔"
  } : {
    eyebrow: "FATWA LIBRARY", title: "Published scholarly guidance", description: "Find original fatwas by subject, fatwa number, or title. Every catalogue entry links to its supplied original PDF document.", all: "All subjects", search: "Search by title or fatwa number", results: "fatawa", more: "Read record", original: "Open original PDF", noResults: "No fatawa matched your search.", note: "Important: Every record links to its original PDF document. A qualified mufti should review personal or case-specific matters with complete circumstances."
  };
  return <SiteShell><main>
    <section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">دارالافتاء ارشاد السائلین</p><h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-white sm:text-7xl">{text.title}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{text.description}</p></div></section>
    <section className="relative bg-[#FBF9F3] px-5 py-16 sm:px-8 lg:py-22"><div className="mx-auto max-w-[1240px]"><div className="archive-introduction"><SectionHeading eyebrow={text.eyebrow} title={language === "ur" ? "فتاویٰ تلاش کریں" : "Explore published fatawa"} /><p className="archive-introduction-note">{language === "ur" ? "محفوظ شدہ علمی رہنمائی · موضوع، نمبر یا عنوان سے تلاش کریں" : "A considered public archive · Search by topic, reference, or title"}</p></div><div className="archive-tools mt-10 grid gap-4 lg:grid-cols-[1fr_auto]"><form onSubmit={submitArchiveSearch} className="archive-search flex h-13 items-center gap-3 px-2"><Search className="h-5 w-5 shrink-0 text-[#075A9B]"/><input aria-label={text.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} className="min-w-0 flex-1 bg-transparent font-sans text-sm text-[#10223A] outline-none placeholder:text-[#8792A4]"/>{query && <button type="button" onClick={clearArchiveSearch} className="archive-clear-search" aria-label={language === "ur" ? "تلاش صاف کریں" : "Clear search"}><X className="h-3.5 w-3.5" /></button>}<button type="submit" className="grid h-8 w-8 shrink-0 place-items-center text-[#075A9B] transition hover:text-[#B48731]" aria-label={text.search}><ArrowUpRight className="h-4 w-4" /></button></form><div className="archive-filter-group flex flex-wrap items-center gap-2"><Filter className="ml-2 h-4 w-4 text-[#075A9B]"/>{(["All" as const, ...categories]).map((option) => <button key={option} onClick={() => setCategory(option)} aria-pressed={category === option} className={`filter-pill ${category === option ? "filter-pill-active" : ""}`}>{option === "All" ? text.all : FATWA_CATEGORY_LABELS[option][language]}</button>)}</div></div>
      <div className="archive-result-bar mt-7" aria-live="polite"><span className="archive-result-count">{result.length} {text.results}</span>{query && <span className="archive-result-query">{language === "ur" ? "تلاش:" : "Searching:"} <b>{query}</b></span>}<span className="hidden sm:block">{language === "ur" ? "ہر جواب کے ساتھ سیاق اور حوالہ ملاحظہ کریں" : "Review context and source notes with every entry."}</span></div>
      <div className="fatwa-library-record-list mt-6">{result.map((fatwa, index) => {
        const localized = localizeFatwa(fatwa, language);
        return <article className="fatwa-library-record" key={fatwa.slug}><div className="fatwa-library-index"><span className="fatwa-library-seal">۞</span><span className="fatwa-library-number">{fatwa.number}</span><span className="fatwa-library-order">{String(index + 1).padStart(2, "0")}</span></div><div className="fatwa-library-main"><Link href={`/fatawa/${fatwa.slug}`} className="fatwa-library-record-link" lang={language} dir={language === "ur" ? "rtl" : "ltr"}><div className="flex items-start justify-between gap-5"><p className={language === "ur" ? "fatwa-library-urdu-title" : "fatwa-library-english-title"}>{localized.title}</p><ArrowUpRight className="mt-2 h-5 w-5 shrink-0 text-[#B48731]" /></div><div className="fatwa-library-rule">۞</div><p className="fatwa-library-summary">{localized.question}</p><div className="fatwa-library-meta"><span>{localized.category}</span><span>{localized.date}</span><span>{getTranslationStatusLabel(localized.reviewStatus, language)}</span></div></Link></div><div className="fatwa-library-action"><p>{language === "ur" ? "اصل ماخذ" : "SOURCE PDF"}</p><a href={fatwa.pdfUrl} target="_blank" rel="noreferrer" className="fatwa-library-pdf-link"><FileText className="h-4 w-4" />{text.original}<ExternalLink className="h-3.5 w-3.5" /></a></div></article>;
      })}</div>
      {!result.length && <div className="archive-empty-state mt-8" role="status"><div><span className="archive-empty-seal">۞</span><FileText className="mx-auto mt-3 h-7 w-7 text-[#B88A43]"/><p className="mt-4 font-sans text-sm text-[#40556C]">{text.noResults}</p><button type="button" onClick={clearArchiveSearch} className="archive-empty-action">{language === "ur" ? "تمام فتاویٰ دیکھیں" : "View all fatawa"}</button></div></div>}
      <aside className="mt-12 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6 font-sans text-sm leading-7 text-[#34465F]">{text.note}</aside>
    </div></section>
  </main></SiteShell>;
}
