import { ArrowUpRight, BadgeCheck, BookOpenCheck } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { usePublishedScholars } from "@/data/scholarsApi";

export default function Scholars() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const { scholars, loading, failed } = usePublishedScholars();

  return (
    <SiteShell>
      <main className="bg-[#FBF9F3]">
        <section className="detail-hero px-5 py-12 sm:px-8 lg:py-18">
          <div className="detail-hero-pattern" />
          <div className="relative mx-auto max-w-5xl">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D792]">{urdu ? "دارالافتاء ارشاد السائلین کراچی" : "DARUL IFTA IRSHAD-US-SAILEEN KARACHI"}</p>
            <div className="detail-hero-rule"><span>۞</span></div>
            <h1 className={urdu ? "detail-urdu-title" : "font-display text-5xl text-white sm:text-6xl"}>{urdu ? "علماء کرام" : "Our Scholars"}</h1>
            <p className={urdu ? "mt-4 max-w-3xl font-urdu text-xl leading-loose text-[#DCEBFF]" : "mt-4 max-w-3xl font-sans text-base leading-8 text-[#DCEBFF]"}>
              {urdu ? "دارالافتاء ارشاد السائلین کراچی سے وابستہ علماء و مفتیانِ کرام سے تعارف اور ان کی علمی خدمات کا خلاصہ۔" : "Meet the scholars associated with Darul Ifta Irshad-us-Saileen Karachi and explore their scholarly service."}
            </p>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:py-18">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow={urdu ? "علمی رہنمائی" : "SCHOLARLY GUIDANCE"}
              title={urdu ? "ذمہ دار علمی خدمت" : "A directory of scholarly service"}
              description={urdu ? "ہر پروفائل میں تعارف، تخصصات، ذمہ داریاں اور دارالافتاء کے ساتھ علمی خدمات کو مرتب انداز میں پیش کیا گیا ہے۔" : "Each profile presents a clear introduction, areas of expertise, responsibilities, and service to the Darul Ifta."}
            />
            {loading && !scholars.length && <div className="scholar-loading-grid mt-10" aria-live="polite" aria-label={urdu ? "علماء کے پروفائل لوڈ ہو رہے ہیں" : "Loading scholar profiles"}>{Array.from({ length: 3 }, (_, index) => <div key={index} className="scholar-skeleton"><span /><span /><span /><span /></div>)}</div>}
            {!!scholars.length && <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {scholars.map((scholar, index) => (
                <article key={scholar.slug} className="group flex min-h-[315px] flex-col border border-[#D8D0C3] bg-white p-6 shadow-[0_12px_34px_rgba(29,43,66,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#C89C46] hover:shadow-[0_18px_42px_rgba(21,47,85,.13)] sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <span className="font-display text-5xl leading-none text-[#D7E0EA]">0{index + 1}</span>
                    <BadgeCheck className="h-6 w-6 shrink-0 text-[#C89C46]" aria-hidden="true" />
                  </div>
                  <p className="mt-8 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#075A9B]">{scholar.designation[language]}</p>
                  <h2 className={urdu ? "mt-3 font-urdu text-3xl leading-[1.55] text-[#10223A]" : "mt-3 font-display text-3xl leading-tight text-[#10223A]"}>{scholar.name[language]}</h2>
                  <p className={urdu ? "mt-4 font-urdu text-lg leading-9 text-[#52627A]" : "mt-4 font-sans text-sm leading-7 text-[#52627A]"}>{scholar.shortIntroduction[language]}</p>
                  <Link href={`/scholars/${scholar.slug}`} className="mt-auto inline-flex items-center gap-2 pt-7 font-sans text-xs font-bold uppercase tracking-[0.13em] text-[#075A9B] transition hover:text-[#C89C46]">
                    {urdu ? "پروفائل دیکھیں" : "View profile"}<ArrowUpRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>}
            {!loading && !scholars.length && (
              <div className="scholar-empty-state mt-10" role="status">
                <BookOpenCheck className="mx-auto h-8 w-8 text-[#C89C46]" />
                <p className={urdu ? "mt-4 font-urdu text-xl text-[#43536A]" : "mt-4 font-sans text-sm text-[#43536A]"}>{failed ? (urdu ? "علماء کے ریکارڈ اس وقت دستیاب نہیں ہیں۔" : "Scholar records are temporarily unavailable.") : (urdu ? "جلد علماء کے پروفائل یہاں دستیاب ہوں گے۔" : "Scholar profiles will be available here soon.")}</p>
                <p className="mt-2 font-sans text-xs leading-6 text-[#68778A]">{urdu ? "براہِ کرم کچھ دیر بعد دوبارہ کوشش کریں۔" : "Please try again in a moment."}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
