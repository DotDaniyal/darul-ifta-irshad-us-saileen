/**
 * Terms and Conditions Page for Darul Ifta Irshad-us-Saileen Karachi.
 * Outlines scholarly guidance terms, legal disclaimers, and responsible fatwa usage.
 */
import SiteShell, { SectionHeading, useLanguage } from "@/components/SiteShell";

export default function Terms() {
  const { language } = useLanguage();
  const urdu = language === "ur";

  return (
    <SiteShell>
      <main className="bg-[#FCFAF4] dark:bg-[#06172A] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeading
            eyebrow={urdu ? "شرائط و ضوابط" : "TERMS & CONDITIONS"}
            title={urdu ? "خدمات کے استعمال کی شرائط" : "Terms & Conditions of Service"}
            description={
              urdu
                ? "دارالافتاء ارشاد السائلین کراچی کی علمی و الشرعی خدمات کے لیے درج ذیل شرائط و ضوابط نافذ العمل ہیں۔"
                : "Terms and conditions governing the scholarly guidance, public fatwa repository, and consultation services of Darul Ifta Irshad-us-Saileen Karachi."
            }
          />

          <div className="mt-10 space-y-8 font-sans text-[#10223A] dark:text-[#E8F0FE] leading-relaxed">
            {/* Section 1 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "1. شرعی فتاویٰ کی نوعیت" : "1. Nature of Islamic Rulings (Fatawa)"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "دارالافتاء کے فتاویٰ سائل کے بیان کردہ سوال کی روشنی میں قرآن، سنت اور فقہ حنفی کی مستند کتب کے مطابق تحریر کیے جاتے ہیں۔ فتویٰ ایک شرعی رہنمائی ہے جو قانونی یا عدالتی حکم نامے کا متبادل نہیں ہے۔"
                  : "All fatawa published or issued by Darul Ifta are authored in response to specific inquirer representations according to the Qur'an, Sunnah, and Hanafi jurisprudence. A fatwa represents a religious opinion and scholarly clarification, distinct from a legal court decree."}
              </p>
            </section>

            {/* Section 2 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "2. استفتاء کا ذمہ دارانہ اندراج" : "2. Responsible Question Submission"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "سائل پر لازم ہے کہ وہ اپنا سوال مکمل سچائی اور احتیاط کے ساتھ درج کرے، کیونکہ شرعی جواب سوال میں فراہم کردہ حقائق پر مبنی ہوتا ہے۔ غلط یا ادھورے بیان کی صورت میں دارالافتاء پر کوئی شرعی یا اخلاقی ذمہ داری عائد نہیں ہوتی۔"
                  : "Inquirers are expected to provide clear, truthful, and accurate accounts of their circumstances. Rulings depend strictly upon facts presented in the inquiry; Darul Ifta accepts no responsibility for outcomes resulting from incomplete or inaccurate submissions."}
              </p>
            </section>

            {/* Section 3 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "3. حقوقِ اشاعت و نصوص" : "3. Scholarly Property & Publications"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "ویب سائٹ پر موجود فتاویٰ، بیانات اور علمی مضامین دارالافتاء ارشاد السائلین کی ملکیت ہیں۔ غیر تجارتی علمی اشاعت اور استفادے کی اجازت مکمل حوالہ (سورس) کے ساتھ حاصل ہے۔"
                  : "Textual rulings, audio lectures, and publications hosted on this site remain the intellectual and scholarly material of Darul Ifta Irshad-us-Saileen. Non-commercial scholarly distribution is permitted provided complete citation is maintained."}
              </p>
            </section>

            {/* Section 4 */}
            <section className="rounded-xl border border-[#D7C08A] bg-[#FFFDF8] dark:bg-[#0B233F] p-6 shadow-sm">
              <h3 className="font-display text-xl text-[#0B345B] dark:text-[#F0D08A] mb-3">
                {urdu ? "4. رابطہ اور ترامیم" : "4. Modifications & Contact"}
              </h3>
              <p className={urdu ? "font-urdu text-lg leading-loose" : "text-sm leading-6 text-slate-700 dark:text-slate-300"}>
                {urdu
                  ? "دارالافتاء ضرورت کے مطابق ان شرائط میں تبدیلی کا حق رکھتا ہے۔ سوالات کے لیے رسمی رابطہ info / ask.darulifa.irshadussaaileen@gmail.com پر کیا جا سکتا ہے۔"
                  : "Darul Ifta reserves the right to update these terms as needed. For any questions regarding terms or Fatwa verification, please email ask.darulifa.irshadussaaileen@gmail.com."}
              </p>
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
