import { BookOpenCheck, LockKeyhole, Scale, ShieldCheck } from "lucide-react";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { ContextualEmailCard, OfficialEmailCallout } from "@/components/OfficialEmailCallout";
import { trpc } from "@/lib/trpc";

export default function Methodology() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const policies = trpc.publicTrust.policies.useQuery();
  const managed = Object.fromEntries((policies.data ?? []).map(policy => [policy.settingKey, policy.value as { titleEn?: string; titleUr?: string; bodyEn?: string; bodyUr?: string }]));
  const policy = (key: string, fallbackTitle: string, fallbackText: string) => ({ title: (urdu ? managed[`policy.${key}`]?.titleUr : managed[`policy.${key}`]?.titleEn) || fallbackTitle, text: (urdu ? managed[`policy.${key}`]?.bodyUr : managed[`policy.${key}`]?.bodyEn) || fallbackText });
  const copy = urdu ? {
    eyebrow: "رہنما اصول", title: "منہج، امانت اور شرعی رہنمائی", intro: "دارالافتاء میں ہر سوال کو اس کے مکمل حالات، مستند شرعی مصادر اور اہلِ علم کی ذمہ دارانہ تحقیق کے ساتھ دیکھا جاتا ہے۔", methodology: "فقہی منہج", methodText: "کسی فتویٰ کے فہم کے لیے اس کا پورا سوال، حالات اور اصل تحریر ضروری ہیں۔ ادارے کا تفصیلی فقہی منہج اور نسبتیں مجاز مفتیانِ کرام کی نگرانی میں شائع کی جائیں گی۔", privacy: "رازداری", privacyText: "ذاتی سوالات، رابطے کی تفصیل اور نجی دستاویزات صرف مجاز علمی عملے کے لیے ہیں۔ عوامی فتویٰ کسی ذاتی شناخت یا غیر ضروری نجی معلومات کے بغیر شائع کیا جاتا ہے۔", guidance: "رہنمائی کا دائرہ", guidanceText: "شائع شدہ فتاویٰ عمومی علمی رہنمائی کے لیے ہیں۔ نزاعی، قانونی، طبی، مالی یا انتہائی ذاتی معاملات میں مکمل تفصیل کے ساتھ براہِ راست کسی مجاز مفتی سے رجوع کریں۔", publishing: "اشاعت کا معیار", publishingText: "ہر عوامی اندراج علمی مسودہ، داخلی نظرِ ثانی اور مجاز منظوری کے بعد شائع ہونے کے لیے تیار کیا گیا ہے۔", cta: "اپنا سوال جمع کروائیں",
  } : {
    eyebrow: "TRUST & METHOD", title: "Methodology, privacy, and responsible guidance", intro: "Every Darul Ifta enquiry should be considered with its full circumstances, recognised scholarly sources, and accountable review by qualified scholars.", methodology: "Fiqh methodology", methodText: "A Fatwa must be read with its complete question, factual context, and original text. The institution’s detailed methodological statement and scholarly affiliations will be published under authorised Mufti supervision.", privacy: "Confidentiality", privacyText: "Private questions, contact details, and attachments are visible only to authorised scholarly staff. A published Fatwa must exclude identifying or unnecessary private information.", guidance: "Scope of guidance", guidanceText: "Published Fatwas offer general scholarly guidance. For contested, legal, medical, financial, or deeply personal matters, consult an authorised Mufti directly with the complete circumstances.", publishing: "Publication standard", publishingText: "Each public record is designed to pass scholarly drafting, internal review, and authorised approval before publication.", cta: "Submit a private question",
  };

  const managedMethodology = policy("methodology", copy.methodology, copy.methodText);
  const managedPrivacy = policy("privacy", copy.privacy, copy.privacyText);
  const managedGuidance = policy("guidance", copy.guidance, copy.guidanceText);
  const managedPublication = policy("publication", copy.publishing, copy.publishingText);

  const cards = [
    [Scale, managedMethodology.title, managedMethodology.text],
    [LockKeyhole, managedPrivacy.title, managedPrivacy.text],
    [ShieldCheck, managedGuidance.title, managedGuidance.text],
    [BookOpenCheck, managedPublication.title, managedPublication.text],
  ] as const;

  return <SiteShell><main><OfficialEmailCallout />
    <section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">دارالافتاء ارشاد السائلین</p><h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight text-white sm:text-7xl">{copy.title}</h1><p className="mt-5 max-w-3xl font-sans text-sm leading-7 text-white/70 sm:text-base">{copy.intro}</p></div></section>
    <section className="bg-[#FBF9F3] px-5 py-16 sm:px-8 lg:py-22"><div className="mx-auto max-w-[1240px]"><SectionHeading eyebrow={copy.eyebrow} title={urdu ? "اعتماد کے اصول" : "Principles that protect trust"} description={urdu ? "یہ اصول عوامی مطالعے، سوال جمع کروانے اور علمی اشاعت کے لیے رہنما ہیں۔" : "These principles guide public reading, private question intake, and scholarly publication."} /><div className="mt-10 grid gap-5 md:grid-cols-2">{cards.map(([Icon, title, text]) => <article key={title} className="border border-[#E2D8C4] bg-white p-7 shadow-[0_14px_34px_rgba(19,39,73,.07)]"><div className="grid h-11 w-11 place-items-center bg-[#061A34] text-[#E9D4A2]"><Icon className="h-5 w-5" /></div><h2 className="mt-5 font-display text-2xl text-[#10223A]">{title}</h2><p className="mt-3 font-sans text-sm leading-7 text-[#52627A]">{text}</p></article>)}</div><div className="mt-10 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6"><p className="font-sans text-sm leading-7 text-[#34465F]">{urdu ? "اہم اعلان: یہ مواد عمومی معلومات اور شرعی رہنمائی کے لیے ہے؛ کسی عدالتی، طبی، مالی یا قابلِ نزاع معاملے کا خودکار یا حتمی فیصلہ نہیں۔" : "Important: this content is for general scholarly guidance. It is not an automated or final determination for a legal, medical, financial, or disputed matter."}</p><a href="/ask-fatwa" className="mt-5 inline-flex items-center gap-2 bg-[#0A397A] px-5 py-3 font-sans text-xs font-bold text-white transition hover:bg-[#061A34]"><BookOpenCheck className="h-4 w-4" />{copy.cta}</a></div><ContextualEmailCard className="mt-8" /></div></section>
  </main></SiteShell>;
}
