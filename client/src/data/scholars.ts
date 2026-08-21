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

/**
 * Public scholar registry. Adding a published record here automatically exposes it
 * in the directory, homepage preview, and its reusable /scholars/:slug profile.
 * No portrait fields are intentionally included at the institution's request.
 */
export const SCHOLARS: ScholarProfile[] = [
  {
    slug: "mufti-abdul-mannan",
    isPublished: true,
    name: {
      en: "Hazrat Maulana Mufti Abdul Mannan Sahib",
      ur: "حضرت مولانا مفتی عبد المنان صاحب",
    },
    designation: {
      en: "Scholarly Supervisor",
      ur: "سرپرستِ علمی",
    },
    organisation: {
      en: "Darul Ifta Irshad-us-Saileen Karachi",
      ur: "دارالافتاء ارشاد السائلین کراچی",
    },
    shortIntroduction: {
      en: "The Darul Ifta carries out its religious and Shariah services under his supervision and scholarly guidance.",
      ur: "دارالافتاء کی دینی و شرعی خدمات آپ کی زیرِ نگرانی اور علمی رہنمائی میں انجام دی جاتی ہیں۔",
    },
    introduction: {
      en: "Mufti Abdul Mannan Sahib is recognised as an experienced scholar and mufti associated with Jamia Darul Uloom Karachi. He has been connected with Dar al-Ifta work for many years, serving in the resolution of Shariah questions, fiqh research, and the preparation of fatwas.",
      ur: "حضرت مولانا مفتی عبد المنان صاحب جامعہ دارالعلوم کراچی کے معروف اور تجربہ کار علماء و مفتیانِ کرام میں شمار ہوتے ہیں۔ آپ ایک طویل عرصے سے دارالافتاء سے وابستہ ہیں اور شرعی مسائل کے حل، فقہی تحقیق اور فتاویٰ کی تیاری میں خدمات انجام دے رہے ہیں۔",
    },
    educationalBackground: {
      en: "Associated with Jamia Darul Uloom Karachi and experienced in Dar al-Ifta work.",
      ur: "جامعہ دارالعلوم کراچی سے وابستہ اور دارالافتاء کے علمی کام میں تجربہ رکھتے ہیں۔",
    },
    islamicQualifications: [
      {
        en: "Experienced scholar and mufti associated with Jamia Darul Uloom Karachi.",
        ur: "جامعہ دارالعلوم کراچی سے وابستہ تجربہ کار عالم و مفتی۔",
      },
    ],
    areasOfExpertise: [
      { en: "Islamic jurisprudence", ur: "فقہِ اسلامی" },
      { en: "Fiqh research", ur: "فقہی تحقیق" },
      { en: "Shariah responses to contemporary matters", ur: "عصری مسائل کے شرعی حل" },
      { en: "Preparation of fatwas", ur: "فتاویٰ کی تیاری" },
    ],
    responsibilities: [
      { en: "Scholarly supervision of Darul Ifta services", ur: "دارالافتاء کی خدمات کی علمی نگرانی" },
      { en: "Review of public Shariah questions", ur: "عوام کے شرعی سوالات کا جائزہ" },
      { en: "Guidance for fiqh research and fatwa preparation", ur: "فقہی تحقیق اور فتاویٰ کی تیاری میں رہنمائی" },
    ],
    services: [
      {
        en: "Scholarly guidance on Islamic jurisprudence and contemporary Shariah matters.",
        ur: "فقہِ اسلامی اور عصری شرعی مسائل کے حوالے سے علمی رہنمائی۔",
      },
      {
        en: "Responsible review of questions in the light of the Qur’an, Sunnah, and Islamic jurisprudence.",
        ur: "قرآن و سنت اور فقہِ اسلامی کی روشنی میں سوالات کا ذمہ دارانہ جائزہ۔",
      },
    ],
    additionalInformation: {
      en: "Under his scholarly guidance, public questions are reviewed in the light of the Qur’an, Sunnah, and Islamic jurisprudence, with the aim of providing sound and responsible guidance wherever possible.",
      ur: "آپ کی علمی رہنمائی میں عوام کے شرعی سوالات کا قرآن و سنت اور فقہِ اسلامی کی روشنی میں جائزہ لیا جاتا ہے اور حتی الامکان مستند اور ذمہ دارانہ شرعی رہنمائی فراہم کی جاتی ہے۔",
    },
  },
];

export const PUBLISHED_SCHOLARS = SCHOLARS.filter((scholar) => scholar.isPublished);

export function getPublishedScholar(slug: string) {
  return PUBLISHED_SCHOLARS.find((scholar) => scholar.slug === slug);
}
