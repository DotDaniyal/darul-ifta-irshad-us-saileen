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
  ["A0104", "عذر کی وجہ سے ناک میں پانی ڈالنے کی رخصت", "Worship"],
  ["A0107", "گزشتہ سالوں کی زکوٰۃ ادا کرنا لازم ہے", "Worship"],
  ["A0108", "کھانے سے پہلے اور بعد میں نمک چاٹنا", "Belief & Conduct"],
  ["A0113", "والد کے خلاف کیس کرنا: نئی تحقیق", "Belief & Conduct"],
  ["A0115", "منت (نذر) پوری کرنے کی استطاعت نہ ہو تو کیا کرے", "Worship"],
  ["A0132", "الفاظِ طلاق میں میاں بیوی کا اختلاف", "Marriage & Divorce"],
  ["A0143", "ستہ شوال کی شرعی حیثیت", "Worship"],
  ["A0153", "کسی کا پالتو پرندہ گھر آ جائے تو کیا حکم ہے؟", "Transactions"],
  ["A0158", "تقسیمِ وراثت: بیوی، دو بہنیں اور دو چچا", "Inheritance & Wills"],
  ["A0159", "ادھار پر سونا خریدنا اور اس کی زکوٰۃ کے مسائل (2)", "Transactions"],
  ["A0159", "ادھار پر سونا خریدنا اور اس کی زکوٰۃ کے مسائل", "Transactions"],
  ["A0160", "تقسیمِ وراثت: اولاد کی موجودگی میں پوتوں کا حصہ", "Inheritance & Wills"],
  ["A0163", "کورٹ کی یک طرفہ خلع، متعنت شوہر کے حوالے سے", "Marriage & Divorce"],
  ["A0164", "ماں، بیوی، تین بیٹوں اور دو بیٹیوں میں تقسیمِ میراث اور وصیت کا حکم", "Inheritance & Wills"],
  ["A0165", "غصے میں بیوی کو تیسری طلاق دے دی تو شرعی حکم (2)", "Marriage & Divorce"],
  ["A0165", "غصے میں بیوی کو تیسری طلاق دے دی تو شرعی حکم", "Marriage & Divorce"],
  ["A0167", "مصنوعی بال لگانا", "Belief & Conduct"],
  ["A0171", "مغالطۂ طلاق کی بنیاد پر اخبارِ طلاق کا حکم (د)", "Marriage & Divorce"],
  ["A0172", "تقسیمِ وراثت: دو بیٹے، زوجہ اور بیٹی کے درمیان", "Inheritance & Wills"],
  ["A0173", "عشاء سے قبل چار رکعت اور وتر کا مسئلہ", "Worship"],
  ["A0173", "عشاء کی سننِ غیر مؤکدہ اور تعدادِ رکعاتِ وتر کی تحقیق", "Worship"],
  ["A0182", "کلمہ پڑھنے پر مکمل مسلمانوں والے حقوق ملنا", "Belief & Conduct"],
  ["A0197", "بالغ معذور لڑکے کو استنجاء کی صفائی ماں کروا سکتی ہے", "Worship"],
  ["A0198", "گڑیا اور کرسمس کے تحائف کا حکم", "Belief & Conduct"],
  ["A0199", "دو بیویاں، 4 بیٹے اور 6 بیٹیوں میں تقسیمِ میراث", "Inheritance & Wills"],
];

const importedA02Records = [
  ["A0201", "تین طلاق اور نفاذِ طلاق کے لیے گواہی کا حکم", "Marriage & Divorce"],
  ["A0202", "سرمایہ کاری میں منافع کی تقسیم اور سرمایہ کاری واپس نکالنے کا معاملہ", "Transactions"],
  ["A0203", "آنکھ میں زخم کی صورت میں وضو کا حکم", "Worship"],
  ["A0204", "مفقودہ کا شوہر واپس آنے کا حکم", "Marriage & Divorce"],
  ["A0208", "زکوٰۃ کی عدم ادائیگی کا شبہ ہو", "Worship"],
  ["A0211", "مجبوری میں حرام کھانے والے کے احکام", "Belief & Conduct"],
  ["A0212", "جگہ تنگ ہونے کی بنا پر ایک مسجد میں دو جماعتیں کروانا", "Worship"],
  ["A0213", "پانچ بندوں کی بکنگ میں چھ بندوں کا کھانا", "Transactions"],
  ["A0221", "کاروبار میں سرمایہ کاری کی شرائط", "Transactions"],
  ["A0223", "حالتِ حمل اور نشہ کی حالت میں طلاق کا حکم", "Marriage & Divorce"],
  ["A0225", "دماغی معذور سے پردے کا حکم", "Belief & Conduct"],
  ["A0227", "نفلی عمرہ و طواف میں تعددِ نیت اور مصلی کے سامنے سے گزرنا", "Worship"],
  ["A0230", "دانت پر بینڈج کی صورت میں روزہ کے حکم", "Worship"],
  ["A0231", "بچی کی نانی کا زیادہ خرچ مانگنا اور بیٹی کی کفالت", "Belief & Conduct"],
  ["A0233", "زندگی میں تقسیمِ جائیداد", "Inheritance & Wills"],
  ["A0234", "کورٹ کی یک طرفہ خلع، متعنت شوہر کے حوالے سے (مختصر)", "Marriage & Divorce"],
  ["A0235", "کھاد کی رقم ادھار دینے پر معاہدہ طے کرنا", "Transactions"],
  ["A0237", "سالگرہ منانے کی شرعی حیثیت", "Belief & Conduct"],
  ["A0252", "دو حصوں میں تقسیمِ وراثت", "Inheritance & Wills"],
  ["A0254", "حیض میں کبھی ابتداء بالطہر بھی ہوتی ہے", "Worship"],
  ["A0268", "آسٹریلیا میں ڈاکٹروں کا ٹیکس بچانے کے لیے قانونی حیلہ اختیار کرنے کی شرعی حیثیت", "Transactions"],
  ["A0272", "ذہنی معذور بوڑھے کے لیے عمرے کے احکام", "Worship"],
  ["A0281", "ملازم کی تنخواہ سے کٹوتی کا معاملہ", "Transactions"],
  ["A0283", "اٹھائیس سال سے رکھے زیور کی زکوٰۃ کا مسئلہ", "Worship"],
  ["A0285", "مختلف مواقع پر طلاق کا حکم", "Marriage & Divorce"],
  ["A0286", "فجر کی جماعت کے وقت سنت ادا کرنا", "Worship"],
  ["A0288", "ثبوتِ رضاعت کے لیے بنیادی شرائط", "Marriage & Divorce"],
  ["A0289", "گندم قرض کے طور پر دینا اور پھر کرایہ وصول کرنا", "Transactions"],
  ["A0290", "گندم کے ریٹ اور عشر کا مسئلہ", "Worship"],
  ["A0291", "دعائے عاشوراء کی تحقیق", "Worship"],
  ["A0296", "ایک ہی راستے میں دوبارہ آنا پھر جانا سفرِ شرعی شمار ہو گا یا نہیں", "Worship"],
  ["A0300", "قبرستان میں داخل ہونے والی دعا کی تحقیق", "Worship"],
];

