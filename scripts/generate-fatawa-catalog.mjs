import fs from "node:fs";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const manifest = fs.readFileSync("/home/ubuntu/webdev-static-assets/fatawa/upload_manifest.txt", "utf8");
const urlByPosition = new Map(
  [...manifest.matchAll(/Storage Path: \/manus-storage\/fatwa-(\d+)_([^\s]+)/g)].map((match) => [Number(match[1]), `/manus-storage/fatwa-${match[1]}_${match[2]}`]),
);

const records = [
  ["A0001", "وراثت میں بیوہ اور بھتیجوں کا حق اور سوتیلا بھائی بہن", "Inheritance & Wills"],
  ["A0002", "غیر متعین ملکیت کی وراثت", "Inheritance & Wills"],
  ["A0003", "کسی عذر سے منہ بند کرکے بغیر ہونٹوں کی حرکت سے نماز پڑھنا", "Worship"],
  ["A0004", "وراثت میں بھتیجے اور بھتیجیوں کا حصہ", "Inheritance & Wills"],
  ["A0005", "وراثت میں بیوہ اور بھتیجوں کا حق اور سوتیلا بھائی بہن", "Inheritance & Wills"],
  ["A0006", "گولڈن ہینڈ شیک اسکیم سے ملنے والی رقم اور تجارتی رقوم پر زکوٰۃ کا حکم", "Transactions"],
  ["A0007", "بیوی کو دو طلاق کا بتایا مگر لکھی ایک طلاق تھی", "Marriage & Divorce"],
  ["A0011", "عربی کے علاوہ کسی اور زبان میں نماز ادا کرنا درست نہیں", "Worship"],
  ["A0012", "نامحرم کو سلام کرنا", "Belief & Conduct"],
  ["A0013", "بلادِ بعیدہ (دور کے علاقوں) میں اختلافِ مطالع معتبر ہے", "Worship"],
  ["A0015", "نشے اور شدید غصے میں طلاق کا حکم", "Marriage & Divorce"],
  ["A0017", "ایسی چیز کا حکم جس کا اصل مالک معلوم نہ ہو یا اس سے رابطہ نہ ہو سکے", "Transactions"],
  ["A0022", "پاکی اور ناپاکی کے متفرق مسائل", "Worship"],
  ["A0028", "تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0031", "جوتے پہن کر نماز پڑھنا", "Worship"],
  ["A0037", "مروجہ زمانے میں مفقودۃ الزوج کا حکم", "Marriage & Divorce"],
  ["A0039", "پرندے پکڑنے کا حکم", "Belief & Conduct"],
  ["A0042", "حرم شریف میں امام سے آگے کھڑا ہونا اور اتصالِ صفوف کا مسئلہ", "Worship"],
  ["A0044", "دماغی مریض کی جائیداد اس کی زندگی میں تقسیم کرنا", "Inheritance & Wills"],
  ["A0045", "بیوی مدعیِ طلاق ہو اور شوہر منکر ہو، شوہر کے انتقال کے بعد میراث کا حکم", "Marriage & Divorce"],
  ["A0046", "تین بھائی اور دو بہنوں میں میراث مع مناسخہ", "Inheritance & Wills"],
  ["A0047", "شرکت و مضاربت میں تقسیمِ نفع کا طریقۂ کار", "Transactions"],
  ["A0048", "گھر کی پگڑی رکھنا اور وراثت کا معاملہ", "Inheritance & Wills"],
  ["A0051", "متبنیٰ (Baby Adoption) کے شرعی احکام", "Belief & Conduct"],
  ["A0053", "اولاد نہ ہونے کی صورت میں تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0054", "آسٹریلیا میں بذریعۂ بینک گھر خریدنا", "Transactions"],
  ["A0055", "کام ہونے پر وعدۂ طلاق سے طلاق کا وقوع", "Marriage & Divorce"],
  ["A0056", "پنشن سے محروم کرنے کے لیے طلاق کے پیپر جمع کروانا", "Marriage & Divorce"],
  ["A0057", "تختی پر لکھی ہوئی قرآنی آیت کا طہارت کے بغیر چھونا جائز نہیں", "Worship"],
  ["A0058", "مضارب کا اپنا منافع مخفی رکھنا اور رب المال کے لیے منافع متعین کرنا", "Transactions"],
  ["A0060", "تین بیٹے اور دو بیٹیوں کے درمیان تقسیمِ وراثت مع مناسخہ", "Inheritance & Wills"],
  ["A0062", "تقسیمِ وراثت مع مناسخہ دو بطن", "Inheritance & Wills"],
  ["A0063", "عورت کا بھنویں بنوانا", "Belief & Conduct"],
  ["A0064", "شاپنگ مالز اور رہائشی پلازوں میں ناقص ملکیت کی جگہ خریدنا", "Transactions"],
  ["A0065", "نماز کے لیے عمامہ باندھنا، مسنون قراءت کی مقدار", "Worship"],
  ["A0067", "نفلی صدقہ کا مصرف", "Belief & Conduct"],
  ["A0068", "ایک ساتھ تین طلاقِ بائن کا حکم", "Marriage & Divorce"],
  ["A0069", "صرف رجسٹری کرنے سے ہبہ مکمل نہیں ہوتا", "Inheritance & Wills"],
  ["A0075", "والدین، اولاد اور شوہر میں تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0076", "جادو، جادوگر سے رجوع اور عملیات کے لیے جانور دینے کا شرعی حکم", "Belief & Conduct"],
  ["A0078", "دو بیویاں، سات بیٹے اور تین بیٹیوں میں تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0085", "بھتیجے، بھتیجیوں اور بھانجوں کا وراثت میں حصہ", "Inheritance & Wills"],
  ["A0086", "ایک بھائی اور چھ بہنوں میں تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0088", "ایک مجلس کی تین طلاق کا حکم", "Marriage & Divorce"],
  ["A0091", "بیٹی کا حقِ وراثت جہیز کی وجہ سے کم نہیں ہوتا", "Inheritance & Wills"],
  ["A0092", "سات سال کی زکوٰۃ ادائیگی کا طریقہ", "Worship"],
  ["A0093", "تقسیمِ وراثت مع مناسخہ", "Inheritance & Wills"],
  ["A0099", "بیٹی کے انتقال کے بعد اس کا سامان گھر لانا", "Inheritance & Wills"],
  ["A0100", "شوہر کے پیسوں میں سے بلا اجازت پنیر قم وصول کرنا", "Transactions"],
];

