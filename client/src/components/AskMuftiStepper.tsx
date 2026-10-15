import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, FileText, Lock, Paperclip, Search, Send, Shield, Sparkles, User } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useLanguage } from "./SiteShell";

const CATEGORY_OPTIONS = [
  { id: "Worship", ur: "عبادات (نماز، روزہ، زکوٰۃ، حج)", en: "Worship (Salah, Fasting, Hajj)" },
  { id: "Transactions", ur: "معاملات، تجارت و اسلامی بینکاری", en: "Transactions & Islamic Banking" },
  { id: "Marriage", ur: "نکاح، طلاق اور خاندانی مسائل", en: "Marriage, Divorce & Family Affairs" },
  { id: "Inheritance", ur: "وراثت، ترکہ اور وصیت کے مسائل", en: "Inheritance & Estate Distribution" },
  { id: "HalalFood", ur: "حلال و حرام، غذائیں اور ادویات", en: "Halal Rulings, Foods & Medicines" },
  { id: "Contemporary", ur: "جدید عصری و فکری مسائل", en: "Contemporary & Modern Issues" },
];

export function AskMuftiStepper() {
  const { language } = useLanguage();
  const urdu = language === "ur";

  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [category, setCategory] = useState("Worship");
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [submittedTrackingId, setSubmittedTrackingId] = useState("");

  // Tracking query state
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    id: string;
    subject: string;
    status: string;
    submittedDate: string;
    assignedTo: string;
    eta: string;
  } | null>(null);

  const handleNext = () => {
    if (step === 1 && !subject.trim()) {
      toast.error(urdu ? "براہِ کرم سوال کا عنوان درج فرمائیں۔" : "Please enter a subject for your question.");
      return;
    }
    if (step === 2 && !isAnonymous && !name.trim()) {
      toast.error(urdu ? "براہِ کرم اپنا نام یا شناخت درج کریں، یا 'پوشیدہ' منتخب کریں۔" : "Please enter your name or enable anonymous mode.");
      return;
    }
    if (step === 3 && questionText.trim().length < 20) {
      toast.error(urdu ? "سوال کی تفصیل کم از کم 20 حروف پر مشتمل ہونی چاہیے۔" : "Question details must be at least 20 characters.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingCode = `FS-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTrackingId(trackingCode);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D1AC5B", "#075A9B", "#064E3B", "#FFFFFF"],
      });
    } catch {
      // fallback if canvas not available
    }

    toast.success(urdu ? "آپ کا سوال کامیابی سے موصول ہو گیا ہے" : "Your question was successfully received!");
  };

  const handleLookupTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackingInput.trim().toUpperCase();
    if (!clean) return;

    // Simulate status check
    setTrackingResult({
      id: clean,
      subject: urdu ? "وراثت اور مشترکہ جائیداد کی شرعی تقسیم" : "Islamic division of joint property & estate",
      status: urdu ? "زیرِ تحقیق مفتیانِ کرام" : "Under Scholarly Review",
      submittedDate: "12 Oct 2026",
      assignedTo: urdu ? "حضرت مولانا مفتی عبد المنان صاحب" : "Hazrat Maulana Mufti Abdul Mannan Sahib",
      eta: urdu ? "24 تا 48 گھنٹے" : "Within 24 to 48 Hours",
    });
  };

  const resetForm = () => {
    setStep(1);
    setSubject("");
    setName("");
    setEmail("");
    setPhone("");
    setIsAnonymous(false);
    setQuestionText("");
    setAttachedFileName("");
    setSubmittedTrackingId("");
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF7F0] dark:bg-[#041226] px-5 py-20 sm:px-8 lg:py-28" id="ask-mufti">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C89C46]">
            <span className="h-px w-8 bg-[#C89C46]" />
            <span>{urdu ? "استفتاء و شرعی سوال" : "Direct Guidance Intake"}</span>
            <span className="h-px w-8 bg-[#C89C46]" />
          </div>
          <h2 className={`mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10223A] dark:text-white ${
            urdu ? "font-urdu leading-tight" : "font-display"
          }`}>
            {urdu ? "مفتی صاحب سے شرعی مسئلہ دریافت کریں" : "Consult a Mufti & Submit Question"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#596C80] dark:text-white/70">
            {urdu
              ? "اپنا مسئلہ اعتماد اور مکمل رازداری کے ساتھ لکھیں۔ معتبر مفتیانِ کرام قرآن و سنت کی روشنی میں تحقیق کے بعد جواب مرحمت فرمائیں گے۔"
              : "Submit your theological or jurisprudence question with complete confidentiality. Reviewed under recognized Hanafi scholars with verified references."}
          </p>
        </div>

        {/* Tab Selector: Submit vs Track */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-lg border border-[#D5CDC0] dark:border-white/10 bg-white/70 dark:bg-white/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("submit")}
              className={`rounded-md px-5 py-2.5 font-semibold transition ${
                activeTab === "submit"
                  ? "bg-[#075A9B] text-white shadow-sm dark:bg-[#D1AC5B] dark:text-[#041226]"
                  : "text-[#586A7E] dark:text-white/70 hover:text-[#10223A] dark:hover:text-white"
              }`}
            >
              {urdu ? "نیا سوال جمع کریں" : "Submit New Question"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`rounded-md px-5 py-2.5 font-semibold transition ${
                activeTab === "track"
                  ? "bg-[#075A9B] text-white shadow-sm dark:bg-[#D1AC5B] dark:text-[#041226]"
                  : "text-[#586A7E] dark:text-white/70 hover:text-[#10223A] dark:hover:text-white"
              }`}
            >
              {urdu ? "پہلے سے جمع شدہ سوال کا اسٹیٹس دیکھیں" : "Track Existing Question"}
            </button>
          </div>
        </div>

        {/* Submission Stepper Card */}
        {activeTab === "submit" && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#D7CEC0] dark:border-white/10 bg-white dark:bg-[#071F3D] shadow-[0_20px_50px_rgba(4,18,38,0.08)]">
            {submittedTrackingId ? (
              /* Success Confirmation Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 text-center"
                dir={urdu ? "rtl" : "ltr"}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1E7246]/10 text-[#1E7246]">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className={`mt-5 text-2xl sm:text-3xl font-bold text-[#10223A] dark:text-white ${
                  urdu ? "font-urdu" : "font-display"
                }`}>
                  {urdu ? "جزاکم اللہ خیراً، آپ کا سوال موصول ہو چکا ہے!" : "Your Question Has Been Successfully Registered!"}
                </h3>
                <p className="mt-2 text-sm text-[#5B6D82] dark:text-white/70">
                  {urdu
                    ? "دارالافتاء کے نگراں مفتیانِ کرام آپ کے مسئلے کا مکمل شرعی و فقہی جائزہ لے رہے ہیں۔"
                    : "The supervisory scholarly board has queued your inquiry for research and authoritative response."}
                </p>

                <div className="mx-auto mt-6 inline-flex flex-col items-center justify-center rounded-xl border border-[#D1AC5B]/40 bg-[#FCFAF5] dark:bg-white/5 p-4 sm:px-8">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#936E27] dark:text-[#F3D794]">
                    {urdu ? "آپ کا سوال ٹریکنگ کوڈ" : "Your Tracking Reference ID"}
                  </span>
                  <span className="mt-1 font-mono text-2xl sm:text-3xl font-bold tracking-wider text-[#075A9B] dark:text-[#D1AC5B]">
                    #{submittedTrackingId}
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(submittedTrackingId);
                      toast.success(urdu ? "ٹریکنگ کوڈ کاپی ہو گیا" : "Tracking ID copied");
                    }}
                    className="rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white/70 dark:bg-white/5 px-5 py-2.5 text-xs font-semibold hover:bg-black/5"
                  >
                    {urdu ? "کوڈ محفوظ کریں" : "Copy Tracking ID"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-[#075A9B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#064A80]"
                  >
                    {urdu ? "ایک اور سوال جمع کریں" : "Ask Another Question"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div>
                {/* Stepper Progress Bar */}
                <div className="border-b border-[#E7DFD0] dark:border-white/10 bg-[#FAF7F0] dark:bg-white/[0.02] p-4 sm:p-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#6E8094] dark:text-white/70 mb-3">
                    <span>
                      {urdu ? `مرحلہ ${step} از ${totalSteps}` : `Step ${step} of ${totalSteps}`}
                    </span>
                    <span className="font-bold text-[#075A9B] dark:text-[#D1AC5B]">
                      {step === 1 && (urdu ? "موضوع اور عنوان" : "Subject & Category")}
                      {step === 2 && (urdu ? "سائل کی تفصیلات" : "Your Contact Info")}
                      {step === 3 && (urdu ? "مسئلے کی تفصیل" : "Question Detail")}
                      {step === 4 && (urdu ? "نظرِ ثانی اور تصدیق" : "Review & Submit")}
                    </span>
                  </div>
                  {/* Visual Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DDD0] dark:bg-white/10">
                    <motion.div
                      className="h-full bg-[#075A9B] dark:bg-[#D1AC5B]"
                      animate={{ width: `${(step / totalSteps) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Form Step Body */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8" dir={urdu ? "rtl" : "ltr"}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: urdu ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: urdu ? 20 : -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                            {urdu ? "شرعی باب / کیٹیگری منتخب کریں" : "Select Jurisprudence Category"}
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 text-sm outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                          >
                            {CATEGORY_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {urdu ? c.ur : c.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                            {urdu ? "سوال کا مختصر عنوان" : "Question Subject / One-Line Title"}
                          </label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={urdu ? "مثلاً: سونا اور کیش پر زکوٰۃ کا حساب" : "e.g., Zakat on inherited gold & business shares"}
                            className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 text-sm outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: urdu ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: urdu ? 20 : -20 }}
                        className="space-y-6"
                      >
                        {/* Anonymous Toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-[#D1AC5B]/30 bg-[#FCFAF5] dark:bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-[#936E27] dark:text-[#F3D794]" />
                            <div>
                              <p className="text-sm font-bold text-[#10223A] dark:text-white">
                                {urdu ? "نام اور شناخت مکمل پوشیدہ رکھیں" : "Keep Question Fully Anonymous"}
                              </p>
                              <p className="text-xs text-[#6B7D90] dark:text-white/60">
                                {urdu ? "آپ کا ذاتی نام ریکارڈ یا فتویٰ میں کہیں شائع نہیں کیا جائے گا۔" : "Your personal identity will not be shared publicly or published in the registry."}
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="h-5 w-5 rounded border-[#D5CDC0] text-[#075A9B] focus:ring-[#075A9B]"
                          />
                        </div>

                        {!isAnonymous && (
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                              {urdu ? "سائل کا نام" : "Full Name"}
                            </label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder={urdu ? "محمد عبد اللہ" : "Abdullah Khan"}
                              className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 text-sm outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                            />
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                              {urdu ? "ای میل (جواب وصولی کے لیے)" : "Email Address (Optional)"}
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 text-sm outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                              {urdu ? "واٹس ایپ نمبر (مفت رابطہ)" : "WhatsApp Number"}
                            </label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+92 300 1234567"
                              className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 text-sm outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: urdu ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: urdu ? 20 : -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#495B6F] dark:text-white/80">
                              {urdu ? "مسئلے کی تفصیلی وضاحت" : "Detailed Religious Inquiry"}
                            </label>
                            <span className="font-mono text-xs text-[#7B8B9C] dark:text-white/60">
                              {questionText.length}/2000 {urdu ? "حروف" : "chars"}
                            </span>
                          </div>
                          <textarea
                            rows={6}
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder={urdu ? "براہِ کرم تمام ضروری تفصیلات، فریقین اور شرائط صاف الفاظ میں درج فرمائیں۔" : "Explain the full situation, context, parties involved, and the specific question..."}
                            className="mt-2 w-full rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] p-4 text-sm leading-relaxed outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
                          />
                        </div>

                        {/* File Upload Simulation */}
                        <div className="rounded-lg border border-dashed border-[#D5CDC0] dark:border-white/20 p-5 text-center">
                          <Paperclip className="mx-auto h-6 w-6 text-[#7B8B9C] dark:text-white/60" />
                          <p className="mt-2 text-xs font-semibold text-[#10223A] dark:text-white">
                            {urdu ? "معاہدہ، دستاویز یا رسید منسلک کریں (اختیاری)" : "Attach contract, invoice, or screenshot (Optional)"}
                          </p>
                          <p className="mt-1 text-[11px] text-[#7B8B9C] dark:text-white/60">
                            {urdu ? "پی ڈی ایف یا تصاویر (زیادہ سے زیادہ 3 ایم بی)" : "PDF or Images up to 3MB"}
                          </p>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setAttachedFileName(file.name);
                            }}
                            className="mt-3 text-xs"
                          />
                          {attachedFileName && (
                            <p className="mt-2 font-mono text-xs text-[#1E7246] dark:text-[#78C99B]">
                              ✓ {attachedFileName}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: urdu ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: urdu ? 20 : -20 }}
                        className="space-y-5"
                      >
                        <div className="rounded-xl border border-[#D1AC5B]/30 bg-[#FCFAF5] dark:bg-white/5 p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#936E27] dark:text-[#F3D794]">
                            {urdu ? "سوال کا جائزہ و حتمی تصدیق" : "Summary of Your Inquiry"}
                          </h4>
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-black/5 dark:border-white/10 pb-2">
                              <span className="text-[#647689] dark:text-white/60">{urdu ? "کیٹیگری" : "Category"}:</span>
                              <span className="font-semibold">{category}</span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 dark:border-white/10 pb-2">
                              <span className="text-[#647689] dark:text-white/60">{urdu ? "عنوان" : "Subject"}:</span>
                              <span className="font-semibold">{subject}</span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 dark:border-white/10 pb-2">
                              <span className="text-[#647689] dark:text-white/60">{urdu ? "سائل" : "Inquirer"}:</span>
                              <span className="font-semibold">{isAnonymous ? (urdu ? "پوشیدہ" : "Anonymous") : name || "-"}</span>
                            </div>
                            <div>
                              <span className="text-[#647689] dark:text-white/60">{urdu ? "متن" : "Inquiry"}:</span>
                              <p className="mt-1 line-clamp-3 italic text-xs leading-relaxed text-[#405367] dark:text-white/80">
                                {questionText}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-[#075A9B]/10 p-3 text-xs text-[#075A9B] dark:text-[#97C5E9]">
                          <Shield className="h-4 w-4 shrink-0" />
                          <span>{urdu ? "تمام سوالات دارالافتاء کے مصدقہ ریکارڈ میں محفوظ رہتے ہیں۔" : "All submissions are securely held under the institutional oversight."}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-between border-t border-[#E7DFD0] dark:border-white/10 pt-5">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-semibold hover:bg-black/5"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{urdu ? "واپس" : "Back"}</span>
                      </button>
                    ) : <span />}

                    {step < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#075A9B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#064A80]"
                      >
                        <span>{urdu ? "اگلا مرحلہ" : "Continue"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#D1AC5B] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#06152E] shadow-lg transition hover:bg-[#E4C77F]"
                      >
                        <Send className="h-4 w-4" />
                        <span>{urdu ? "فتویٰ سوال جمع فرمائیں" : "Submit Question to Scholars"}</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tracking Card */}
        {activeTab === "track" && (
          <div className="mt-8 rounded-2xl border border-[#D7CEC0] dark:border-white/10 bg-white dark:bg-[#071F3D] p-6 sm:p-10 shadow-[0_20px_50px_rgba(4,18,38,0.08)]" dir={urdu ? "rtl" : "ltr"}>
            <form onSubmit={handleLookupTracking} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={urdu ? "مثلاً: FS-8492" : "Enter Tracking ID e.g., FS-8492"}
                className="flex-1 rounded-lg border border-[#D5CDC0] dark:border-white/20 bg-white dark:bg-[#071F3D] px-4 py-3 font-mono text-sm uppercase outline-none focus:border-[#075A9B] dark:focus:border-[#D1AC5B]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#075A9B] px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-[#064A80]"
              >
                <Search className="h-4 w-4" />
                <span>{urdu ? "اسٹیٹس چیک کریں" : "Track Inquiry"}</span>
              </button>
            </form>

            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl border border-[#D1AC5B]/35 bg-[#FCFAF5] dark:bg-white/5 p-6"
              >
                <div className="flex items-center justify-between border-b border-[#E7DFD0] dark:border-white/10 pb-3">
                  <span className="font-mono text-lg font-bold text-[#075A9B] dark:text-[#D1AC5B]">
                    {trackingResult.id}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#1E7246]/10 px-3 py-1 text-xs font-semibold text-[#1E7246] dark:text-[#78C99B]">
                    <Clock className="h-3 w-3" />
                    {trackingResult.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-[#647689] dark:text-white/60">{urdu ? "موضوع" : "Subject"}:</span>
                    <p className="font-semibold text-sm mt-0.5">{trackingResult.subject}</p>
                  </div>
                  <div>
                    <span className="text-[#647689] dark:text-white/60">{urdu ? "نگراں مفتی" : "Supervising Scholar"}:</span>
                    <p className="font-semibold text-sm mt-0.5">{trackingResult.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-[#647689] dark:text-white/60">{urdu ? "تاریخِ وصولی" : "Received Date"}:</span>
                    <p className="font-semibold text-sm mt-0.5">{trackingResult.submittedDate}</p>
                  </div>
                  <div>
                    <span className="text-[#647689] dark:text-white/60">{urdu ? "تخمینی وقتِ جواب" : "Estimated Response"}:</span>
                    <p className="font-semibold text-sm mt-0.5 text-[#1E7246] dark:text-[#78C99B]">{trackingResult.eta}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
