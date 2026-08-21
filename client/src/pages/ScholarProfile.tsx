import { ArrowLeft, ArrowUpRight, BookOpenCheck, BriefcaseBusiness, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import SiteShell, { useLanguage } from "@/components/SiteShell";
import { type LocalizedScholarText } from "@/data/scholars";
import { usePublishedScholar } from "@/data/scholarsApi";

function ProfileList({ title, items, language }: { title: string; items: LocalizedScholarText[]; language: "en" | "ur" }) {
  return (
    <section className="guidance-manuscript">
      <p className="reading-label text-[#075A9B]">{title}</p>
      <ul className={language === "ur" ? "mt-4 space-y-3 font-urdu text-lg leading-9 text-[#273951]" : "mt-4 space-y-3 font-sans text-sm leading-7 text-[#273951]"}>
        {items.map((item) => <li key={item.en} className="flex gap-3"><span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C89C46]" /> <span>{item[language]}</span></li>)}
      </ul>
    </section>
  );
}

export default function ScholarProfile() {
  const [, params] = useRoute("/scholars/:slug");
  const { scholar, loading } = usePublishedScholar(params?.slug || "");
  const { language } = useLanguage();
  const urdu = language === "ur";

  if (loading) {
    return <SiteShell><main className="grid min-h-[55vh] place-items-center bg-[#FBF9F3] px-5"><p className={urdu ? "font-urdu text-xl text-[#43536A]" : "font-sans text-sm text-[#43536A]"}>{urdu ? "پروفائل لوڈ ہو رہا ہے…" : "Loading scholar profile…"}</p></main></SiteShell>;
  }

  if (!scholar) {
    return <SiteShell><main className="grid min-h-[55vh] place-items-center bg-[#FBF9F3] px-5"><div className="text-center"><h1 className="font-display text-4xl text-[#10223A]">{urdu ? "پروفائل دستیاب نہیں" : "Scholar profile not found"}</h1><Link href="/scholars" className="mt-5 inline-block font-sans text-sm text-[#075A9B]">{urdu ? "علماء کی فہرست کی طرف واپس جائیں" : "Return to Scholars"}</Link></div></main></SiteShell>;
  }

  return (
    <SiteShell>
      <main className="bg-[#FBF9F3]">
        <section className="detail-hero px-5 py-12 sm:px-8 lg:py-18">
          <div className="detail-hero-pattern" />
          <div className="relative mx-auto max-w-5xl">
            <Link href="/scholars" className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#DCEBFF] transition hover:text-[#F2D792]"><ArrowLeft className="h-4 w-4" />{urdu ? "علماء کی فہرست" : "Scholars directory"}</Link>
            <div className="detail-hero-rule"><span>۞</span></div>
            <p className="detail-record-code">{scholar.designation[language]} · {scholar.organisation[language]}</p>
            <h1 className={urdu ? "detail-urdu-title" : "font-display text-5xl text-white sm:text-6xl"}>{scholar.name[language]}</h1>
            <p className={urdu ? "mt-4 max-w-3xl font-urdu text-xl leading-loose text-[#DCEBFF]" : "mt-4 max-w-3xl font-sans text-base leading-8 text-[#DCEBFF]"}>{scholar.shortIntroduction[language]}</p>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:py-16">
          <div className="fatwa-record-body mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_190px]">
            <article className="space-y-8">
              <section className="fatwa-reading">
                <p className="reading-label">{urdu ? "تعارف" : "Introduction"}</p>
                <p className={urdu ? "font-urdu text-xl leading-loose text-[#273951]" : "font-sans text-base leading-8 text-[#273951]"}>{scholar.introduction[language]}</p>
              </section>
              <section className="guidance-manuscript">
                <p className="reading-label text-[#075A9B]">{urdu ? "تعلیمی پس منظر" : "Educational background"}</p>
                <p className={urdu ? "mt-4 font-urdu text-xl leading-loose text-[#10223A]" : "mt-4 font-sans text-base leading-8 text-[#10223A]"}>{scholar.educationalBackground[language]}</p>
              </section>
              <ProfileList title={urdu ? "اسلامی تعلیم اور علمی اہلیت" : "Islamic education and scholarly qualifications"} items={scholar.islamicQualifications} language={language} />
              <ProfileList title={urdu ? "تخصصات" : "Areas of expertise"} items={scholar.areasOfExpertise} language={language} />
              <ProfileList title={urdu ? "دارالافتاء میں ذمہ داریاں" : "Responsibilities at the Darul Ifta"} items={scholar.responsibilities} language={language} />
              <ProfileList title={urdu ? "علمی خدمات اور رہنمائی" : "Services and guidance"} items={scholar.services} language={language} />
              {scholar.additionalInformation && <section className="border-l-4 border-[#C89C46] bg-white p-6 shadow-[0_10px_28px_rgba(29,43,66,.06)]"><p className={urdu ? "font-urdu text-xl leading-loose text-[#273951]" : "font-sans text-base leading-8 text-[#273951]"}>{scholar.additionalInformation[language]}</p></section>}
            </article>
            <aside className="fatwa-actions-panel h-fit">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#6C7B90]">{urdu ? "پروفائل" : "Profile"}</p>
              <div className="mt-3 grid gap-2">
                <Link href="/scholars" className="utility-button utility-button-primary"><BookOpenCheck className="h-4 w-4" />{urdu ? "تمام علماء" : "All scholars"}<ArrowUpRight className="ml-auto h-3.5 w-3.5" /></Link>
                <a href="/ask-fatwa" className="utility-button"><BriefcaseBusiness className="h-4 w-4" />{urdu ? "فتویٰ دریافت کریں" : "Ask a Fatwa"}</a>
              </div>
              <div className="mt-6 space-y-4 border-t border-[#E3DDD3] pt-5 text-[#68778A]">
                <div><Landmark className="h-5 w-5 text-[#C89C46]" /><p className="mt-2 font-sans text-[11px] leading-5">{scholar.organisation[language]}</p></div>
                <div><GraduationCap className="h-5 w-5 text-[#C89C46]" /><p className="mt-2 font-sans text-[11px] leading-5">{scholar.designation[language]}</p></div>
                <div><ShieldCheck className="h-5 w-5 text-[#C89C46]" /><p className="mt-2 font-sans text-[11px] leading-5">{urdu ? "عوامی رہنمائی قرآن و سنت اور معتبر فقہی اصولوں کی روشنی میں فراہم کی جاتی ہے۔" : "Public guidance is offered in the light of the Qur’an, Sunnah, and recognised fiqh principles."}</p></div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
