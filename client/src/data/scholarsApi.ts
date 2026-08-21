import { useEffect, useState } from "react";
import type { LocalizedScholarText, ScholarProfile } from "./scholars";

export type ApiScholar = {
  id: number;
  slug: string;
  nameEn: string;
  nameUr: string;
  titleEn: string | null;
  titleUr: string | null;
  organizationEn: string | null;
  organizationUr: string | null;
  shortIntroductionEn: string | null;
  shortIntroductionUr: string | null;
  introductionEn: string | null;
  introductionUr: string | null;
  educationalBackgroundEn: string | null;
  educationalBackgroundUr: string | null;
  islamicQualifications: unknown;
  areasOfExpertise: unknown;
  responsibilities: unknown;
  services: unknown;
  additionalInformationEn: string | null;
  additionalInformationUr: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: unknown;
  isPublished: boolean;
};

const emptyText: LocalizedScholarText = { en: "", ur: "" };

function localizedList(value: unknown): LocalizedScholarText[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LocalizedScholarText => Boolean(item) && typeof item === "object" && typeof (item as LocalizedScholarText).en === "string" && typeof (item as LocalizedScholarText).ur === "string");
}

export function toScholarProfile(row: ApiScholar): ScholarProfile {
  return {
    slug: row.slug,
    isPublished: row.isPublished,
    name: { en: row.nameEn, ur: row.nameUr },
    designation: { en: row.titleEn || emptyText.en, ur: row.titleUr || emptyText.ur },
    organisation: { en: row.organizationEn || emptyText.en, ur: row.organizationUr || emptyText.ur },
    shortIntroduction: { en: row.shortIntroductionEn || emptyText.en, ur: row.shortIntroductionUr || emptyText.ur },
    introduction: { en: row.introductionEn || emptyText.en, ur: row.introductionUr || emptyText.ur },
    educationalBackground: { en: row.educationalBackgroundEn || emptyText.en, ur: row.educationalBackgroundUr || emptyText.ur },
    islamicQualifications: localizedList(row.islamicQualifications),
    areasOfExpertise: localizedList(row.areasOfExpertise),
    responsibilities: localizedList(row.responsibilities),
    services: localizedList(row.services),
    ...(row.additionalInformationEn || row.additionalInformationUr ? { additionalInformation: { en: row.additionalInformationEn || "", ur: row.additionalInformationUr || "" } } : {}),
    ...(row.contactEmail || row.contactPhone ? { contact: { ...(row.contactEmail ? { email: row.contactEmail } : {}), ...(row.contactPhone ? { phone: row.contactPhone } : {}) } } : {}),
  };
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Scholar records are unavailable.");
  return response.json() as Promise<T>;
}

export function usePublishedScholars() {
  const [scholars, setScholars] = useState<ScholarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    request<ApiScholar[]>("/api/scholars")
      .then(rows => { if (active) setScholars(rows.map(toScholarProfile)); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { scholars, loading, failed };
}

export function usePublishedScholar(slug: string) {
  const [scholar, setScholar] = useState<ScholarProfile | undefined>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    request<ApiScholar>(`/api/scholars/${encodeURIComponent(slug)}`)
      .then(row => { if (active) setScholar(toScholarProfile(row)); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return { scholar, loading, failed };
}
