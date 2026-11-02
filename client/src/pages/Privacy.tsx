/**
 * Privacy Policy Page for Darul Ifta Irshad-us-Saileen Karachi.
 * Provides full transparency regarding user data protection, question intake privacy, and anonymous fatwa options.
 */
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";

export default function Privacy() {
  const { language } = useLanguage();
  const urdu = language === "ur";

  return (
    <SiteShell>
      <main className="bg-[#FCFAF4] dark:bg-[#06172A] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeading
            eyebrow={urdu ? "حفاظت و راز داری" : "PRIVACY POLICY"}
            title={urdu ? "پالیسی برائے تحفظِ راز داری" : "Privacy Policy & Confidentiality"}
            description={
              urdu
                ? "دارالافتاء ارشاد السائلین کراچی میں سائلین کے سوالات اور ذاتی معلومات کا تحفظ شرعی اور اخلاقی ذمہ داری ہے۔"
                : "Darul Ifta Irshad-us-Saileen Karachi holds the protection of user identity and question intake with utmost religious and ethical responsibility."
            }
          />

          <div className="mt-10 space-y-8 font-sans text-[#10223A] dark:text-[#E8F0FE] leading-relaxed">
            {/* Section 1 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "1. معلومات کا حصول اور تحفظ" : "1. Information Collection & Protection"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "دارالافتاء فتویٰ کے اندراج کے وقت سائل کا نام، رابطے کا ذریعہ (ای میل / فون) اور فتویٰ کا متن وصول کرتا ہے۔ تمام معلومات جدید انکرپشن (SSL/TLS) کے تحت محفوظ رکھی جاتی ہیں اور صرف مجاز مفتیانِ کرام ہی شرعی رہنمائی کے لیے ان تک رسائی رکھتے ہیں۔"
                  : "When submitting a fatwa inquiry, Darul Ifta collects the inquirer's name, contact details (email/phone), and question description. All data is securely transmitted via SSL encryption and accessed solely by authorized Muftis for jurisprudential review."}
              </p>
            </section>

            {/* Section 2 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "2. صیغہ راز داری اور گمنام استفتاء" : "2. Inquirer Anonymity & Public Archive"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "سائلین کی ذاتی معلومات، نام اور ذاتی کوائف کبھی بھی عام نہیں کیے جاتے۔ ویب سائٹ پر شائع کیے جانے والے علمی و شرعی فتاویٰ میں تمام ذاتی تفصیلات حذف کر دی جاتی ہیں تاکہ سائل کا پردہ قائم رہے۔"
                  : "Personal details, names, and contact credentials of inquirers are never published or shared with third parties. Published fatwa rulings undergo strict redaction to maintain total privacy for all inquirers."}
              </p>
            </section>

            {/* Section 3 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "3. کوکیز اور ویب سائٹ کے اعداد و شمار" : "3. Cookies & Analytical Integrity"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "یہ ویب سائٹ کسی تجارتی مقصد یا ٹریکنگ کے لیے کوکیز استعمال نہیں کرتی۔ ترجیحات (جیسے زبان اور ڈارک موڈ) صرف مقامی براؤزر (LocalStorage) میں محفوظ کی جاتی ہیں۔"
                  : "This website does not utilize commercial ad tracking cookies. User preferences (such as selected language and visual theme) are stored locally in your browser (LocalStorage) without tracking across websites."}
              </p>
            </section>

            {/* Section 4 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "4. رابطہ برائے تحفظِ راز داری" : "4. Data Privacy Inquiries"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "راز داری سے متعلق کسی بھی سوال یا معلومات کے لیے دارالافتاء کے رسمی ای میل ask.darulifa.irshadussaaileen@gmail.com پر رابطہ فرمایا جا سکتا ہے۔"
                  : "For inquiries regarding data protection or request modifications, please contact Darul Ifta at ask.darulifa.irshadussaaileen@gmail.com."}
              </p>
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
