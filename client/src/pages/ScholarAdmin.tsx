import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Eye, FilePlus2, LockKeyhole, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import SiteShell, { useLanguage } from "@/components/SiteShell";
import { scholarAdminApi } from "@/data/scholarAdminApi";
import type { ApiScholar } from "@/data/scholarsApi";

type ScholarForm = {
  slug: string; nameEn: string; nameUr: string; titleEn: string; titleUr: string; organizationEn: string; organizationUr: string;
  shortIntroductionEn: string; shortIntroductionUr: string; introductionEn: string; introductionUr: string;
  educationalBackgroundEn: string; educationalBackgroundUr: string; islamicQualifications: string; areasOfExpertise: string;
  responsibilities: string; services: string; additionalInformationEn: string; additionalInformationUr: string;
  contactEmail: string; contactPhone: string; isPublished: boolean;
};

const emptyForm: ScholarForm = {
  slug: "", nameEn: "", nameUr: "", titleEn: "", titleUr: "", organizationEn: "Darul Ifta Irshad-us-Saileen Karachi", organizationUr: "دارالافتاء ارشاد السائلین کراچی",
  shortIntroductionEn: "", shortIntroductionUr: "", introductionEn: "", introductionUr: "", educationalBackgroundEn: "", educationalBackgroundUr: "",
  islamicQualifications: "", areasOfExpertise: "", responsibilities: "", services: "", additionalInformationEn: "", additionalInformationUr: "", contactEmail: "", contactPhone: "", isPublished: false,
};

function toLines(value: unknown) {
  return Array.isArray(value) ? value.map(item => item && typeof item === "object" && typeof (item as { en?: unknown }).en === "string" && typeof (item as { ur?: unknown }).ur === "string" ? `${(item as { en: string }).en} | ${(item as { ur: string }).ur}` : "").filter(Boolean).join("\n") : "";
}

function fromLines(value: string) {
  return value.split("\n").map(line => line.split("|").map(part => part.trim())).filter(([en, ur]) => en && ur).map(([en, ur]) => ({ en, ur }));
}

function recordToForm(record: ApiScholar): ScholarForm {
  return {
    slug: record.slug, nameEn: record.nameEn, nameUr: record.nameUr, titleEn: record.titleEn || "", titleUr: record.titleUr || "", organizationEn: record.organizationEn || "", organizationUr: record.organizationUr || "",
    shortIntroductionEn: record.shortIntroductionEn || "", shortIntroductionUr: record.shortIntroductionUr || "", introductionEn: record.introductionEn || "", introductionUr: record.introductionUr || "",
    educationalBackgroundEn: record.educationalBackgroundEn || "", educationalBackgroundUr: record.educationalBackgroundUr || "", islamicQualifications: toLines(record.islamicQualifications), areasOfExpertise: toLines(record.areasOfExpertise),
    responsibilities: toLines(record.responsibilities), services: toLines(record.services), additionalInformationEn: record.additionalInformationEn || "", additionalInformationUr: record.additionalInformationUr || "",
    contactEmail: record.contactEmail || "", contactPhone: record.contactPhone || "", isPublished: record.isPublished,
  };
}

function asPayload(form: ScholarForm) {
  return {
    ...form,
    slug: form.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""),
    islamicQualifications: fromLines(form.islamicQualifications), areasOfExpertise: fromLines(form.areasOfExpertise), responsibilities: fromLines(form.responsibilities), services: fromLines(form.services),
  };
}

const fieldLabels: Array<[keyof ScholarForm, string, string, "input" | "textarea"]> = [
  ["slug", "Profile URL slug", "پروفائل لنک", "input"], ["nameEn", "Name in English", "انگریزی نام", "input"], ["nameUr", "Name in Urdu", "اردو نام", "input"],
  ["titleEn", "Designation in English", "انگریزی عہدہ", "input"], ["titleUr", "Designation in Urdu", "اردو عہدہ", "input"], ["organizationEn", "Organisation in English", "انگریزی ادارہ", "input"], ["organizationUr", "Organisation in Urdu", "اردو ادارہ", "input"],
  ["shortIntroductionEn", "Short introduction in English", "مختصر انگریزی تعارف", "textarea"], ["shortIntroductionUr", "Short introduction in Urdu", "مختصر اردو تعارف", "textarea"],
  ["introductionEn", "Full introduction in English", "تفصیلی انگریزی تعارف", "textarea"], ["introductionUr", "Full introduction in Urdu", "تفصیلی اردو تعارف", "textarea"],
  ["educationalBackgroundEn", "Educational background in English", "انگریزی تعلیمی پس منظر", "textarea"], ["educationalBackgroundUr", "Educational background in Urdu", "اردو تعلیمی پس منظر", "textarea"],
  ["additionalInformationEn", "Additional information in English", "اضافی انگریزی معلومات", "textarea"], ["additionalInformationUr", "Additional information in Urdu", "اضافی اردو معلومات", "textarea"],
  ["contactEmail", "Optional public email", "اختیاری عوامی ای میل", "input"], ["contactPhone", "Optional public phone", "اختیاری عوامی فون", "input"],
];