if (urlByPosition.size !== records.length) {
  throw new Error(`Expected ${records.length} uploaded PDFs; found ${urlByPosition.size}.`);
}

const categories = ["Worship", "Transactions", "Marriage & Divorce", "Inheritance & Wills", "Belief & Conduct"];
const archiveNoticeUr = "مکمل سوال، جواب اور تحقیقی تفصیل کے لیے اصل پی ڈی ایف فتویٰ ملاحظہ کریں۔";
const archiveNoticeEn = "Open the original PDF for the complete question, researched answer, and supporting detail.";

const fatawa = records.map(([number, titleUr, category], index) => ({
  slug: `${number.toLowerCase()}-${index + 1}`,
  number,
  category,
  date: "PDF Archive",
  scholar: "دارالافتاء ارشاد السائلین",
  titleEn: `Fatwa Archive · ${number}`,
  titleUr,
  questionEn: archiveNoticeEn,
  questionUr: archiveNoticeUr,
  answerEn: archiveNoticeEn,
  answerUr: archiveNoticeUr,
  reference: "Original Darul Ifta PDF document.",
  topics: [category, number],
  pdfUrl: urlByPosition.get(index + 1),
}));

const file = `/** Royal Calligraphy House: complete user-supplied Darul Ifta PDF archive, searchable by Urdu title and category. */
export type FatwaCategory = ${categories.map((category) => JSON.stringify(category)).join(" | ")};
export type Fatwa = { slug: string; number: string; category: FatwaCategory; date: string; scholar: string; titleEn: string; titleUr: string; questionEn: string; questionUr: string; answerEn: string; answerUr: string; reference: string; topics: string[]; pdfUrl: string };

export const FATAWA: Fatwa[] = ${JSON.stringify(fatawa, null, 2)};

export const CATEGORY_LABELS: Record<FatwaCategory, string> = {
  "Worship": "عبادات / Worship",
  "Transactions": "معاملات / Transactions",
  "Marriage & Divorce": "نکاح و طلاق / Marriage & Divorce",
  "Inheritance & Wills": "وراثت / Inheritance",
  "Belief & Conduct": "عقائد و معاشرت / Belief & Conduct"
};
`;

fs.writeFileSync(`${root}/client/src/data/fatawa.ts`, file);
console.log(`Generated ${fatawa.length} fatwa records.`);
