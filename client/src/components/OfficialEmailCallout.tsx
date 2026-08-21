import { useLanguage } from "@/components/SiteShell";
import { getOfficialEmailCopy, OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export { OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export function ContextualEmailCard({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const copy = getOfficialEmailCopy(language === "ur" ? "ur" : "en");
  const emailLabel = language === "ur" ? "ای میل" : "Email";

  return <a href={copy.mailtoHref} aria-label={`${emailLabel}: ${OFFICIAL_ENQUIRY_EMAIL}`} className={`block border border-[#D8C898] border-s-4 border-s-[#C89C46] bg-[#EEF3F8] p-5 text-[#10223A] shadow-[0_10px_24px_rgba(19,39,73,.06)] transition hover:border-[#C89C46] hover:bg-[#FFFCF4] sm:p-6 ${className}`}>
    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#C89C46]">{emailLabel}</span>
    <span className="mt-2 block break-all font-sans text-sm font-bold text-[#075A9B] underline underline-offset-4">{OFFICIAL_ENQUIRY_EMAIL}</span>
  </a>;
}
