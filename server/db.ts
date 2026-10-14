import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

function createDatabase(databaseUrl: string) {
  return drizzle(mysql.createPool(databaseUrl), { schema, mode: "default" });
}

let database: ReturnType<typeof createDatabase> | undefined;

// In-memory mock store for environments without a live MySQL instance
interface InMemScholar {
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
  islamicQualifications: Array<{ en: string; ur: string }> | null;
  areasOfExpertise: Array<{ en: string; ur: string }> | null;
  responsibilities: Array<{ en: string; ur: string }> | null;
  services: Array<{ en: string; ur: string }> | null;
  additionalInformationEn: string | null;
  additionalInformationUr: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Array<{ label: { en: string; ur: string }; href: string }> | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const defaultScholars: InMemScholar[] = [
  {
    id: 1,
    slug: "mufti-abdul-mannan",
    nameEn: "Hazrat Maulana Mufti Abdul Mannan Sahib",
    nameUr: "حضرت مولانا مفتی عبد المنان صاحب",
    titleEn: "Supervising Mufti",
    titleUr: "نگراں مفتی",
    organizationEn: "Darul Ifta Irshad-us-Saileen Karachi / Jamia Darul Uloom Karachi",
    organizationUr: "دارالافتاء ارشاد السائلین کراچی / جامعہ دارالعلوم کراچی",
    shortIntroductionEn: "Senior scholar and supervising mufti providing authentic Islamic legal guidance.",
    shortIntroductionUr: "سینئر عالم اور نگراں مفتی جو مستند شرعی رہنمائی فراہم کرتے ہیں۔",
    introductionEn: "Hazrat Maulana Mufti Abdul Mannan Sahib oversees the fatwa issuance and scholarly research at Darul Ifta Irshad-us-Saileen Karachi. With decades of rigorous scholarly experience rooted in the traditional curriculum of Jamia Darul Uloom Karachi, he provides meticulous supervision for theological questions and complex contemporary inquiries.",
    introductionUr: "حضرت مولانا مفتی عبد المنان صاحب دارالافتاء ارشاد السائلین کراچی میں فتویٰ نویسی اور علمی و تحقیقی امور کی نگرانی فرماتے ہیں۔ جامعہ دارالعلوم کراچی کے روایتی تعلیمی نظام سے فیض یافتہ ہونے کے ناطے آپ پیچیدہ فقہی اور جدید مسائل میں مستند اور محتاط شرعی رہنمائی فراہم کرتے ہیں۔",
    educationalBackgroundEn: "Graduated with highest honors from Jamia Darul Uloom Karachi with specialization in Islamic Jurisprudence (Takhassus fil-Ifta).",
    educationalBackgroundUr: "جامعہ دارالعلوم کراچی سے درسِ نظامی کی تکمیل اور تخصص فی الافتاء کی سندِ امتیاز حاصل کی۔",
    islamicQualifications: [
      { en: "Takhassus fil-Ifta (Specialization in Islamic Jurisprudence), Jamia Darul Uloom Karachi", ur: "تخصص فی الافتاء، جامعہ دارالعلوم کراچی" },
      { en: "Dars-e-Nizami (Alimiyyah Degree), Jamia Darul Uloom Karachi", ur: "درسِ نظامی (شہادۃ العالمیہ)، جامعہ دارالعلوم کراچی" },
    ],
    areasOfExpertise: [
      { en: "Islamic Jurisprudence (Fiqh & Ifta)", ur: "فقہ و افتاء" },
      { en: "Inheritance & Estate Distribution (Mawarith)", ur: "میراث و ترکہ" },
      { en: "Commercial Transactions & Islamic Banking", ur: "معاملات اور اسلامی مالیات" },
      { en: "Marital & Family Law", ur: "نکاح، طلاق اور عائلی امور" },
    ],
    responsibilities: [
      { en: "Supervision and final seal on issued fatawa", ur: "جاری کردہ فتاویٰ کی توثیق اور حتمی مہر" },
      { en: "Academic review of research papers and articles", ur: "علمی مقالات اور تحقیقاتی مضامین کا جائزہ" },
    ],
    services: [
      { en: "Written religious verdicts (Fatawa)", ur: "تحریری فتاویٰ اور شرعی رہنمائی" },
      { en: "Mediation and arbitration in family and business matters", ur: "خاندانی اور کاروباری تنازعات میں شرعی مصالحت" },
    ],
    additionalInformationEn: null,
    additionalInformationUr: null,
    contactEmail: "ask.darulifta.irshadussaileen@gmail.com",
    contactPhone: null,
    socialLinks: [],
    isPublished: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
];

const inMemoryStore = {
  scholars: JSON.parse(JSON.stringify(defaultScholars)).map((s: InMemScholar) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  })) as InMemScholar[],
  dailyPostCategories: [
    { id: 1, slug: "islamic-reminder", nameEn: "Islamic Reminder", nameUr: "اسلامی یاددہانی", nameAr: "تذكرة إسلامية", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, slug: "fatwa", nameEn: "Fatwa", nameUr: "فتویٰ", nameAr: "فتوى", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, slug: "quran", nameEn: "Quran", nameUr: "قرآن", nameAr: "القرآن", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, slug: "hadith", nameEn: "Hadith", nameUr: "حدیث", nameAr: "حديث", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 40, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, slug: "islamic-knowledge", nameEn: "Islamic Knowledge", nameUr: "اسلامی معلومات", nameAr: "المعرفة الإسلامية", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 50, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 6, slug: "important-announcement", nameEn: "Important Announcement", nameUr: "اہم اعلان", nameAr: "إعلان مهم", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 60, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 7, slug: "other", nameEn: "Other", nameUr: "دیگر", nameAr: "أخرى", descriptionEn: null, descriptionUr: null, descriptionAr: null, sortOrder: 70, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ] as Array<Record<string, unknown>>,
  dailyPosts: [] as Array<Record<string, unknown>>,
  whatsappSettings: {
    id: 1,
    channelUrl: "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q",
    importMode: "manual_only",
    autoPublish: true,
    isEnabled: true,
    lastImportAt: null,
    importedPostsCount: 0,
    failedImportsCount: 0,
    lastFailureMessage: null,
    updatedAt: new Date(),
  } as Record<string, unknown>,
  dailyPostImports: [] as Array<Record<string, unknown>>,
  nextScholarId: 2,
  nextPostId: 1,
  nextCategoryId: 8,
  nextImportId: 1,
};

function getTableName(table: unknown): string {
  if (!table || typeof table !== "object") return "";
  const t = table as Record<string, unknown>;
  if (typeof t.name === "string") return t.name;
  for (const sym of Object.getOwnPropertySymbols(t)) {
    if (sym.description === "drizzle:Name" || sym.description === "drizzle:BaseName") {
      const val = (t as Record<symbol, unknown>)[sym];
      if (typeof val === "string") return val;
    }
  }
  return "";
}

function evalCondition(item: Record<string, unknown>, cond: unknown): boolean {
  if (!cond || typeof cond !== "object") return true;
  const c = cond as { queryChunks?: unknown[] };
  if (!c.queryChunks) return true;

  const chunks = c.queryChunks;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] as { queryChunks?: unknown[]; name?: string; value?: unknown };
    if (chunk && chunk.queryChunks) {
      if (!evalCondition(item, chunk)) return false;
    }
    const col = chunk?.name;
    const op = (chunks[i + 1] as { value?: string[] })?.value?.[0]?.trim();
    if (col && (op === "=" || op === "!=" || op === "<>")) {
      const valParam = chunks[i + 2] as { value?: unknown };
      const val = valParam?.value !== undefined ? valParam.value : valParam;
      const itemVal = item[col];
      const match = itemVal === val || (typeof itemVal === "boolean" && itemVal === Boolean(val));
      if (op === "=" && !match) return false;
      if ((op === "!=" || op === "<>") && match) return false;
    }
  }
  return true;
}

