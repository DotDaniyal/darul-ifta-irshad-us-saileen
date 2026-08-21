import { BookOpenCheck, Mail, Scale, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";

const officialEmail = "ask.darulifa.irshadussaaileen@gmail.com";

export default function Methodology() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const principles = urdu
    ? [
        ["قرآن و سنت", "رہنمائی قرآنِ کریم، سنتِ نبوی اور معتبر فقہی اصولوں کی روشنی میں مرتب کی جاتی ہے۔"],
        ["علمی احتیاط", "ہر سوال کا جواب اس کے متعلقہ حالات اور ضروری معلومات کو سامنے رکھ کر دیا جاتا ہے۔"],
        ["رازداری", "ذاتی اور حساس سوالات کو ذمہ داری اور رازداری کے ساتھ دیکھا جاتا ہے۔"],
      ]
    : [
        ["Qur’an and Sunnah", "Guidance is prepared in light of the Qur’an, Prophetic Sunnah, and recognised fiqh principles."],
        ["Scholarly care", "Each question is considered in its relevant circumstances and with the information needed for responsible guidance."],
        ["Confidentiality", "Personal and sensitive questions are handled with care and appropriate confidentiality."],
      ];

  return (
    <SiteShell>
      <main className="bg-[#FBF9F3]">
        <section className="page-hero">
          <div className="page-hero-pattern" />
          <div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24">
            <p className="font-urdu text-xl text-[#E9D4A2]">منہجِ رہنمائی</p>
            <h1 className="mt-5 font-display text-5xl text-white sm:text-7xl">{urdu ? "اعتماد، احتیاط اور علمی ذمہ داری" : "Guidance with care and responsibility"}</h1>
            <p className="mt-5 max-w-3xl font-sans text-sm leading-7 text-white/75 sm:text-base">{urdu ? "دارالافتاء کی عمومی رہنمائی کے اصول اور سوالات کے جائزے کا ذمہ دارانہ طریقہ۔" : "The Darul Ifta’s public principles for considered guidance and the responsible review of questions."}</p>
          </div>
        </section>
        <section className="px-5 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.88fr_1.12fr]">
            <div>
              <SectionHeading eyebrow={urdu ? "اصول" : "PRINCIPLES"} title={urdu ? "علمی رہنمائی کا طریقہ" : "A careful path to guidance"} description={urdu ? "یہ صفحہ عمومی معلومات کے لیے ہے۔ مخصوص معاملات میں تفصیل اور متعلقہ حالات کی بنیاد پر علمی تحقیق ضروری ہوتی ہے۔" : "This page explains general practice. Individual matters require appropriate detail and scholarly review in their particular circumstances."} />
              <div className="mt-8 grid gap-4">
                {principles.map(([title, detail], index) => <article key={title} className="border-l-4 border-[#C89C46] bg-white p-6 shadow-[0_10px_28px_rgba(12,29,53,.06)]"><p className="font-display text-3xl text-[#075A9B]">0{index + 1}</p><h2 className={urdu ? "mt-3 font-urdu text-2xl text-[#10223A]" : "mt-3 font-display text-2xl text-[#10223A]"}>{title}</h2><p className="mt-3 font-sans text-sm leading-7 text-[#52627A]">{detail}</p></article>)}
              </div>
            </div>
            <aside className="h-fit space-y-5 lg:pt-3">
              <div className="border border-[#D8C898] bg-[#FFFDF7] p-7"><Scale className="h-7 w-7 text-[#C89C46]" /><h2 className={urdu ? "mt-5 font-urdu text-3xl text-[#10223A]" : "mt-5 font-display text-3xl text-[#10223A]"}>{urdu ? "اہم وضاحت" : "Important clarification"}</h2><p className="mt-4 font-sans text-sm leading-7 text-[#52627A]">{urdu ? "ویب سائٹ پر موجود مواد عمومی شرعی رہنمائی کے لیے ہے۔ پیچیدہ، قانونی، طبی یا فوری حفاظتی معاملات میں متعلقہ ماہر اور اہلِ علم سے براہِ راست رجوع کریں۔" : "Website material is offered as general Islamic guidance. For complex legal, medical, or urgent safety matters, consult the appropriate qualified professional and scholar directly."}</p></div>
              <div className="bg-[#08284C] p-7 text-white"><ShieldCheck className="h-6 w-6 text-[#E9D4A2]" /><h2 className={urdu ? "mt-4 font-urdu text-2xl" : "mt-4 font-display text-3xl"}>{urdu ? "رازداری کے ساتھ سوال بھیجیں" : "Send a question in confidence"}</h2><p className="mt-3 font-sans text-sm leading-7 text-white/72">{urdu ? "جواب کی درخواست یا ادارہ جاتی رابطے کے لیے سرکاری ای میل استعمال کریں۔" : "Use the official email for a guidance request or institutional correspondence."}</p><a href={`mailto:${officialEmail}`} className="mt-5 inline-flex items-center gap-2 border border-[#E9D4A2]/60 px-4 py-3 font-sans text-xs font-bold text-[#FFE2A0] transition hover:bg-white/10"><Mail className="h-4 w-4" />{officialEmail}</a><Link href="/ask-fatwa" className="mt-4 inline-flex items-center gap-2 font-sans text-xs font-bold text-white transition hover:text-[#E9D4A2]"><BookOpenCheck className="h-4 w-4" />{urdu ? "سوال کا خاکہ تیار کریں" : "Prepare a question"}</Link></div>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
