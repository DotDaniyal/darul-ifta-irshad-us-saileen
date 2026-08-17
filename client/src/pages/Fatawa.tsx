/**
 * Blue Minbar Heritage: an editorial fatwa library that prioritizes search, source context,
 * and calm, readable scholarly records instead of generic card clutter.
 */
import { useMemo, useState } from "react";
import { Search, ArrowUpRight, FileText, Filter } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { CATEGORY_LABELS, FATAWA, type Fatwa } from "@/data/fatawa";

export default function Fatawa() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Fatwa["category"]>("All");
  const result = useMemo(() => FATAWA.filter((item) => (category === "All" || item.category === category) && `${item.titleEn} ${item.titleUr} ${item.questionEn} ${item.questionUr}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const text = language === "ur" ? {
    eyebrow: "فتاویٰ کی فہرست", title: "مرتب شرعی رہنمائی", description: "موضوع، سوال یا عنوان کے ذریعے رہنمائی تلاش کریں۔ مخصوص ذاتی معاملے کے لیے مکمل تفصیلات کے ساتھ مستند مفتی سے رجوع ضروری ہے۔", all: "تمام موضوعات", search: "عنوان یا سوال تلاش کریں", results: "نتائج", more: "مکمل رہنمائی پڑھیں", noResults: "آپ کی تلاش کے مطابق کوئی فتویٰ نہیں ملا۔", note: "نوٹ: یہاں موجود مواد عمومی شرعی معلومات کے لیے ہے؛ آپ کے انفرادی معاملے کے لیے مستند مفتی کی تحقیق ضروری ہے۔"
  } : {
    eyebrow: "FATWA LIBRARY", title: "Structured guidance for everyday questions", description: "Find guidance by topic, title, or question. For personal or case-specific matters, a qualified mufti must review the full circumstances.", all: "All subjects", search: "Search by title or question", results: "results", more: "Read guidance", noResults: "No fatawa matched your search.", note: "Important: This library offers general Islamic guidance. A qualified mufti should review your individual case before you act."
  };
  return <SiteShell><main>
    <section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">دارالافتاء ارشاد السائلین</p><h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-white sm:text-7xl">{text.title}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{text.description}</p></div></section>
    <section className="relative bg-[#FBF9F3] px-5 py-16 sm:px-8 lg:py-22"><div className="mx-auto max-w-[1360px]"><SectionHeading eyebrow={text.eyebrow} title={language === "ur" ? "فتاویٰ تلاش کریں" : "Explore published fatawa"} /><div className="mt-10 grid gap-4 rounded-sm border border-[#D9D1C3] bg-white p-4 shadow-[0_16px_50px_rgba(16,34,58,0.05)] lg:grid-cols-[1fr_auto] lg:p-5"><label className="flex h-13 items-center gap-3 border-b border-[#DFD8CC] px-2 lg:border-b-0 lg:border-r"><Search className="h-5 w-5 text-[#075A9B]"/><input aria-label={text.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} className="w-full bg-transparent font-sans text-sm text-[#10223A] outline-none placeholder:text-[#8792A4]"/></label><div className="flex flex-wrap items-center gap-2"><Filter className="ml-2 h-4 w-4 text-[#075A9B]"/>{(["All", "Worship", "Transactions", "Marriage & Divorce", "Social Matters"] as const).map((option) => <button key={option} onClick={() => setCategory(option)} className={`filter-pill ${category === option ? "filter-pill-active" : ""}`}>{option === "All" ? text.all : CATEGORY_LABELS[option]}</button>)}</div></div>
      <div className="mt-7 flex items-center justify-between font-sans text-xs text-[#667389]"><span>{result.length} {text.results}</span><span className="hidden sm:block">{language === "ur" ? "ہر جواب کے ساتھ سیاق اور حوالہ ملاحظہ کریں" : "Review context and source notes with every entry."}</span></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{result.map((fatwa) => <Link href={`/fatawa/${fatwa.slug}`} className="fatwa-card group" key={fatwa.slug}><div className="fatwa-card-inner"><div className="flex items-start justify-between gap-3"><span className="fatwa-number">{fatwa.number}</span><ArrowUpRight className="h-5 w-5 text-[#C89C46] transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="mt-8 font-urdu text-xl leading-9 text-[#10223A]">{fatwa.titleUr}</p><h2 className="mt-2 font-display text-2xl text-[#10223A]">{fatwa.titleEn}</h2><p className="mt-4 line-clamp-2 font-sans text-sm leading-6 text-[#627087]">{language === "ur" ? fatwa.questionUr : fatwa.questionEn}</p><div className="archive-meta mt-7"><span>{CATEGORY_LABELS[fatwa.category]}</span><span>{fatwa.date}</span></div></div></Link>)}</div>
      {!result.length && <div className="mt-8 grid min-h-56 place-items-center border border-dashed border-[#B9B0A0] bg-white text-center"><div><FileText className="mx-auto h-7 w-7 text-[#C89C46]"/><p className="mt-4 font-sans text-sm text-[#647188]">{text.noResults}</p></div></div>}
      <aside className="mt-12 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6 font-sans text-sm leading-7 text-[#34465F]">{text.note}</aside>
    </div></section>
  </main></SiteShell>;
}
