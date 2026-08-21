import { Mail } from "lucide-react";
import { useLanguage } from "@/components/SiteShell";
import { getOfficialEmailCopy, OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export { OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export function OfficialEmailCallout() {
  const { language } = useLanguage();
  const copy = getOfficialEmailCopy(language === "ur" ? "ur" : "en");

  return <aside aria-label={copy.sharedLabel} className="border-b border-[#D8C898] bg-[#FFFCF4] px-5 py-3 sm:px-8">
    <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-2 font-sans text-xs leading-5 text-[#43546D]">
      <span>{copy.sharedDetail}</span>
      <a href={copy.mailtoHref} aria-label={`${copy.sharedLabel}: ${OFFICIAL_ENQUIRY_EMAIL}`} className="inline-flex items-center gap-2 break-all font-semibold text-[#075A9B] transition hover:text-[#061A34] hover:underline">
        <Mail className="h-4 w-4 shrink-0" />{OFFICIAL_ENQUIRY_EMAIL}
      </a>
    </div>
  </aside>;
}

export function ContextualEmailCard({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const copy = getOfficialEmailCopy(language === "ur" ? "ur" : "en");

  return <a href={copy.mailtoHref} aria-label={`${copy.cardTitle}: ${OFFICIAL_ENQUIRY_EMAIL}`} className={`block border border-[#D8C898] bg-[#FFFCF4] p-5 text-[#10223A] shadow-[0_10px_24px_rgba(19,39,73,.06)] transition hover:border-[#C89C46] hover:bg-white ${className}`}>
    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#C89C46]">{copy.cardTitle}</span>
    <span className="mt-2 block font-sans text-sm leading-6 text-[#52627A]">{copy.cardDescription}</span>
    <span className="mt-3 inline-flex break-all font-sans text-sm font-bold text-[#075A9B] underline underline-offset-4">{OFFICIAL_ENQUIRY_EMAIL}</span>
  </a>;
}
