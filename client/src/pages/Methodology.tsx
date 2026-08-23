import { BookOpenCheck, Mail, Scale, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";

const officialEmail = "ask.darulifa.irshadussaaileen@gmail.com";

export default function Methodology() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const principles = urdu
    ? [
        { id: "quran-sunnah", index: "01", title: "قرآن و سنت", detail: "رہنمائی قرآنِ کریم، سنتِ نبوی اور معتبر فقہی اصولوں کی روشنی میں مرتب کی جاتی ہے۔" },
        { id: "scholarly-care", index: "02", title: "علمی احتیاط", detail: "ہر سوال کا جواب اس کے متعلقہ حالات اور ضروری معلومات کو سامنے رکھ کر دیا جاتا ہے۔" },
        { id: "confidentiality", index: "03", title: "رازداری", detail: "ذاتی اور حساس سوالات کو ذمہ داری اور رازداری کے ساتھ دیکھا جاتا ہے۔" },
      ]
    : [
        { id: "quran-sunnah", index: "01", title: "Qur’an and Sunnah", detail: "Guidance is prepared in light of the Qur’an, Prophetic Sunnah, and recognised fiqh principles." },
        { id: "scholarly-care", index: "02", title: "Scholarly care", detail: "Each question is considered in its relevant circumstances and with the information needed for responsible guidance." },
        { id: "confidentiality", index: "03", title: "Confidentiality", detail: "Personal and sensitive questions are handled with care and appropriate confidentiality." },
      ];

  return (
    <SiteShell>
      <main className="methodology-page bg-[#FBF9F3]">
        <section className="page-hero methodology-hero">
          <div className="page-hero-pattern" />
          <div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24">
            <p className="font-urdu text-xl text-[#E9D4A2]">منہجِ رہنمائی</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl text-white sm:text-7xl">{urdu ? "اعتماد، احتیاط اور علمی ذمہ داری" : "Guidance with care and responsibility"}</h1>
            <p className="mt-5 max-w-3xl font-sans text-sm leading-7 text-white/75 sm:text-base">{urdu ? "دارالافتاء کی عمومی رہنمائی کے اصول اور سوالات کے جائزے کا ذمہ دارانہ طریقہ۔" : "The Darul Ifta’s public principles for considered guidance and the responsible review of questions."}</p>
            <div className="methodology-hero-meta"><span>{urdu ? "مطالعہ کا وقت" : "Reading time"}</span><span>·</span><span>{urdu ? "علمی رہنمائی" : "Scholarly guidance"}</span></div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:py-22">
          <div className="methodology-reading-grid mx-auto max-w-[1360px]">
            <aside className="methodology-index-shell">
              <details className="methodology-index" open>
                <summary>{urdu ? "اس صفحے میں" : "On this page"}</summary>
                <nav aria-label={urdu ? "منہج کے حصے" : "Methodology sections"}>
                  {principles.map((principle) => <a key={principle.id} href={`#${principle.id}`}><span>{principle.index}</span><span>{principle.title}</span></a>)}
                  <a href="#important-note"><span>✦</span><span>{urdu ? "اہم وضاحت" : "Important clarification"}</span></a>
                </nav>
              </details>
              <p className="methodology-index-note">{urdu ? "سوال کے مخصوص حالات میں اہلِ علم سے براہِ راست رجوع ضروری ہے۔" : "Individual circumstances require direct consultation with qualified scholars."}</p>
            </aside>

            <article className="methodology-publication" lang={language} dir={urdu ? "rtl" : "ltr"}>
              <SectionHeading eyebrow={urdu ? "اصول" : "PRINCIPLES"} title={urdu ? "علمی رہنمائی کا طریقہ" : "A careful path to guidance"} description={urdu ? "یہ صفحہ عمومی معلومات کے لیے ہے۔ مخصوص معاملات میں تفصیل اور متعلقہ حالات کی بنیاد پر علمی تحقیق ضروری ہوتی ہے۔" : "This page explains general practice. Individual matters require appropriate detail and scholarly review in their particular circumstances."} />
              <div className="methodology-principles mt-10">
                {principles.map((principle) => <section key={principle.id} id={principle.id} className="methodology-principle scroll-mt-36"><div className="methodology-principle-index">{principle.index}</div><div><p className="methodology-principle-kicker">{urdu ? "رہنمائی کا اصول" : "Guiding principle"}</p><h2 className={urdu ? "font-urdu" : "font-display"}>{principle.title}</h2><p>{principle.detail}</p></div></section>)}
              </div>
            </article>

            <aside className="methodology-reference-column">
              <div id="important-note" className="methodology-reference-card scroll-mt-36"><Scale className="h-7 w-7 text-[#B88A43]" /><p className="methodology-reference-label">{urdu ? "وضاحت" : "Clarification"}</p><h2 className={urdu ? "font-urdu" : "font-display"}>{urdu ? "اہم وضاحت" : "Important clarification"}</h2><p>{urdu ? "ویب سائٹ پر موجود مواد عمومی شرعی رہنمائی کے لیے ہے۔ پیچیدہ، قانونی، طبی یا فوری حفاظتی معاملات میں متعلقہ ماہر اور اہلِ علم سے براہِ راست رجوع کریں۔" : "Website material is offered as general Islamic guidance. For complex legal, medical, or urgent safety matters, consult the appropriate qualified professional and scholar directly."}</p></div>
              <div className="methodology-contact-card"><ShieldCheck className="h-6 w-6 text-[#E9D4A2]" /><p className="methodology-reference-label text-[#E9D4A2]">{urdu ? "رازداری" : "Confidentiality"}</p><h2 className={urdu ? "font-urdu" : "font-display"}>{urdu ? "رازداری کے ساتھ سوال بھیجیں" : "Send a question in confidence"}</h2><p>{urdu ? "جواب کی درخواست یا ادارہ جاتی رابطے کے لیے سرکاری ای میل استعمال کریں۔" : "Use the official email for a guidance request or institutional correspondence."}</p><a href={`mailto:${officialEmail}`} className="methodology-email"><Mail className="h-4 w-4" />{officialEmail}</a><Link href="/ask-fatwa" className="methodology-question-link"><BookOpenCheck className="h-4 w-4" />{urdu ? "سوال کا خاکہ تیار کریں" : "Prepare a question"}</Link></div>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
