import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Heart, Landmark, ShieldCheck, Sparkles, Utensils, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "./SiteShell";

interface CategoryCardProps {
  id: string;
  categoryKey: string;
  titleUr: string;
  titleEn: string;
  descUr: string;
  descEn: string;
  count: number;
  icon: typeof Coins;
  accent: string;
}

const CATEGORIES: CategoryCardProps[] = [
  {
    id: "worship",
    categoryKey: "Worship",
    titleUr: "عبادات و طہارت",
    titleEn: "Taharah, Salah & Fasting",
    descUr: "نماز، روزہ، حج، عمرہ، طہارت اور غسل کے روزمرہ فقہی مسائل و احکام۔",
    descEn: "Rulings on purification, daily prayers, fasting, Hajj, Umrah, and personal worship.",
    count: 2450,
    icon: Sparkles,
    accent: "#075A9B",
  },
  {
    id: "zakat",
    categoryKey: "Transactions",
    titleUr: "زکوٰۃ، صدقات و عشر",
    titleEn: "Zakat, Charity & Ushur",
    descUr: "سونے چاندی، نقدی، تجارتی مال، شیئرز اور اموالِ زکوٰۃ کا شرعی حساب اور مصارف۔",
    descEn: "Calculation of gold, cash, trade assets, shares, and designated recipients of Zakat.",
    count: 1180,
    icon: Coins,
    accent: "#C89C46",
  },
  {
    id: "family",
    categoryKey: "Marriage & Divorce",
    titleUr: "نکاح، طلاق و عائلی امور",
    titleEn: "Family, Nikah & Divorce",
    descUr: "رشتہ، نکاح، مہر، طلاق، خلع، نفقہ اور بچوں کی پرورش سے متعلق رہنمائی۔",
    descEn: "Comprehensive guidance on marriage, dowry, custody, marital disputes, and divorce.",
    count: 1840,
    icon: Heart,
    accent: "#8B1E3F",
  },
  {
    id: "business",
    categoryKey: "Transactions",
    titleUr: "تجارت، اسلامی مالیات و کرپٹو",
    titleEn: "Finance, Business & Crypto",
    descUr: "خرید و فروخت، شراکت، اسلامی بینکاری، فاریکس، اسٹاک مارکیٹ اور ڈیجیٹل کرنسی۔",
    descEn: "Islamic contracts, banking, stock market, online freelancing, and digital currencies.",
    count: 1620,
    icon: Landmark,
    accent: "#064E3B",
  },
  {
    id: "halal",
    categoryKey: "Belief & Conduct",
    titleUr: "طب، غذائیں اور حلال و حرام",
    titleEn: "Halal Food, Medicine & Diet",
    descUr: "ذبیحہ، حلال و حرام اجزاء، طبی طریقہ علاج، انجکشن، کاسمیٹکس اور جدید مصنوعات۔",
    descEn: "Animal slaughtering, food ingredients, modern medical therapies, and halal standards.",
    count: 940,
    icon: Utensils,
    accent: "#0A5C36",
  },
  {
    id: "modern",
    categoryKey: "Belief & Conduct",
    titleUr: "جدید عصری و فکری مسائل",
    titleEn: "Modern Contemporary Issues",
    descUr: "آرٹیفیشل انٹیلیجنس، سوشل میڈیا، کاپی رائٹ، بیمہ اور عصرِ حاضر کے جدید تقاضے۔",
    descEn: "Artificial intelligence, social media conduct, intellectual property, and emerging ethics.",
    count: 810,
    icon: ShieldCheck,
    accent: "#1A365D",
  },
];

function TiltCard({ category }: { category: CategoryCardProps }) {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -8;
    const rY = ((x - centerX) / centerX) * 8;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const Icon = category.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#DCD3C5] dark:border-white/10 bg-white dark:bg-[#071E3A] p-6 shadow-[0_8px_24px_rgba(4,18,38,0.06)] hover:shadow-[0_20px_45px_rgba(4,18,38,0.14)] dark:hover:border-[#D1AC5B]/40"
    >
      {/* Subtle Corner Glow Accent */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition duration-500 group-hover:opacity-40"
        style={{ backgroundColor: category.accent }}
      />

      <div>
        <div className="flex items-center justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${category.accent}15`, color: category.accent }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <span className="font-mono text-xs font-semibold text-[#738394] dark:text-white/60">
            {category.count.toLocaleString()}+ {urdu ? "فتاویٰ" : "Fatwas"}
          </span>
        </div>

        <h3 className={`mt-5 text-xl font-bold transition-colors group-hover:text-[#075A9B] dark:group-hover:text-[#F3D794] ${
          urdu ? "font-urdu text-2xl leading-[1.6] text-[#10223A] dark:text-white" : "font-display text-xl text-[#10223A] dark:text-white"
        }`}>
          {urdu ? category.titleUr : category.titleEn}
        </h3>

        <p className={`mt-2 text-sm leading-relaxed text-[#596B7E] dark:text-white/70 ${
          urdu ? "font-urdu text-base leading-8" : "font-sans"
        }`}>
          {urdu ? category.descUr : category.descEn}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#EDE7DC] dark:border-white/10 flex items-center justify-between">
        <Link
          href={`/fatawa?category=${encodeURIComponent(category.categoryKey)}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wider text-[#075A9B] dark:text-[#F3D794] transition group-hover:text-[#B48332]"
        >
          <span>{urdu ? "فتاویٰ ملاحظہ کریں" : "Explore rulings"}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export function CategoryTiltGrid() {
  const { language } = useLanguage();
  const urdu = language === "ur";

  return (
    <section className="relative overflow-hidden bg-[#FAF7F0] dark:bg-[#041226] px-5 py-20 sm:px-8 lg:py-28" id="categories">
      <div className="mx-auto max-w-[1360px]">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C89C46]">
              <span className="h-px w-8 bg-[#C89C46]" />
              <span>{urdu ? "فقہی ابواب و موضوعات" : "Core Jurisprudence"}</span>
            </div>
            <h2 className={`mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-[#10223A] dark:text-white ${
              urdu ? "font-urdu text-4xl sm:text-5xl leading-tight" : ""
            }`}>
              {urdu ? "جامع فقہی ابواب کی فہرست" : "Browse by Islamic Subject"}
            </h2>
          </div>
          <Link
            href="/fatawa"
            className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#075A9B] dark:text-[#F3D794] hover:text-[#C89C46]"
          >
            {urdu ? "تمام ابواب و فتاویٰ دیکھیں" : "View all indexed topics"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3D Tilt Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map((cat) => (
            <TiltCard key={cat.id} category={cat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
