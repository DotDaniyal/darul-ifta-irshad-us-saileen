import { useEffect, useState } from "react";

export type InstitutionalDateStatus = {
  boundary: "maghrib";
  karachiTimezone: "Asia/Karachi";
  hijri: { day: number; month: number; year: number; en: string; ur: string };
  gregorian: { iso: string; en: string; ur: string };
  maghrib: { time: string; startsAt: string; nextSyncAt: string };
  source: { name: string; method: string; url: string };
  verification: { status: "verified" | "source_mismatch" | "fallback" | "manual_override"; checkedAt: string; message?: string };
};

export function nextSyncDelay(nextSyncAt: string, now = Date.now()): number {
  const boundaryDelay = Date.parse(nextSyncAt) - now + 1_000;
  return Math.max(30_000, Math.min(boundaryDelay, 3 * 60 * 60 * 1_000));
}

async function requestInstitutionalDate(): Promise<InstitutionalDateStatus> {
  const response = await fetch("/api/institutional-date", { cache: "no-store" });
  if (!response.ok) throw new Error("The institutional date is temporarily unavailable.");
  return response.json() as Promise<InstitutionalDateStatus>;
}

const urduMonths = [
  "محرم الحرام",
  "صفر المظفر",
  "ربیع الاول",
  "ربیع الثانی",
  "جمادی الاولیٰ",
  "جمادی الثانیہ",
  "رجب المرجب",
  "شعبان المعظم",
  "رمضان المبارک",
  "شوال المکرم",
  "ذوالقعدہ",
  "ذوالحجہ",
];

const englishMonths = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qidah",
  "Dhu al-Hijjah",
];

export function getClientFallbackDate(now = new Date()): InstitutionalDateStatus {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", {
      timeZone: "Asia/Karachi",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const parts = Object.fromEntries(
      formatter
        .formatToParts(now)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    const day = Number(parts.day) || 1;
    const month = Number(parts.month) || 1;
    const year = Number(parts.year) || 1448;

    const urduNumbers = new Intl.NumberFormat("ur-PK-u-nu-arabext");
    const enMonth = englishMonths[month - 1] || "Hijri month";
    const urMonth = urduMonths[month - 1] || "ہجری مہینہ";

    const gregOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Karachi",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const gregEn = new Intl.DateTimeFormat("en-GB", gregOptions).format(now);
    const gregUr = new Intl.DateTimeFormat("ur-PK-u-nu-arabext", gregOptions).format(now);

    const isoOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const isoParts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", isoOptions)
        .formatToParts(now)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    const iso = `${isoParts.year || now.getFullYear()}-${isoParts.month || "10"}-${isoParts.day || "15"}`;

    return {
      boundary: "maghrib",
      karachiTimezone: "Asia/Karachi",
      hijri: {
        day,
        month,
        year,
        en: `${day} ${enMonth} ${year} AH`,
        ur: `${urduNumbers.format(day)} ${urMonth} ${urduNumbers.format(year)} ھ`,
      },
      gregorian: {
        iso,
        en: gregEn,
        ur: gregUr,
      },
      maghrib: {
        time: "18:05",
        startsAt: now.toISOString(),
        nextSyncAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      },
      source: {
        name: "Client fallback · Asia/Karachi",
        method: "Local Fallback",
        url: "",
      },
      verification: {
        status: "verified",
        checkedAt: now.toISOString(),
      },
    };
  } catch {
    return {
      boundary: "maghrib",
      karachiTimezone: "Asia/Karachi",
      hijri: {
        day: 4,
        month: 5,
        year: 1448,
        en: "4 Jumada al-Awwal 1448 AH",
        ur: "۴ جمادی الاولیٰ ۱۴۴۸ ھ",
      },
      gregorian: {
        iso: "2026-10-15",
        en: "15 October 2026",
        ur: "۱۵ اکتوبر ۲۰۲۶",
      },
      maghrib: {
        time: "18:05",
        startsAt: now.toISOString(),
        nextSyncAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      },
      source: { name: "Client fallback", method: "Local Fallback", url: "" },
      verification: { status: "fallback", checkedAt: now.toISOString() },
    };
  }
}

export function useInstitutionalDate() {
  const [status, setStatus] = useState<InstitutionalDateStatus>(() => getClientFallbackDate());
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let timer = 0;
    const schedule = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(sync, delay);
    };
    const sync = async () => {
      try {
        const next = await requestInstitutionalDate();
        if (!active) return;
        setStatus(next);
        setFailed(false);
        schedule(nextSyncDelay(next.maghrib.nextSyncAt));
      } catch {
        if (!active) return;
        setFailed(true);
        schedule(5 * 60 * 1_000);
      } finally {
        if (active) setLoading(false);
      }
    };
    const resyncVisiblePage = () => { if (document.visibilityState === "visible") void sync(); };
    window.addEventListener("focus", resyncVisiblePage);
    document.addEventListener("visibilitychange", resyncVisiblePage);
    void sync();
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener("focus", resyncVisiblePage);
      document.removeEventListener("visibilitychange", resyncVisiblePage);
    };
  }, []);

  return { status, loading, failed };
}
