import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cataloguePath = path.join(projectRoot, "client/src/data/fatawa.ts");
const source = await fs.readFile(cataloguePath, "utf8");
const match = source.match(/export const FATAWA: Fatwa\[\] = (\[[\s\S]*?\n\]);/);

if (!match) throw new Error("Could not parse the verified Fatwa catalogue.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to import the Fatwa catalogue.");

const fatawa = JSON.parse(match[1]);
const connection = await mysql.createConnection(process.env.DATABASE_URL);

const categoryDefinitions = {
  "Worship": ["worship", "Worship", "عبادات"],
  "Transactions": ["transactions", "Transactions", "معاملات"],
  "Marriage & Divorce": ["marriage-divorce", "Marriage & Divorce", "نکاح و طلاق"],
  "Inheritance & Wills": ["inheritance-wills", "Inheritance & Wills", "وراثت و وصیت"],
  "Belief & Conduct": ["belief-conduct", "Belief & Conduct", "عقیدہ و آداب"],
};

try {
  const [[owner]] = await connection.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
  if (!owner) throw new Error("An administrator account is required before importing published Fatwa records.");

  const categoryIds = new Map();
  for (const [name, [slug, nameEn, nameUr]] of Object.entries(categoryDefinitions)) {
    await connection.execute(
      `INSERT INTO fatwaCategories (slug, nameEn, nameUr, sortOrder, isActive)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE nameEn = VALUES(nameEn), nameUr = VALUES(nameUr), isActive = 1`,
      [slug, nameEn, nameUr, [...Object.keys(categoryDefinitions)].indexOf(name) + 1],
    );
    const [[category]] = await connection.execute("SELECT id FROM fatwaCategories WHERE slug = ? LIMIT 1", [slug]);
    categoryIds.set(name, category.id);
  }

  await connection.execute(
    `INSERT INTO fiqhMethodologies (slug, nameEn, nameUr, methodologyStatement, isActive)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       nameEn = VALUES(nameEn), nameUr = VALUES(nameUr),
       methodologyStatement = VALUES(methodologyStatement), isActive = 1`,
    [
      "authorised-scholarly-review",
      "Authorised scholarly review",
      "مجاز علمی نظرِ ثانی",
      "Administrative publication-control label only. It confirms an authorised scholarly review path and does not assert a particular madhhab; a formal fiqh methodology may be configured and published only by authorised administrators.",
    ],
  );
  const [[methodology]] = await connection.execute(
    "SELECT id FROM fiqhMethodologies WHERE slug = ? LIMIT 1",
    ["authorised-scholarly-review"],
  );

  const occurrences = new Map();
  for (const fatwa of fatawa) {
    const occurrence = (occurrences.get(fatwa.number) ?? 0) + 1;
    occurrences.set(fatwa.number, occurrence);
    const referenceNumber = occurrence === 1 ? fatwa.number : `${fatwa.number}-${occurrence}`;

    await connection.execute(
      `INSERT INTO fatwaRecords (
        slug, referenceNumber, categoryId, methodologyId, authorId, status, titleEn, titleUr,
        summaryEn, summaryUr, bodyEn, bodyUr, tags, publicPdfUrl, publishedAt
      ) VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        referenceNumber = VALUES(referenceNumber), categoryId = VALUES(categoryId),
        methodologyId = VALUES(methodologyId),
        titleEn = VALUES(titleEn), titleUr = VALUES(titleUr),
        summaryEn = VALUES(summaryEn), summaryUr = VALUES(summaryUr),
        bodyEn = VALUES(bodyEn), bodyUr = VALUES(bodyUr), tags = VALUES(tags),
        publicPdfUrl = VALUES(publicPdfUrl), status = 'published'`,
      [
        fatwa.slug,
        referenceNumber,
        categoryIds.get(fatwa.category),
        methodology.id,
        owner.id,
        fatwa.titleEn,
        fatwa.titleUr,
        fatwa.questionEn,
        fatwa.questionUr,
        fatwa.answerEn,
        fatwa.answerUr,
        JSON.stringify(fatwa.topics),
        fatwa.pdfUrl,
      ],
    );
  }

  console.log(`Imported ${fatawa.length} verified Fatwa records into governed published storage.`);
} finally {
  await connection.end();
}
