import { ArrowLeft, ArrowRight, ArrowUpRight, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { localizedPostValue } from "@/components/DailyPostContent";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { dailyPostsApi, useDailyPostCategories, type DailyPostPage } from "@/data/dailyPostsApi";

const emptyPage: DailyPostPage = { items: [], page: 1, pageSize: 9, total: 0 };

function formatDate(value: string | null, language: "ur" | "en") {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default function DailyPosts() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState<"newest" | "oldest">(params.get("sort") === "oldest" ? "oldest" : "newest");
  const [page, setPage] = useState(Math.max(1, Number(params.get("page")) || 1));
  const [result, setResult] = useState<DailyPostPage>(emptyPage);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { categories } = useDailyPostCategories();
  const text = urdu ? {
    eyebrow: "روزانہ پیغامات", title: "روزانہ اسلامی رہنمائی", description: "یاددہانیاں، اعلانات اور مفید اسلامی علم باوقار اور آسان مطالعے کے لیے مرتب کیا گیا ہے۔", search: "عنوان یا متن تلاش کریں", all: "تمام موضوعات", newest: "تازہ ترین", oldest: "قدیم ترین", read: "مکمل پوسٹ پڑھیں", noResults: "آپ کی تلاش کے مطابق کوئی روزانہ پیغام نہیں ملا۔", clear: "فلٹر صاف کریں", count: "پوسٹس", page: "صفحہ",
  } : {
    eyebrow: "DAILY POSTS", title: "Daily Islamic guidance", description: "Thoughtful reminders, announcements, and beneficial Islamic knowledge presented for clear everyday reading.", search: "Search titles and content", all: "All categories", newest: "Newest first", oldest: "Oldest first", read: "Read more", noResults: "No Daily Posts matched your search.", clear: "Clear filters", count: "posts", page: "Page",
  };
  const load = async (nextPage = page, nextQuery = query, nextCategory = category, nextSort = sort) => {
    setLoading(true); setFailed(false);
    try { setResult(await dailyPostsApi.list({ page: nextPage, pageSize: 9, q: nextQuery || undefined, category: nextCategory || undefined, sort: nextSort })); }
    catch { setFailed(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const updateLocation = (next: { page?: number; query?: string; category?: string; sort?: "newest" | "oldest" }) => {
    const values = new URLSearchParams();
    const nextQuery = next.query ?? query; const nextCategory = next.category ?? category; const nextSort = next.sort ?? sort; const nextPage = next.page ?? 1;
    if (nextQuery) values.set("q", nextQuery); if (nextCategory) values.set("category", nextCategory); if (nextSort === "oldest") values.set("sort", nextSort); if (nextPage > 1) values.set("page", String(nextPage));
    const suffix = values.toString(); setLocation(`/daily-posts${suffix ? `?${suffix}` : ""}`);
  };
  const submit = (event: React.FormEvent) => { event.preventDefault(); setPage(1); updateLocation({ page: 1 }); void load(1); };
  const clear = () => { setQuery(""); setCategory(""); setSort("newest"); setPage(1); setLocation("/daily-posts"); void load(1, "", "", "newest"); };
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  return <SiteShell><main>
    <section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">دارالافتاء ارشاد السائلین</p><h1 className={urdu ? "mt-5 font-urdu text-5xl leading-[1.45] text-white sm:text-7xl" : "mt-5 max-w-3xl font-display text-5xl leading-tight text-white sm:text-7xl"}>{text.title}</h1><p className={urdu ? "mt-5 max-w-2xl font-urdu text-xl leading-10 text-white/80" : "mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base"}>{text.description}</p></div></section>
    <section className="bg-[#FBF9F3] px-5 py-16 sm:px-8 lg:py-22"><div className="mx-auto max-w-[1240px]"><SectionHeading eyebrow={text.eyebrow} title={urdu ? "آج کا علمی انتخاب" : "Read the latest posts"} description={urdu ? "تلاش، موضوع اور تاریخ کے ذریعے مفید مواد تک رسائی حاصل کریں۔" : "Search by content, refine by category, and read published material at your own pace."} /><div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_auto]"><form onSubmit={submit} className="archive-search flex h-13 items-center gap-3 px-3"><Search className="h-5 w-5 shrink-0 text-[#075A9B]"/><input aria-label={text.search} value={query} onChange={event => setQuery(event.target.value)} placeholder={text.search} className="min-w-0 flex-1 bg-transparent font-sans text-sm text-[#10223A] outline-none placeholder:text-[#8792A4]"/>{query && <button type="button" onClick={() => setQuery("")} className="archive-clear-search" aria-label={text.clear}><X className="h-3.5 w-3.5"/></button>}<button type="submit" className="grid h-8 w-8 place-items-center text-[#075A9B]" aria-label={text.search}><ArrowUpRight className="h-4 w-4"/></button></form><label className="flex items-center gap-2 border border-[#D8D0C3] bg-white px-3"><Filter className="h-4 w-4 text-[#075A9B]"/><select value={category} onChange={event => { const value = event.target.value; setCategory(value); setPage(1); updateLocation({ category: value, page: 1 }); void load(1, query, value); }} className="min-w-0 bg-transparent py-3 font-sans text-sm text-[#273951] outline-none"><option value="">{text.all}</option>{categories.map(item => <option value={item.slug} key={item.id}>{urdu ? item.nameUr || item.nameAr || item.nameEn : item.nameEn}</option>)}</select></label><select value={sort} onChange={event => { const value = event.target.value as "newest" | "oldest"; setSort(value); setPage(1); updateLocation({ sort: value, page: 1 }); void load(1, query, category, value); }} className="border border-[#D8D0C3] bg-white px-3 py-3 font-sans text-sm text-[#273951] outline-none"><option value="newest">{text.newest}</option><option value="oldest">{text.oldest}</option></select></div>
      <div className="archive-result-bar mt-7" aria-live="polite"><span className="archive-result-count">{result.total} {text.count}</span>{(query || category || sort === "oldest") && <button type="button" onClick={clear} className="archive-empty-action">{text.clear}</button>}</div>
      {loading ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse border border-[#DED6C9] bg-white" />)}</div> : failed ? <div className="archive-empty-state mt-8"><p>{urdu ? "روزانہ پوسٹس ابھی دستیاب نہیں ہیں۔" : "Daily Posts are temporarily unavailable."}</p></div> : result.items.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{result.items.map(post => <article key={post.id} className="group flex min-h-[340px] flex-col border border-[#D8D0C3] bg-white shadow-[0_10px_28px_rgba(29,43,66,.06)]"><Link href={`/daily-posts/${post.slug}`} className="block">{post.featuredImageUrl ? <img src={post.featuredImageUrl} alt={localizedPostValue(post, "featuredImageAlt", language) || localizedPostValue(post, "title", language)} className="h-44 w-full object-cover" loading="lazy" /> : <div className="flex h-28 items-center justify-center bg-[#EAF0F5] font-urdu text-3xl text-[#C89C46]">۞</div>}</Link><div className="flex flex-1 flex-col p-6"><div className="flex flex-wrap items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[.13em] text-[#075A9B]"><span>{post.category ? (urdu ? post.category.nameUr || post.category.nameAr || post.category.nameEn : post.category.nameEn) : (urdu ? "عمومی" : "General")}</span><span className="text-[#B69A63]">•</span><span>{formatDate(post.publishedAt, language)}</span></div><h2 className={urdu ? "mt-4 font-urdu text-3xl leading-[1.55] text-[#10223A]" : "mt-4 font-display text-3xl leading-tight text-[#10223A]"}><Link href={`/daily-posts/${post.slug}`}>{localizedPostValue(post, "title", language)}</Link></h2><p className={urdu ? "mt-4 line-clamp-3 font-urdu text-lg leading-8 text-[#52627A]" : "mt-4 line-clamp-3 font-sans text-sm leading-7 text-[#52627A]"}>{localizedPostValue(post, "excerpt", language) || localizedPostValue(post, "content", language)}</p><Link href={`/daily-posts/${post.slug}`} className="mt-auto inline-flex items-center gap-2 pt-6 font-sans text-xs font-bold uppercase tracking-[.13em] text-[#075A9B] transition hover:text-[#C89C46]">{text.read}<ArrowUpRight className="h-4 w-4"/></Link></div></article>)}</div> : <div className="archive-empty-state mt-8"><p>{text.noResults}</p><button type="button" onClick={clear} className="archive-empty-action">{text.clear}</button></div>}
      {totalPages > 1 && <nav className="mt-10 flex items-center justify-center gap-4" aria-label={urdu ? "صفحہ بندی" : "Pagination"}><button type="button" onClick={() => { const next = Math.max(1, result.page - 1); setPage(next); updateLocation({ page: next }); void load(next); }} disabled={result.page <= 1} className="border border-[#C9C0B3] p-3 text-[#075A9B] disabled:opacity-40">{urdu ? <ArrowRight className="h-4 w-4"/> : <ArrowLeft className="h-4 w-4"/>}</button><span className="font-sans text-sm text-[#52627A]">{text.page} {result.page} / {totalPages}</span><button type="button" onClick={() => { const next = Math.min(totalPages, result.page + 1); setPage(next); updateLocation({ page: next }); void load(next); }} disabled={result.page >= totalPages} className="border border-[#C9C0B3] p-3 text-[#075A9B] disabled:opacity-40">{urdu ? <ArrowLeft className="h-4 w-4"/> : <ArrowRight className="h-4 w-4"/>}</button></nav>}
    </div></section>
  </main></SiteShell>;
}
