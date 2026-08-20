/**
 * Blue Minbar Heritage: a manuscript-led scholarly catalogue where Urdu titles lead,
 * record folios establish authority, and original-PDF access remains explicit.
 */
import { useMemo, useState } from "react";
import { Search, ArrowUpRight, FileText, Filter, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { CATEGORY_LABELS, FATAWA, type Fatwa } from "@/data/fatawa";

export default function Fatawa() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Fatwa["category"]>("All");
  const categories = useMemo(() => Object.keys(CATEGORY_LABELS) as Fatwa["category"][], []);
  const result = useMemo(() => FATAWA.filter((item) => (category === "All" || item.category === category) && `${item.number} ${item.titleEn} ${item.titleUr} ${item.questionEn} ${item.questionUr} ${item.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const text = language === "ur" ? {
    eyebrow: "فتاویٰ کی فہرست", title: "مرتب شرعی رہنمائی", description: "موضوع، فتویٰ نمبر یا عنوان کے ذریعے شائع شدہ فتاویٰ تلاش کریں۔ ہر اندراج کے ساتھ پی ڈی ایف دستاویز دستیاب ہے۔", all: "تمام موضوعات", search: "عنوان یا فتویٰ نمبر تلاش کریں", results: "فتاویٰ", more: "مکمل رہنمائی پڑھیں", original: "پی ڈی ایف کھولیں", noResults: "آپ کی تلاش کے مطابق کوئی فتویٰ نہیں ملا۔", note: "نوٹ: ہر اندراج دارالافتاء کی فراہم کردہ پی ڈی ایف دستاویز سے منسلک ہے۔ ذاتی یا پیچیدہ معاملے میں مکمل تفصیلات کے ساتھ مستند مفتی سے رجوع ضروری ہے۔"
  } : {
    eyebrow: "FATWA LIBRARY", title: "Published scholarly guidance", description: "Find published fatwas by subject, fatwa number, or title. Every catalogue entry links to its supplied PDF document.", all: "All subjects", search: "Search by title or fatwa number", results: "fatawa", more: "Read record", original: "Open PDF", noResults: "No fatawa matched your search.", note: "Important: Every record links to its supplied PDF document. A qualified mufti should review personal or case-specific matters with complete circumstances."
  };
  return <SiteShell><main>
    <section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">دارالافتاء ارشاد السائلین</p><h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-white sm:text-7xl">{text.title}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{text.description}</p></div></section>
    <section className="relative bg-[#FBF9F3] px-5 py-16 sm:px-8 lg:py-22"><div className="mx-auto max-w-[1240px]"><SectionHeading eyebrow={text.eyebrow} title={language === "ur" ? "فتاویٰ تلاش کریں" : "Explore published fatawa"} /><div className="archive-tools mt-10 grid gap-4 lg:grid-cols-[1fr_auto]"><label className="archive-search flex h-13 items-center gap-3 px-2"><Search className="h-5 w-5 text-[#075A9B]"/><input aria-label={text.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} className="w-full bg-transparent font-sans text-sm text-[#10223A] outline-none placeholder:text-[#8792A4]"/></label><div className="archive-filter-group flex flex-wrap items-center gap-2"><Filter className="ml-2 h-4 w-4 text-[#075A9B]"/>{(["All" as const, ...categories]).map((option) => <button key={option} onClick={() => setCategory(option)} className={`filter-pill ${category === option ? "filter-pill-active" : ""}`}>{option === "All" ? text.all : CATEGORY_LABELS[option]}</button>)}</div></div>
      <div className="mt-7 flex items-center justify-between font-sans text-xs text-[#667389]"><span>{result.length} {text.results}</span><span className="hidden sm:block">{language === "ur" ? "ہر جواب کے ساتھ سیاق اور حوالہ ملاحظہ کریں" : "Review context and source notes with every entry."}</span></div>
      <div className="fatwa-catalogue-list mt-6">{result.map((fatwa, index) => <article className="fatwa-catalogue-entry group" key={fatwa.slug}><div className="fatwa-folio"><span className="fatwa-folio-seal">۞</span><span className="fatwa-number">{fatwa.number}</span><span className="fatwa-folio-index">{String(index + 1).padStart(2, "0")}</span></div><div className="fatwa-catalogue-content"><Link href={`/fatawa/${fatwa.slug}`} className="block"><div className="flex items-start justify-between gap-5"><p className="fatwa-urdu-title">{fatwa.titleUr}</p><ArrowUpRight className="mt-2 h-5 w-5 shrink-0 text-[#C89C46] transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div><div className="fatwa-manuscript-divider"><span>۞</span></div><p className="fatwa-english-reference">{fatwa.titleEn}</p><p className="mt-3 line-clamp-2 font-sans text-sm leading-6 text-[#627087]">{language === "ur" ? fatwa.questionUr : fatwa.questionEn}</p><div className="archive-meta mt-5"><span>{CATEGORY_LABELS[fatwa.category]}</span><span>{fatwa.date}</span></div></Link></div><div className="fatwa-catalogue-action"><p className="fatwa-source-label">{language === "ur" ? "اصل ماخذ" : "SOURCE PDF"}</p><a href={fatwa.pdfUrl} target="_blank" rel="noreferrer" className="fatwa-pdf-link"><FileText className="h-4 w-4" />{text.original}<ExternalLink className="h-3.5 w-3.5" /></a></div></article>)}</div>
      {!result.length && <div className="mt-8 grid min-h-56 place-items-center border border-dashed border-[#B9B0A0] bg-white text-center"><div><FileText className="mx-auto h-7 w-7 text-[#C89C46]"/><p className="mt-4 font-sans text-sm text-[#647188]">{text.noResults}</p></div></div>}
      <aside className="mt-12 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6 font-sans text-sm leading-7 text-[#34465F]">{text.note}</aside>
    </div></section>
  </main></SiteShell>;
}
