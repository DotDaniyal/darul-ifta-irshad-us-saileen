import { z } from "zod";

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(96);
const optionalText = z.string().trim().max(5000).nullable().optional();
const name = z.string().trim().min(2).max(180);

export const scholarProfileInput = z.object({
  userId: z.number().int().positive(), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), honorific: z.string().trim().max(80).nullable().optional(),
  displayNameEn: name.nullable().optional(), displayNameUr: name.nullable().optional(), displayNameAr: name.nullable().optional(),
  biographyEn: optionalText, biographyUr: optionalText, biographyAr: optionalText, scholarlyLineage: optionalText,
  qualifications: z.array(z.string().trim().min(2).max(220)).max(20).default([]), isPublished: z.boolean().default(false),
});

export const categoryInput = z.object({ id: z.number().int().positive().optional(), slug, nameEn: name, nameUr: z.string().trim().max(160).nullable().optional(), nameAr: z.string().trim().max(160).nullable().optional(), descriptionEn: optionalText, sortOrder: z.number().int().min(0).max(9999).default(0), isActive: z.boolean().default(true) });
export const methodologyInput = z.object({ id: z.number().int().positive().optional(), slug, nameEn: name, nameUr: z.string().trim().max(160).nullable().optional(), nameAr: z.string().trim().max(160).nullable().optional(), methodologyStatement: optionalText, isActive: z.boolean().default(true) });
export const policyKeys = ["methodology", "privacy", "guidance", "publication"] as const;
export const policyInput = z.object({ key: z.enum(policyKeys), titleEn: name, titleUr: z.string().trim().min(2).max(180), bodyEn: z.string().trim().min(20).max(5000), bodyUr: z.string().trim().min(20).max(5000) });