const a02UrlByNumber = new Map([
  ["A0201", "/manus-storage/A0201_bc92ac44.pdf"], ["A0202", "/manus-storage/A0202_95348363.pdf"],
  ["A0203", "/manus-storage/A0203_30d6a0be.pdf"], ["A0204", "/manus-storage/A0204_fd2c74d0.pdf"],
  ["A0208", "/manus-storage/A0208_16a4e395.pdf"], ["A0211", "/manus-storage/A0211_244bded5.pdf"],
  ["A0212", "/manus-storage/A0212_f3493c9a.pdf"], ["A0213", "/manus-storage/A0213_f443d90e.pdf"],
  ["A0221", "/manus-storage/A0221_7d2bbbad.pdf"], ["A0223", "/manus-storage/A0223_9fc30f69.pdf"],
  ["A0225", "/manus-storage/A0225_1417a9f8.pdf"], ["A0227", "/manus-storage/A0227_f93c2460.pdf"],
  ["A0230", "/manus-storage/A0230_259812d6.pdf"], ["A0231", "/manus-storage/A0231_43f6f33f.pdf"],
  ["A0233", "/manus-storage/A0233_9edfe9f3.pdf"], ["A0234", "/manus-storage/A0234_5b8e9fd3.pdf"],
  ["A0235", "/manus-storage/A0235_61bd4f65.pdf"], ["A0237", "/manus-storage/A0237_b49ade97.pdf"],
  ["A0252", "/manus-storage/A0252_4b58bc38.pdf"], ["A0254", "/manus-storage/A0254_4eba413d.pdf"],
  ["A0268", "/manus-storage/A0268_a86784af.pdf"], ["A0272", "/manus-storage/A0272_934efe68.pdf"],
  ["A0281", "/manus-storage/A0281_bc9ec9de.pdf"], ["A0283", "/manus-storage/A0283_86b3db94.pdf"],
  ["A0285", "/manus-storage/A0285_4b582634.pdf"], ["A0286", "/manus-storage/A0286_b96d76f5.pdf"],
  ["A0288", "/manus-storage/A0288_7acfe9b8.pdf"], ["A0289", "/manus-storage/A0289_9e6fc740.pdf"],
  ["A0290", "/manus-storage/A0290_b41ee9de.pdf"], ["A0291", "/manus-storage/A0291_2fdec51d.pdf"],
  ["A0296", "/manus-storage/A0296_57f00844.pdf"], ["A0300", "/manus-storage/A0300_e3ab9d9d.pdf"],
]);

const allRecords = [...records, ...importedA02Records];

if (urlByPosition.size !== records.length) {
  throw new Error(`Expected ${records.length} uploaded PDFs; found ${urlByPosition.size}.`);
}

if (a02UrlByNumber.size !== importedA02Records.length) {
  throw new Error(`Expected ${importedA02Records.length} supplied A02-series PDF URLs; found ${a02UrlByNumber.size}.`);
}

const categories = ["Worship", "Transactions", "Marriage & Divorce", "Inheritance & Wills", "Belief & Conduct"];
const archiveNoticeUr = "مکمل سوال، جواب اور تحقیقی تفصیل کے لیے اصل پی ڈی ایف فتویٰ ملاحظہ کریں۔";
const archiveNoticeEn = "Open the original PDF for the complete question, researched answer, and supporting detail.";

const fatawa = allRecords.map(([number, titleUr, category], index) => {
  const pdfUrl = urlByPosition.get(index + 1) ?? a02UrlByNumber.get(number);
  if (!pdfUrl) throw new Error(`Missing managed PDF URL for ${number}.`);

  return {
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
    pdfUrl,
  };
});

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
