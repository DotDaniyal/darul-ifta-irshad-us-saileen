import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Moon, Sun, Sunrise, Sunset, BookOpen, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useLanguage } from "./SiteShell";
import { useInstitutionalDate } from "@/data/institutionalDateApi";

const PRAYERS = [
  { id: "fajr", nameUr: "فجر", nameEn: "Fajr", time: "05:12", icon: Sunrise },
  { id: "sunrise", nameUr: "طلوعِ آفتاب", nameEn: "Sunrise", time: "06:28", icon: Sun },
  { id: "dhuhr", nameUr: "ظہر", nameEn: "Dhuhr", time: "12:28", icon: Sun },
  { id: "asr", nameUr: "عصر", nameEn: "Asr (Hanafi)", time: "16:42", icon: Sunset },
  { id: "maghrib", nameUr: "مغرب", nameEn: "Maghrib", time: "18:05", icon: Moon },
  { id: "isha", nameUr: "عشاء", nameEn: "Isha", time: "19:24", icon: Moon },
];

const DAILY_HADITH = {
  ar: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
  ur: "جس کے ساتھ اللہ تعالیٰ بھلائی کا ارادہ فرماتے ہیں، اسے دین کی گہری سمجھ عطا فرما دیتے ہیں۔",
  en: "Whomever Allah desires good for, He grants him deep comprehension of the Religion.",
  ref: "صحیح بخاری: 71، صحیح مسلم: 1037",
};

export function PrayerTimesWidget({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const urdu = language === "ur";
  const { status } = useInstitutionalDate();
  const [expanded, setExpanded] = useState(!compact);

  // Dynamic Maghrib time from institutional API if present
  const prayerList = useMemo(() => {
    return PRAYERS.map((p) => {
      if (p.id === "maghrib" && status?.maghrib?.time) {
        return { ...p, time: status.maghrib.time };
      }
      return p;
    });
  }, [status]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[#D1AC5B]/30 bg-gradient-to-br from-[#082245] via-[#061A34] to-[#041226] text-white shadow-[0_16px_40px_rgba(4,18,38,0.35)] backdrop-blur-md"
      dir={urdu ? "rtl" : "ltr"}
    >
      {/* Decorative Gold Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1AC5B]/15 text-[#F3D794]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D1AC5B]">
              <MapPin className="h-3 w-3" />
              <span>{urdu ? "اوقاتِ نماز · کراچی" : "Prayer Times · Karachi"}</span>
            </div>
            <p className="text-xs text-white/70">
              {status?.hijri[language] || (urdu ? "تاریخِ ہجری" : "Hijri Date")}
            </p>
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-white/60 hover:text-white"
            aria-label="Toggle prayer details"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Prayer Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/10 border-b border-white/10 text-center rtl:divide-x-reverse">
              {prayerList.map((p) => {
                const Icon = p.icon;
                const isMaghrib = p.id === "maghrib";
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 sm:p-3 transition ${
                      isMaghrib ? "bg-[#D1AC5B]/15 text-[#FFE7A8]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="mx-auto h-3.5 w-3.5 opacity-75" />
                    <p className="mt-1 font-sans text-[11px] font-semibold text-white/90">
                      {urdu ? p.nameUr : p.nameEn}
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-bold tracking-tight text-[#E8D098]">
                      {p.time}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Daily Wisdom / Hadith */}
            <div className="bg-black/20 p-3.5 sm:p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D1AC5B]">
                <BookOpen className="h-3 w-3" />
                <span>{urdu ? "فرمانِ نبوی ﷺ" : "Daily Wisdom"}</span>
              </div>
              <p className="mt-1.5 font-arabic-quran text-base leading-loose text-[#FFF8DE]">
                {DAILY_HADITH.ar}
              </p>
              <p className="mt-1 text-xs leading-normal text-white/80">
                {urdu ? DAILY_HADITH.ur : DAILY_HADITH.en}
              </p>
              <p className="mt-1 font-mono text-[9px] text-[#A0B0C0] text-right rtl:text-left">
                {DAILY_HADITH.ref}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
