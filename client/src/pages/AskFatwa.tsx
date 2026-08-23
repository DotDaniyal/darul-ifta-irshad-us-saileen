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
    const mailtoUrl = `mailto:${officialEmail}?subject=${encodeURIComponent(`Fatwa request: ${draft.title}`)}&body=${encodeURIComponent(body)}`;
    setDraftOpened(true);
    toast.success(urdu ? "ای میل کا مسودہ تیار کر دیا گیا ہے" : "An email draft has been opened");
    window.setTimeout(() => { window.location.href = mailtoUrl; }, 0);
  };

  const languageOptions = urdu ? ["اردو", "English"] : ["English", "Urdu"];
  const categories = urdu ? ["عبادات", "معاملات", "نکاح و طلاق", "وراثت", "تجارت", "معاشرت", "عقائد", "دیگر"] : ["Worship", "Transactions", "Marriage & Divorce", "Inheritance", "Business", "Social Matters", "Beliefs", "Other"];

  return <SiteShell><main className="ask-fatwa-page bg-[#FBF9F3]"><section className="page-hero ask-fatwa-hero"><div className="page-hero-pattern" /><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">اپنا سوال پیش کریں</p><h1 className="mt-5 font-display text-5xl text-white sm:text-7xl">{urdu ? "شرعی رہنمائی کی درخواست" : "Request scholarly guidance"}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{urdu ? "یہ فارم آپ کے سرکاری ای میل میں سوال کا مسودہ تیار کرتا ہے؛ جواب خودکار یا فوری نہیں ہوتا۔" : "This form prepares a draft in your email client; guidance is not automated or instant."}</p><div className="ask-hero-trust"><span>{urdu ? "رازداری" : "Confidentiality"}</span><span>·</span><span>{urdu ? "تحقیق" : "Review"}</span><span>·</span><span>{urdu ? "رہنمائی" : "Guidance"}</span></div></div></section>
    <section className="relative px-5 py-14 sm:px-8 lg:py-20"><div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.72fr_1.28fr]"><aside className="ask-guidance-sidebar"><SectionHeading eyebrow={urdu ? "اہم اطلاع" : "IMPORTANT NOTICE"} title={urdu ? "تحقیق کے ساتھ رہنمائی" : "Guidance with due care"} /><div className="ask-trust-note mt-7"><ShieldCheck className="h-6 w-6 text-[#0B6756]" /><p>{urdu ? "فتویٰ شرعی رہنمائی کے لیے ہے۔ حتمی جواب متعلقہ مفتی صاحب کی تحقیق اور تصدیق کے بعد جاری کیا جاتا ہے۔" : "A fatwa is issued for Islamic guidance. A final response is provided only after a relevant qualified mufti has researched and verified the request."}</p></div><div className="ask-contact-route mt-5"><MessageCircle className="h-5 w-5 text-[#E9D4A2]" /><p className="mt-3 font-urdu text-xl text-white">{urdu ? "فوری رابطے کے لیے واٹس ایپ" : "For a prompt contact route"}</p><a href="https://wa.me/923332617671" target="_blank" rel="noreferrer" className="mt-3 inline-flex font-sans text-sm text-[#E9D4A2]">+92 333 2617671</a><a href={`mailto:${officialEmail}`} className="mt-3 flex items-center gap-2 break-all font-sans text-xs text-[#E9D4A2]"><Mail className="h-4 w-4" />{officialEmail}</a></div></aside>
      <form onSubmit={submit} className="form-chamber ask-fatwa-form">{draftOpened && <div className="ask-success-notice mb-6" role="status"><p className="font-sans text-sm font-semibold text-[#10223A]">{urdu ? "ای میل کا مسودہ تیار ہو گیا ہے" : "Your email draft is ready"}</p><p className="mt-1 font-sans text-xs leading-6 text-[#52627A]">{urdu ? "درخواست صرف ای میل بھیجنے کے بعد موصول ہو گی۔" : "Your request is received only after you send that email."}</p></div>}<div className="form-seal"><span>✦</span><span>{urdu ? "شعبۂ شرعی رہنمائی" : "SCHOLARLY GUIDANCE DESK"}</span><span>✦</span></div><div className="ask-form-heading"><div><p className="font-urdu text-2xl text-[#10223A]">{urdu ? "فتویٰ دریافت کریں" : "Ask a Fatwa"}</p><p className="mt-2 font-sans text-xs leading-6 text-[#6B788A]">{urdu ? "ستارے والے خانے ضروری ہیں۔" : "Fields marked with an asterisk are required."}</p></div><ol className="ask-form-steps" aria-label={urdu ? "درخواست کے مراحل" : "Request steps"}><li className="is-current"><span>1</span>{urdu ? "تفصیل" : "Details"}</li><li><span>2</span>{urdu ? "ای میل" : "Email"}</li><li><span>3</span>{urdu ? "ارسال" : "Send"}</li></ol></div><div className="grid gap-5 sm:grid-cols-2"><Field label={urdu ? "نام" : "Name"} value={draft.name} onChange={(value) => update("name", value)} required /><Field label={urdu ? "واٹس ایپ / فون" : "WhatsApp / Phone"} value={draft.phone} onChange={(value) => update("phone", value)} required type="tel" /><Field label={urdu ? "ای میل (اختیاری)" : "Email (optional)"} value={draft.email} onChange={(value) => update("email", value)} type="email" /><Field label={urdu ? "زبان کی ترجیح" : "Language preference"} value={draft.languagePreference} onChange={(value) => update("languagePreference", value)} select options={languageOptions} /><Field label={urdu ? "سوال کا عنوان" : "Question title"} value={draft.title} onChange={(value) => update("title", value)} required full /><Field label={urdu ? "زمرہ" : "Category"} value={draft.category} onChange={(value) => update("category", value)} select required options={categories} full /><label className="sm:col-span-2"><span className="form-label">{urdu ? "تفصیلی سوال *" : "Detailed question *"}</span><textarea required rows={7} value={draft.details} onChange={(event) => update("details", event.target.value)} className="form-control resize-y" placeholder={urdu ? "براہِ کرم صورتحال کی ضروری تفصیلات لکھیں…" : "Please provide the relevant circumstances and details…"} /></label><div className="ask-attachment-note sm:col-span-2"><Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-[#0B6756]" /><p>{urdu ? "فائل منسلک کرنے کی ضرورت ہو تو پہلے ای میل بھیجیں یا واٹس ایپ کے ذریعے رابطہ کریں؛ اس فارم سے فائل خودکار طور پر نہیں بھیجی جاتی۔" : "If a file is needed, first send the email draft or coordinate through WhatsApp; attachments are not transmitted automatically through this form."}</p></div></div><button type="submit" className="ask-submit-button"><Send className="h-4 w-4" />{urdu ? "ای میل کا مسودہ تیار کریں" : "Prepare email draft"}</button></form></div></section>
  </main></SiteShell>;
}

function Field({ label, value, onChange, required, type = "text", select, options = [], full = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; select?: boolean; options?: string[]; full?: boolean }) {
  return <label className={`form-field ${full ? "sm:col-span-2" : ""}`}><span className="form-label">{label}{required && " *"}</span>{select ? <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="form-control">{options.map((option) => <option key={option}>{option}</option>)}</select> : <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="form-control" />}</label>;
}
