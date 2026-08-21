/**
 * Shared public scholar shapes used by the live API client and profile UI.
 * Scholar records themselves are database-backed in the governed server registry.
 */
export type ScholarLanguage = "en" | "ur";

export type LocalizedScholarText = {
  en: string;
  ur: string;
};

export type ScholarProfile = {
  slug: string;
  isPublished: boolean;
  name: LocalizedScholarText;
  designation: LocalizedScholarText;
  organisation: LocalizedScholarText;
  shortIntroduction: LocalizedScholarText;
  introduction: LocalizedScholarText;
  educationalBackground: LocalizedScholarText;
  islamicQualifications: LocalizedScholarText[];
  areasOfExpertise: LocalizedScholarText[];
  responsibilities: LocalizedScholarText[];
  services: LocalizedScholarText[];
  contact?: {
    email?: string;
    phone?: string;
  };
  socialLinks?: {
    label: LocalizedScholarText;
    href: string;
  }[];
  additionalInformation?: LocalizedScholarText;
};
