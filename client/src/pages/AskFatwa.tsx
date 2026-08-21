import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Paperclip, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";

const officialEmail = "ask.darulifa.irshadussaaileen@gmail.com";

type RequestDraft = { name: string; phone: string; email: string; languagePreference: string; title: string; category: string; details: string };
const initialDraft: RequestDraft = { name: "", phone: "", email: "", languagePreference: "English", title: "", category: "Worship", details: "" };

export default function AskFatwa() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [draft, setDraft] = useState<RequestDraft>(initialDraft);
  const [draftOpened, setDraftOpened] = useState(false);
  const update = (field: keyof RequestDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `Name: ${draft.name}`,
      `WhatsApp / Phone: ${draft.phone}`,
      `Email: ${draft.email || "Not provided"}`,
      `Language preference: ${draft.languagePreference}`,
      `Category: ${draft.category}`,
      "",
      "Question:",
      draft.details,
      "",
      "Please note: attachments cannot be included through this form. Please reply to this email or coordinate by WhatsApp if a file is needed.",
    ].join("\n");
    window.location.href = `mailto:${officialEmail}?subject=${encodeURIComponent(`Fatwa request: ${draft.title}`)}&body=${encodeURIComponent(body)}`;
    setDraftOpened(true);
    toast.success(urdu ? "ای میل کا مسودہ تیار کر دیا گیا ہے" : "An email draft has been opened");
  };

  const languageOptions = urdu ? ["اردو", "English"] : ["English", "Urdu"];
  const categories = urdu ? ["عبادات", "معاملات", "نکاح و طلاق", "وراثت", "تجارت", "معاشرت", "عقائد", "دیگر"] : ["Worship", "Transactions", "Marriage & Divorce", "Inheritance", "Business", "Social Matters", "Beliefs", "Other"];

  return <SiteShell><main className="bg-[#FBF9F3]"><section className="page-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">اپنا سوال پیش کریں</p><h1 className="mt-5 font-display text-5xl text-white sm:text-7xl">{urdu ? "شرعی رہنمائی کی درخواست" : "Request scholarly guidance"}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{urdu ? "یہ فارم آپ کے سرکاری ای میل میں سوال کا مسودہ تیار کرتا ہے؛ جواب خودکار یا فوری نہیں ہوتا۔" : "This form prepares a draft in your email client; guidance is not automated or instant."}</p></div></section>
    <section className="relative px-5 py-14 sm:px-8 lg:py-20"><div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[0.75fr_1.25fr]"><aside><SectionHeading eyebrow={urdu ? "اہم اطلاع" : "IMPORTANT NOTICE"} title={urdu ? "تحقیق کے ساتھ رہنمائی" : "Guidance with due care"} /><div className="mt-7 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6"><ShieldCheck className="h-6 w-6 text-[#075A9B]" /><p className="mt-4 font-sans text-sm leading-7 text-[#334B65]">{urdu ? "فتویٰ شرعی رہنمائی کے لیے ہے۔ حتمی جواب متعلقہ مفتی صاحب کی تحقیق اور تصدیق کے بعد جاری کیا جاتا ہے۔" : "A fatwa is issued for Islamic guidance. A final response is provided only after a relevant qualified mufti has researched and verified the request."}</p></div><div className="mt-7 rounded-sm bg-[#08284C] p-6 text-white"><MessageCircle className="h-5 w-5 text-[#E9D4A2]" /><p className="mt-3 font-urdu text-xl text-white">{urdu ? "فوری رابطے کے لیے واٹس ایپ" : "For a prompt contact route"}</p><a href="https://wa.me/923332617671" target="_blank" rel="noreferrer" className="mt-3 inline-flex font-sans text-sm text-[#E9D4A2]">+92 333 2617671</a><a href={`mailto:${officialEmail}`} className="mt-3 flex items-center gap-2 break-all font-sans text-xs text-[#E9D4A2]"><Mail className="h-4 w-4" />{officialEmail}</a></div></aside>
      <form onSubmit={submit} className="form-chamber">{draftOpened && <div className="mb-6 border-l-4 border-[#075A9B] bg-[#EEF3F8] p-4"><p className="font-sans text-sm font-semibold text-[#10223A]">{urdu ? "ای میل کا مسودہ تیار ہو گیا ہے" : "Your email draft is ready"}</p><p className="mt-1 font-sans text-xs leading-6 text-[#52627A]">{urdu ? "درخواست صرف ای میل بھیجنے کے بعد موصول ہو گی۔" : "Your request is received only after you send that email."}</p></div>}<div className="form-seal"><span>✦</span><span>{urdu ? "شعبۂ شرعی رہنمائی" : "SCHOLARLY GUIDANCE DESK"}</span><span>✦</span></div><div className="mb-8 border-b border-[#D8C898] pb-6"><p className="font-urdu text-2xl text-[#10223A]">{urdu ? "فتویٰ دریافت کریں" : "Ask a Fatwa"}</p><p className="mt-2 font-sans text-xs leading-6 text-[#6B788A]">{urdu ? "ستارے والے خانے ضروری ہیں۔" : "Fields marked with an asterisk are required."}</p></div><div className="grid gap-5 sm:grid-cols-2"><Field label={urdu ? "نام" : "Name"} value={draft.name} onChange={(value) => update("name", value)} required /><Field label={urdu ? "واٹس ایپ / فون" : "WhatsApp / Phone"} value={draft.phone} onChange={(value) => update("phone", value)} required type="tel" /><Field label={urdu ? "ای میل (اختیاری)" : "Email (optional)"} value={draft.email} onChange={(value) => update("email", value)} type="email" /><Field label={urdu ? "زبان کی ترجیح" : "Language preference"} value={draft.languagePreference} onChange={(value) => update("languagePreference", value)} select options={languageOptions} /><Field label={urdu ? "سوال کا عنوان" : "Question title"} value={draft.title} onChange={(value) => update("title", value)} required full /><Field label={urdu ? "زمرہ" : "Category"} value={draft.category} onChange={(value) => update("category", value)} select required options={categories} full /><label className="sm:col-span-2"><span className="form-label">{urdu ? "تفصیلی سوال *" : "Detailed question *"}</span><textarea required rows={7} value={draft.details} onChange={(event) => update("details", event.target.value)} className="form-control resize-y" placeholder={urdu ? "براہِ کرم صورتحال کی ضروری تفصیلات لکھیں…" : "Please provide the relevant circumstances and details…"} /></label><div className="sm:col-span-2 flex gap-3 border border-dashed border-[#BFC9D4] bg-white/60 px-4 py-4 text-sm text-[#647188]"><Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-[#075A9B]" /><p>{urdu ? "فائل منسلک کرنے کی ضرورت ہو تو پہلے ای میل بھیجیں یا واٹس ایپ کے ذریعے رابطہ کریں؛ اس فارم سے فائل خودکار طور پر نہیں بھیجی جاتی۔" : "If a file is needed, first send the email draft or coordinate through WhatsApp; attachments are not transmitted automatically through this form."}</p></div></div><button type="submit" className="mt-8 inline-flex items-center gap-2 bg-[#075A9B] px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#08284C] active:scale-[0.98]"><Send className="h-4 w-4" />{urdu ? "ای میل کا مسودہ تیار کریں" : "Prepare email draft"}</button></form></div></section>
  </main></SiteShell>;
}

function Field({ label, value, onChange, required, type = "text", select, options = [], full = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; select?: boolean; options?: string[]; full?: boolean }) {
  return <label className={full ? "sm:col-span-2" : ""}><span className="form-label">{label}{required && " *"}</span>{select ? <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="form-control">{options.map((option) => <option key={option}>{option}</option>)}</select> : <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="form-control" />}</label>;
}