const listFields: Array<[keyof ScholarForm, string, string]> = [
  ["islamicQualifications", "Islamic education and qualifications", "اسلامی تعلیم اور علمی اہلیت"], ["areasOfExpertise", "Areas of expertise", "تخصصات"], ["responsibilities", "Responsibilities", "ذمہ داریاں"], ["services", "Services and guidance", "خدمات اور رہنمائی"],
];

export default function ScholarAdmin() {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const [accessKey, setAccessKey] = useState(() => sessionStorage.getItem("scholar-admin-key") || "");
  const [verified, setVerified] = useState(false);
  const [records, setRecords] = useState<ApiScholar[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ScholarForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const title = useMemo(() => editingId ? (urdu ? "عالم کا پروفائل ترمیم کریں" : "Edit scholar profile") : (urdu ? "نیا عالم شامل کریں" : "Add a scholar"), [editingId, urdu]);

  const loadRecords = async (key = accessKey) => {
    const rows = await scholarAdminApi.list(key);
    setRecords(rows);
  };

  useEffect(() => {
    if (!accessKey) return;
    scholarAdminApi.verify(accessKey).then(() => { setVerified(true); loadRecords(accessKey); }).catch(() => { sessionStorage.removeItem("scholar-admin-key"); setVerified(false); });
  }, []);

  const verify = async () => {
    setBusy(true); setMessage("");
    try { await scholarAdminApi.verify(accessKey); sessionStorage.setItem("scholar-admin-key", accessKey); await loadRecords(); setVerified(true); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Access could not be verified."); }
    finally { setBusy(false); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const payload = asPayload(form);
      if (editingId) await scholarAdminApi.update(accessKey, editingId, payload); else await scholarAdminApi.create(accessKey, payload);
      await loadRecords(); setEditingId(null); setForm(emptyForm); setMessage(urdu ? "عالم کا ریکارڈ محفوظ ہو گیا ہے۔" : "Scholar record has been saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Scholar record could not be saved."); }
    finally { setBusy(false); }
  };

  const edit = (record: ApiScholar) => { setEditingId(record.id); setForm(recordToForm(record)); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const setPublished = async (record: ApiScholar) => { setBusy(true); try { await scholarAdminApi.update(accessKey, record.id, { isPublished: !record.isPublished }); await loadRecords(); } finally { setBusy(false); } };
  const remove = async (record: ApiScholar) => { if (!window.confirm(urdu ? "کیا آپ یہ عالم کا ریکارڈ حذف کرنا چاہتے ہیں؟" : `Delete ${record.nameEn}?`)) return; setBusy(true); try { await scholarAdminApi.remove(accessKey, record.id); await loadRecords(); if (editingId === record.id) { setEditingId(null); setForm(emptyForm); } } finally { setBusy(false); } };
  const updateField = (field: keyof ScholarForm, value: string | boolean) => setForm(current => ({ ...current, [field]: value }));

  if (!verified) return <SiteShell><main className="bg-[#FBF9F3] px-5 py-16 sm:px-8"><section className="mx-auto max-w-lg border border-[#D8D0C3] bg-white p-7 shadow-[0_14px_34px_rgba(29,43,66,.08)]"><LockKeyhole className="h-8 w-8 text-[#C89C46]" /><p className="mt-5 font-sans text-[10px] font-bold uppercase tracking-[.16em] text-[#075A9B]">{urdu ? "منتظم رسائی" : "ADMINISTRATOR ACCESS"}</p><h1 className={urdu ? "mt-3 font-urdu text-3xl text-[#10223A]" : "mt-3 font-display text-4xl text-[#10223A]"}>{urdu ? "علماء کے ریکارڈز" : "Scholar records"}</h1><p className={urdu ? "mt-4 font-urdu text-lg leading-8 text-[#52627A]" : "mt-4 font-sans text-sm leading-7 text-[#52627A]"}>{urdu ? "محفوظ انتظامی کلید کے ذریعے صرف مجاز افراد عالموں کے پروفائل ترمیم کر سکتے ہیں۔" : "Only authorised administrators can manage scholar profiles with the secure access key."}</p><label className="mt-6 block font-sans text-xs font-bold text-[#273951]" htmlFor="scholar-admin-key">{urdu ? "منتظم کلید" : "Administrator access key"}</label><input id="scholar-admin-key" type="password" autoComplete="current-password" value={accessKey} onChange={event => setAccessKey(event.target.value)} className="mt-2 w-full border border-[#C9C0B3] px-3 py-3 font-sans text-sm text-[#10223A] outline-none focus:border-[#075A9B]" /><button type="button" onClick={verify} disabled={busy || !accessKey} className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#08284C] px-4 py-3 font-sans text-xs font-bold uppercase tracking-[.12em] text-white disabled:opacity-60"><LockKeyhole className="h-4 w-4" />{busy ? (urdu ? "جانچ جاری ہے" : "Verifying") : (urdu ? "رسائی حاصل کریں" : "Verify access")}</button>{message && <p className="mt-4 font-sans text-sm text-[#9A3838]">{message}</p>}</section></main></SiteShell>;

  return <SiteShell><main className="bg-[#FBF9F3] px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-[1240px]"><Link href="/scholars" className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[.12em] text-[#075A9B]"><ChevronLeft className="h-4 w-4" />{urdu ? "عوامی علماء کا صفحہ" : "Public scholars page"}</Link><div className="mt-6 flex flex-col gap-4 border-b border-[#D8D0C3] pb-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="font-sans text-[10px] font-bold uppercase tracking-[.16em] text-[#C89C46]">{urdu ? "محفوظ مواد کا انتظام" : "SECURE CONTENT MANAGEMENT"}</p><h1 className={urdu ? "mt-2 font-urdu text-4xl text-[#10223A]" : "mt-2 font-display text-5xl text-[#10223A]"}>{urdu ? "علماء کرام" : "Scholars"}</h1></div><button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="inline-flex items-center gap-2 border border-[#075A9B] px-4 py-3 font-sans text-xs font-bold uppercase tracking-[.12em] text-[#075A9B]"><Plus className="h-4 w-4" />{urdu ? "نیا عالم" : "Add scholar"}</button></div><div className="mt-8 grid gap-8 xl:grid-cols-[.82fr_1.18fr]"><section className="h-fit border border-[#D8D0C3] bg-white p-5 shadow-[0_10px_28px_rgba(29,43,66,.06)]"><div className="flex items-center justify-between"><h2 className={urdu ? "font-urdu text-2xl text-[#10223A]" : "font-display text-2xl text-[#10223A]"}>{urdu ? "تمام ریکارڈز" : "All records"}</h2><span className="font-sans text-xs text-[#52627A]">{records.length}</span></div><div className="mt-5 space-y-3">{records.map(record => <article key={record.id} className="border border-[#E3DDD3] p-4"><div className="flex gap-3"><div className="min-w-0 flex-1"><p className="font-urdu text-xl leading-8 text-[#10223A]">{record.nameUr}</p><p className="font-sans text-xs text-[#52627A]">{record.nameEn}</p><span className={`mt-3 inline-flex px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[.12em] ${record.isPublished ? "bg-[#E4F2E8] text-[#2B6E46]" : "bg-[#F2EEE5] text-[#75674E]"}`}>{record.isPublished ? (urdu ? "شائع شدہ" : "Published") : (urdu ? "غیر شائع شدہ" : "Draft")}</span></div><div className="flex flex-col gap-2"><button type="button" title="Edit" onClick={() => edit(record)} className="text-[#075A9B]"><Pencil className="h-4 w-4" /></button><button type="button" title="Delete" onClick={() => remove(record)} className="text-[#9A3838]"><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-4 flex gap-2 border-t border-[#E3DDD3] pt-3"><button type="button" onClick={() => setPublished(record)} disabled={busy} className="font-sans text-[10px] font-bold uppercase tracking-[.1em] text-[#075A9B]">{record.isPublished ? (urdu ? "غیر شائع کریں" : "Unpublish") : (urdu ? "شائع کریں" : "Publish")}</button>{record.isPublished && <Link href={`/scholars/${record.slug}`} className="ml-auto inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[.1em] text-[#52627A]"><Eye className="h-3.5 w-3.5" />{urdu ? "دیکھیں" : "View"}</Link>}</div></article>)}</div></section><section className="border border-[#D8D0C3] bg-white p-6 shadow-[0_10px_28px_rgba(29,43,66,.06)]"><div className="flex items-center justify-between gap-4"><div><p className="font-sans text-[10px] font-bold uppercase tracking-[.14em] text-[#C89C46]">{editingId ? (urdu ? "ترمیم" : "EDIT") : (urdu ? "نیا ریکارڈ" : "NEW RECORD")}</p><h2 className={urdu ? "mt-2 font-urdu text-3xl text-[#10223A]" : "mt-2 font-display text-3xl text-[#10223A]"}>{title}</h2></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-[#52627A]"><X className="h-5 w-5" /></button>}</div><form onSubmit={save} className="mt-7 space-y-7"><div className="grid gap-5 md:grid-cols-2">{fieldLabels.map(([field, english, urduLabel, kind]) => <label key={field} className="block"><span className="font-sans text-xs font-bold text-[#273951]">{urdu ? urduLabel : english}{["slug", "nameEn", "nameUr"].includes(field) && <span className="text-[#9A3838]"> *</span>}</span>{kind === "textarea" ? <textarea required={["shortIntroductionEn", "shortIntroductionUr", "introductionEn", "introductionUr"].includes(field)} rows={field.includes("introduction") ? 5 : 3} value={form[field] as string} onChange={event => updateField(field, event.target.value)} className="mt-2 w-full border border-[#C9C0B3] p-3 font-sans text-sm leading-6 text-[#10223A] outline-none focus:border-[#075A9B]" /> : <input required={["slug", "nameEn", "nameUr"].includes(field)} value={form[field] as string} onChange={event => updateField(field, event.target.value)} className="mt-2 w-full border border-[#C9C0B3] px-3 py-3 font-sans text-sm text-[#10223A] outline-none focus:border-[#075A9B]" />}</label>)}</div><div className="grid gap-5 md:grid-cols-2">{listFields.map(([field, english, urduLabel]) => <label key={field} className="block"><span className="font-sans text-xs font-bold text-[#273951]">{urdu ? urduLabel : english}</span><span className="mt-1 block font-sans text-[11px] leading-5 text-[#68778A]">{urdu ? "ہر سطر: انگریزی | اردو" : "One line per item: English | Urdu"}</span><textarea rows={5} value={form[field] as string} onChange={event => updateField(field, event.target.value)} className="mt-2 w-full border border-[#C9C0B3] p-3 font-sans text-sm leading-6 text-[#10223A] outline-none focus:border-[#075A9B]" /></label>)}</div><label className="flex items-center gap-3 border-y border-[#E3DDD3] py-4"><input type="checkbox" checked={form.isPublished} onChange={event => updateField("isPublished", event.target.checked)} className="h-4 w-4 accent-[#075A9B]" /><span className={urdu ? "font-urdu text-xl text-[#273951]" : "font-sans text-sm text-[#273951]"}>{urdu ? "یہ پروفائل عوامی فہرست میں شائع کریں" : "Publish this profile in the public directory"}</span></label><div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-[#08284C] px-5 py-3 font-sans text-xs font-bold uppercase tracking-[.12em] text-white disabled:opacity-60"><Save className="h-4 w-4" />{busy ? (urdu ? "محفوظ ہو رہا ہے" : "Saving") : (editingId ? (urdu ? "تبدیلیاں محفوظ کریں" : "Save changes") : (urdu ? "عالم شامل کریں" : "Create scholar"))}</button>{message && <p className="inline-flex items-center gap-2 font-sans text-sm text-[#2B6E46]"><Check className="h-4 w-4" />{message}</p>}</div></form></section></div></div></main></SiteShell>;
}
