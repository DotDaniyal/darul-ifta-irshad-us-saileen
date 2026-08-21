import { useLanguage } from "@/components/SiteShell";
import { Mail } from "lucide-react";
import { getOfficialEmailCopy, OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export { OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export function ContextualEmailCard({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const copy = getOfficialEmailCopy(language === "ur" ? "ur" : "en");
  const emailLabel = language === "ur" ? "ای میل" : "Email";

  return <a href={copy.mailtoHref} aria-label={`${emailLabel}: ${OFFICIAL_ENQUIRY_EMAIL}`} className={`contact-card ${className}`}>
    <Mail aria-hidden="true" className="h-6 w-6 text-[#075A9B]" />
    <span className="mt-7 block font-display text-2xl text-[#10223A]">{emailLabel}</span>
    <span className="mt-2 block break-all font-sans text-xs leading-5 text-[#637187] underline decoration-[#C89C46]/70 underline-offset-4">{OFFICIAL_ENQUIRY_EMAIL}</span>
  </a>;
}