function createMockDb(): unknown {
  return {
    select(fields?: unknown) {
      let targetTable = "";
      let condition: unknown = undefined;
      let limitCount: number | undefined = undefined;
      let offsetCount = 0;
      let isCountQuery = false;

      if (fields && typeof fields === "object") {
        const f = fields as Record<string, unknown>;
        if (f.value && typeof f.value === "object" && (f.value as { mapWith?: unknown }).mapWith) {
          isCountQuery = true;
        }
      }

      const builder = {
        from(table: unknown) {
          targetTable = getTableName(table);
          return builder;
        },
        leftJoin(_table: unknown, _cond: unknown) {
          return builder;
        },
        where(cond: unknown) {
          condition = cond;
          return builder;
        },
        orderBy(..._args: unknown[]) {
          return builder;
        },
        limit(countNum: number) {
          limitCount = countNum;
          return builder;
        },
        offset(offsetNum: number) {
          offsetCount = offsetNum;
          return builder;
        },
        then(onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
          try {
            let collection: Array<Record<string, unknown>> = [];
            if (targetTable === "scholars") {
              collection = inMemoryStore.scholars as unknown as Array<Record<string, unknown>>;
            } else if (targetTable === "dailyPosts") {
              collection = inMemoryStore.dailyPosts;
            } else if (targetTable === "dailyPostCategories") {
              collection = inMemoryStore.dailyPostCategories;
            } else if (targetTable === "whatsappChannelImportSettings") {
              collection = [inMemoryStore.whatsappSettings];
            } else if (targetTable === "dailyPostImports") {
              collection = inMemoryStore.dailyPostImports;
            }

            let filtered = condition ? collection.filter(item => evalCondition(item, condition)) : [...collection];

            if (isCountQuery) {
              const result = [{ value: filtered.length }];
              return Promise.resolve(result).then(onfulfilled, onrejected);
            }

            if (offsetCount > 0) {
              filtered = filtered.slice(offsetCount);
            }
            if (limitCount !== undefined) {
              filtered = filtered.slice(0, limitCount);
            }

            return Promise.resolve(filtered.map(x => ({ ...x }))).then(onfulfilled, onrejected);
          } catch (e) {
            if (onrejected) return Promise.reject(e).catch(onrejected);
            throw e;
          }
        },
      };

      return builder;
    },

    insert(table: unknown) {
      const targetTable = getTableName(table);
      let valuesToInsert: Record<string, unknown> = {};

      const builder = {
        values(val: Record<string, unknown>) {
          valuesToInsert = { ...val };
          return builder;
        },
        $returningId() {
          let id = 1;
          const now = new Date();
          if (targetTable === "scholars") {
            id = inMemoryStore.nextScholarId++;
            const record: InMemScholar = {
              id,
              slug: String(valuesToInsert.slug || `scholar-${id}`),
              nameEn: String(valuesToInsert.nameEn || ""),
              nameUr: String(valuesToInsert.nameUr || ""),
              titleEn: (valuesToInsert.titleEn as string) || null,
              titleUr: (valuesToInsert.titleUr as string) || null,
              organizationEn: (valuesToInsert.organizationEn as string) || null,
              organizationUr: (valuesToInsert.organizationUr as string) || null,
              shortIntroductionEn: (valuesToInsert.shortIntroductionEn as string) || null,
              shortIntroductionUr: (valuesToInsert.shortIntroductionUr as string) || null,
              introductionEn: (valuesToInsert.introductionEn as string) || null,
              introductionUr: (valuesToInsert.introductionUr as string) || null,
              educationalBackgroundEn: (valuesToInsert.educationalBackgroundEn as string) || null,
              educationalBackgroundUr: (valuesToInsert.educationalBackgroundUr as string) || null,
              islamicQualifications: (valuesToInsert.islamicQualifications as InMemScholar["islamicQualifications"]) || null,
              areasOfExpertise: (valuesToInsert.areasOfExpertise as InMemScholar["areasOfExpertise"]) || null,
              responsibilities: (valuesToInsert.responsibilities as InMemScholar["responsibilities"]) || null,
              services: (valuesToInsert.services as InMemScholar["services"]) || null,
              additionalInformationEn: (valuesToInsert.additionalInformationEn as string) || null,
              additionalInformationUr: (valuesToInsert.additionalInformationUr as string) || null,
              contactEmail: (valuesToInsert.contactEmail as string) || null,
              contactPhone: (valuesToInsert.contactPhone as string) || null,
              socialLinks: (valuesToInsert.socialLinks as InMemScholar["socialLinks"]) || null,
              isPublished: Boolean(valuesToInsert.isPublished),
              createdAt: now,
              updatedAt: now,
            };
            inMemoryStore.scholars.push(record);
          } else if (targetTable === "dailyPosts") {
            id = inMemoryStore.nextPostId++;
            inMemoryStore.dailyPosts.push({ id, ...valuesToInsert, createdAt: now, updatedAt: now });
          } else if (targetTable === "dailyPostCategories") {
            id = inMemoryStore.nextCategoryId++;
            inMemoryStore.dailyPostCategories.push({ id, ...valuesToInsert, createdAt: now, updatedAt: now });
          } else if (targetTable === "dailyPostImports") {
            id = inMemoryStore.nextImportId++;
            inMemoryStore.dailyPostImports.push({ id, ...valuesToInsert, importedAt: now });
          }

          return Promise.resolve([{ id }]);
        },
        then(onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
          return builder.$returningId().then(onfulfilled, onrejected);
        },
      };

      return builder;
    },

    update(table: unknown) {
      const targetTable = getTableName(table);
      let valuesToSet: Record<string, unknown> = {};

      const builder = {
        set(val: Record<string, unknown>) {
          valuesToSet = { ...val };
          return builder;
        },
        where(condition: unknown) {
          return {
            then(onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
              try {
                let collection: Array<Record<string, unknown>> = [];
                if (targetTable === "scholars") {
                  collection = inMemoryStore.scholars as unknown as Array<Record<string, unknown>>;
                } else if (targetTable === "dailyPosts") {
                  collection = inMemoryStore.dailyPosts;
                } else if (targetTable === "dailyPostCategories") {
                  collection = inMemoryStore.dailyPostCategories;
                } else if (targetTable === "whatsappChannelImportSettings") {
                  Object.assign(inMemoryStore.whatsappSettings, valuesToSet, { updatedAt: new Date() });
                  return Promise.resolve([]).then(onfulfilled, onrejected);
                }

                for (let i = 0; i < collection.length; i++) {
                  if (evalCondition(collection[i], condition)) {
                    Object.assign(collection[i], valuesToSet, { updatedAt: new Date() });
                  }
                }
                return Promise.resolve([]).then(onfulfilled, onrejected);
              } catch (e) {
                if (onrejected) return Promise.reject(e).catch(onrejected);
                throw e;
              }
            },
          };
        },
      };

      return builder;
    },

    delete(table: unknown) {
      const targetTable = getTableName(table);
      return {
        where(condition: unknown) {
          return {
            then(onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
              try {
                if (targetTable === "scholars") {
                  inMemoryStore.scholars = inMemoryStore.scholars.filter(
                    s => !evalCondition(s as unknown as Record<string, unknown>, condition)
                  );
                } else if (targetTable === "dailyPosts") {
                  inMemoryStore.dailyPosts = inMemoryStore.dailyPosts.filter(
                    p => !evalCondition(p, condition)
                  );
                } else if (targetTable === "dailyPostCategories") {
                  inMemoryStore.dailyPostCategories = inMemoryStore.dailyPostCategories.filter(
                    c => !evalCondition(c, condition)
                  );
                }
                return Promise.resolve([]).then(onfulfilled, onrejected);
              } catch (e) {
                if (onrejected) return Promise.reject(e).catch(onrejected);
                throw e;
              }
            },
          };
        },
      };
    },
  };
}

let mockDatabase: ReturnType<typeof createDatabase> | undefined;

export function getDb(): ReturnType<typeof createDatabase> {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (!database) {
      database = createDatabase(databaseUrl);
    }
    return database;
  }

  if (!mockDatabase) {
    mockDatabase = createMockDb() as ReturnType<typeof createDatabase>;
  }
  return mockDatabase;
}
