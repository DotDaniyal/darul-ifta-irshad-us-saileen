/** Confidential public intake with a one-time tracking secret and restricted private attachments. */
import { useRef, useState } from "react";
import { Link } from "wouter";
import { Paperclip, ShieldCheck, Send, MessageCircle, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";
import { ContextualEmailCard, OfficialEmailCallout } from "@/components/OfficialEmailCallout";
import { trpc } from "@/lib/trpc";

type Receipt = { referenceCode: string; trackingSecret: string };
type Attachment = { fileName: string; mimeType: "application/pdf" | "image/jpeg" | "image/png"; base64: string };

export default function AskFatwa() {
  const { language } = useLanguage();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const taxonomy = trpc.publicCatalogue.taxonomy.useQuery();
  const submitQuestion = trpc.questions.submit.useMutation({
    onSuccess: result => { setFormError(null); setReceipt(result); toast.success(urdu ? "درخواست محفوظ کر لی گئی ہے" : "Your confidential request has been saved"); },
    onError: error => { setFormError(error.message); toast.error(error.message); },
  });
  const urdu = language === "ur";
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    submitQuestion.mutate({
      isAnonymous: anonymous,
      requesterName: String(values.get("requesterName") || "").trim() || undefined,
      requesterEmail: String(values.get("requesterEmail") || "").trim() || undefined,
      requesterPhone: String(values.get("requesterPhone") || "").trim() || undefined,
      preferredLanguage: language === "ur" ? "ur" : "en",
      categorySlug: String(values.get("categorySlug") || "").trim() || undefined,
      subject: String(values.get("subject") || "").trim(),
      questionBody: String(values.get("questionBody") || "").trim(),
      attachments: attachment ? [attachment] : [],
    });
  };
  const selectAttachment = (file?: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"] as const;
    if (!allowed.includes(file.type as (typeof allowed)[number]) || file.size > 2 * 1024 * 1024) {
      const message = urdu ? "صرف PDF، JPEG یا PNG فائل (زیادہ سے زیادہ 2 MB) جمع کرائی جا سکتی ہے۔" : "Only a PDF, JPEG, or PNG up to 2 MB can be attached.";
      setFormError(message);
      toast.error(message);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAttachment({ fileName: file.name, mimeType: file.type as Attachment["mimeType"], base64: String(reader.result).split(",")[1] ?? "" });
    reader.readAsDataURL(file);
  };
  return <SiteShell><main className="bg-[#FBF9F3]"><OfficialEmailCallout /><section className="page-hero"><div className="page-hero-pattern"/><div className="relative mx-auto max-w-[1360px] px-5 py-18 sm:px-8 sm:py-24"><p className="font-urdu text-xl text-[#E9D4A2]">اپنا سوال پیش کریں</p><h1 className="mt-5 font-display text-5xl text-white sm:text-7xl">{urdu ? "شرعی رہنمائی کی درخواست" : "Request scholarly guidance"}</h1><p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/70 sm:text-base">{urdu ? "آپ کا سوال اہلِ علم کے جائزے کے لیے پیش کیا جائے گا؛ خودکار یا فوری فتویٰ جاری نہیں کیا جاتا۔" : "Your question will be submitted for qualified scholarly review; the website does not issue automated or instant religious rulings."}</p></div></section>
    <section className="relative px-5 py-14 sm:px-8 lg:py-20"><div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[0.75fr_1.25fr]"><aside><SectionHeading eyebrow={urdu ? "اہم اطلاع" : "IMPORTANT NOTICE"} title={urdu ? "تحقیق کے ساتھ رہنمائی" : "Guidance with due care"}/><div className="mt-7 border-l-4 border-[#C89C46] bg-[#EEF3F8] p-6"><ShieldCheck className="h-6 w-6 text-[#075A9B]"/><p className="mt-4 font-sans text-sm leading-7 text-[#334B65]">{urdu ? "فتویٰ شرعی رہنمائی کے لیے ہے۔ حتمی جواب متعلقہ مفتی صاحب کی تحقیق اور تصدیق کے بعد جاری کیا جائے گا۔" : "A fatwa is issued for Islamic guidance. A final response is provided only after a relevant qualified mufti has researched and verified the request."}</p></div><div className="mt-7 rounded-sm bg-[#08284C] p-6 text-white"><MessageCircle className="h-5 w-5 text-[#E9D4A2]"/><p className="mt-3 font-urdu text-xl text-white">{urdu ? "فوری رابطے کے لیے واٹس ایپ" : "For a prompt contact route"}</p><a href="https://wa.me/923332617671" target="_blank" rel="noreferrer" className="mt-3 inline-flex font-sans text-sm text-[#E9D4A2]">+92 333 2617671</a></div></aside>
      <ContextualEmailCard className="lg:col-start-1 lg:row-start-2" />
      <form onSubmit={submit} className="form-chamber">{receipt ? <div className="grid min-h-[480px] place-items-center text-center"><div className="max-w-lg"><ShieldCheck className="mx-auto h-12 w-12 text-[#075A9B]"/><h2 className="mt-6 font-display text-4xl text-[#10223A]">{urdu ? "درخواست محفوظ ہو گئی" : "Your request is securely recorded"}</h2><p className="mx-auto mt-4 font-sans text-sm leading-7 text-[#647188]">{urdu ? "یہ دو معلومات ابھی محفوظ کر لیں؛ آپ انہیں استعمال کر کے اپنے سوال کی حالت دیکھ سکیں گے۔" : "Save these two details now. They are required to check your request status and cannot be recovered later."}</p><div className="mt-6 grid gap-3 rounded-sm border border-[#D8C898] bg-[#FFFCF3] p-5 text-left font-sans text-sm text-[#10223A]"><p><strong>{urdu ? "حوالہ نمبر" : "Reference"}:</strong> {receipt.referenceCode}</p><p className="break-all"><strong>{urdu ? "ٹریکنک راز" : "Tracking secret"}:</strong> {receipt.trackingSecret}</p></div><Link href="/track-question" className="mt-7 inline-flex items-center gap-2 bg-[#075A9B] px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white"><KeyRound className="h-4 w-4"/>{urdu ? "حالت دیکھیں" : "Track request"}</Link></div></div> : <><div className="form-seal"><span>✦</span><span>{urdu ? "شعبۂ شرعی رہنمائی" : "SCHOLARLY GUIDANCE DESK"}</span><span>✦</span></div><div className="mb-8 border-b border-[#D8C898] pb-6"><p className="font-urdu text-2xl text-[#10223A]">{urdu ? "فتویٰ دریافت کریں" : "Ask a Fatwa"}</p><p className="mt-2 font-sans text-xs leading-6 text-[#6B788A]">{urdu ? "ستارے والے خانے ضروری ہیں۔" : "Fields marked with an asterisk are required."}</p></div>{formError && <p role="alert" aria-live="assertive" className="mb-5 border-l-4 border-[#9B1C1C] bg-[#FFF4F4] px-4 py-3 font-sans text-sm leading-6 text-[#7A1515]">{formError}</p>}<div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 flex items-start gap-3 rounded-sm border border-[#D8C898] bg-[#FFFCF3] p-4 text-sm text-[#334B65]"><input checked={anonymous} onChange={event => { setAnonymous(event.target.checked); setFormError(null); }} type="checkbox" className="mt-1 h-4 w-4 accent-[#075A9B]"/><span><strong>{urdu ? "گمنام درخواست" : "Submit anonymously"}</strong><br/>{urdu ? "اس صورت میں نام، ای میل اور فون نمبر محفوظ نہیں کیے جائیں گے۔" : "When selected, your name, email, and phone are not stored."}</span></label>{!anonymous && <><Field name="requesterName" label={urdu ? "نام" : "Name"}/><Field name="requesterPhone" label={urdu ? "واٹس ایپ / فون" : "WhatsApp / Phone"} type="tel"/></>} {!anonymous && <Field name="requesterEmail" label={urdu ? "ای میل یا فون *" : "Email or phone *"} type="email"/>}<label className={anonymous ? "sm:col-span-2" : ""}><span className="form-label">{urdu ? "زمرہ" : "Category"}</span><select name="categorySlug" className="form-control" defaultValue=""> <option value="">{urdu ? "زمرہ منتخب کریں" : "Choose a category"}</option>{(taxonomy.data?.categories ?? []).map(category => <option value={category.slug} key={category.slug}>{urdu ? category.nameUr ?? category.nameEn : category.nameEn}</option>)}</select></label><Field name="subject" label={urdu ? "سوال کا عنوان" : "Question title"} required full/><label className="sm:col-span-2"><span className="form-label">{urdu ? "تفصیلی سوال *" : "Detailed question *"}</span><textarea name="questionBody" required minLength={20} rows={7} className="form-control resize-y" placeholder={urdu ? "براہِ کرم صورتحال کی ضروری تفصیلات لکھیں…" : "Please provide the relevant circumstances and details…"}/></label><label className="sm:col-span-2"><span className="form-label">{urdu ? "نجی فائل منسلک کریں (اختیاری)" : "Private attachment (optional)"}</span><span className="flex min-h-13 items-center gap-3 border border-dashed border-[#BFC9D4] bg-white/60 px-4 py-3 text-sm text-[#647188]"><Paperclip className="h-4 w-4 shrink-0 text-[#075A9B]"/><input ref={fileInput} onChange={event => selectAttachment(event.target.files?.[0])} type="file" accept="application/pdf,image/jpeg,image/png" className="w-full text-xs"/>{attachment && <span className="max-w-32 truncate text-xs text-[#10223A]">{attachment.fileName}</span>}</span><small className="mt-2 block text-xs text-[#6B788A]">{urdu ? "PDF، JPEG یا PNG، زیادہ سے زیادہ 2 MB۔ فائل صرف متعلقہ اہلِ علم کے لیے دستیاب ہو گی۔" : "PDF, JPEG, or PNG up to 2 MB. The file is retained for authorised scholarly review only."}</small></label></div><button disabled={submitQuestion.isPending} type="submit" className="mt-8 inline-flex items-center gap-2 bg-[#075A9B] px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#08284C] disabled:cursor-wait disabled:opacity-70 active:scale-[0.98]">{submitQuestion.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}{urdu ? "محفوظ جائزے کے لیے جمع کریں" : "Submit for secure scholarly review"}</button></>}</form></div></section>
  </main></SiteShell>;
}
function Field({ name, label, required, type = "text", full = false }: { name: string; label: string; required?: boolean; type?: string; full?: boolean }) { return <label className={full ? "sm:col-span-2" : ""}><span className="form-label">{label}{required && " *"}</span><input name={name} required={required} type={type} className="form-control" /></label>; }
