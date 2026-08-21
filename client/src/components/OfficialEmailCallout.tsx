import { useLanguage } from "@/components/SiteShell";
import { Mail } from "lucide-react";
import { useState, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { getOfficialEmailCopy, OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

export { OFFICIAL_ENQUIRY_EMAIL } from "./officialEmailCopy";

type OfficialEmailLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  showCopyStatus?: boolean;
  copyStatusText?: string;
};

export function OfficialEmailLink({ children, onClick, showCopyStatus = false, copyStatusText = "Email address copied to your clipboard.", title, ...props }: OfficialEmailLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (!navigator.clipboard) return;

    void navigator.clipboard.writeText(OFFICIAL_ENQUIRY_EMAIL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3200);
    }).catch(() => undefined);
  };

  return <a {...props} href={`mailto:${OFFICIAL_ENQUIRY_EMAIL}`} onClick={handleClick} title={title ?? "Open your email application. The address is also copied as a fallback."} data-email-fallback="copy">
    {children}
    {copied && <span className={showCopyStatus ? "mt-3 block font-sans text-[11px] font-semibold text-[#075A9B]" : "sr-only"} role="status">{copyStatusText}</span>}
  </a>;
}

export function ContextualEmailCard({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const copy = getOfficialEmailCopy(language === "ur" ? "ur" : "en");
  const emailLabel = language === "ur" ? "ای میل" : "Email";
  const copyStatusText = language === "ur" ? "ای میل ایڈریس نقل ہو گیا ہے۔" : "Email address copied to your clipboard.";

  return <OfficialEmailLink aria-label={`${emailLabel}: ${OFFICIAL_ENQUIRY_EMAIL}`} className={`contact-card ${className}`} showCopyStatus copyStatusText={copyStatusText}>
    <Mail aria-hidden="true" className="h-6 w-6 text-[#075A9B]" />
    <span className="mt-7 block font-display text-2xl text-[#10223A]">{emailLabel}</span>
    <span className="mt-2 block break-all font-sans text-xs leading-5 text-[#637187] underline decoration-[#C89C46]/70 underline-offset-4">{OFFICIAL_ENQUIRY_EMAIL}</span>
  </OfficialEmailLink>;
}
