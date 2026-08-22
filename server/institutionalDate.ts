export const KARACHI_TIMEZONE = "Asia/Karachi";
export const KARACHI_COORDINATES = { latitude: 24.8607, longitude: 67.0011 } as const;
const KARACHI_UTC_OFFSET_HOURS = 5;
const ALADHAN_METHOD_ID = 1;
const SOURCE_NAME = "AlAdhan · University of Islamic Sciences, Karachi";

type GregorianDate = { year: number; month: number; day: number };
type HijriParts = { day: number; month: number; year: number };
type SourceResponse = { ok: boolean; json(): Promise<unknown> };
type SourceFetch = (url: string) => Promise<SourceResponse>;

export type InstitutionalDateStatus = {
  boundary: "maghrib";
  karachiTimezone: typeof KARACHI_TIMEZONE;
  hijri: { day: number; month: number; year: number; en: string; ur: string };
  gregorian: { iso: string; en: string; ur: string };
  maghrib: { time: string; startsAt: string; nextSyncAt: string };
  source: { name: string; method: string; url: string };
  verification: {
    status: "verified" | "source_mismatch" | "fallback" | "manual_override";
    checkedAt: string;
    message?: string;
  };
};

type SourcePayload = {
  code?: number;
  data?: {
    timings?: { Maghrib?: string };
    date?: {
      gregorian?: { date?: string };
      hijri?: { day?: string; month?: { number?: number; en?: string }; year?: string };
    };
    meta?: { latitude?: number; longitude?: number; timezone?: string; method?: { id?: number; name?: string } };
  };
};

const urduMonths = ["محرم الحرام", "صفر المظفر", "ربیع الاول", "ربیع الثانی", "جمادی الاولیٰ", "جمادی الثانیہ", "رجب المرجب", "شعبان المعظم", "رمضان المبارک", "شوال المکرم", "ذوالقعدہ", "ذوالحجہ"];
const englishMonths = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qidah", "Dhu al-Hijjah"];

function getKarachiParts(now: Date): Record<string, string> {
  return Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: KARACHI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
}

function karachiGregorianDate(now: Date): GregorianDate {
  const parts = getKarachiParts(now);
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function addDays(date: GregorianDate, days: number): GregorianDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days, 12));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

function apiDate(date: GregorianDate): string {
  return `${String(date.day).padStart(2, "0")}-${String(date.month).padStart(2, "0")}-${date.year}`;
}

function isoDate(date: GregorianDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function makeKarachiDate(date: GregorianDate, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(date.year, date.month - 1, date.day, hours - KARACHI_UTC_OFFSET_HOURS, minutes));
}

function parsePrayerTime(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return undefined;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isCloseToKarachi(value: number | undefined, expected: number): boolean {
  return typeof value === "number" && Math.abs(value - expected) < 0.15;
}

function sourceUrl(date: GregorianDate): string {
  const query = new URLSearchParams({
    latitude: String(KARACHI_COORDINATES.latitude),
    longitude: String(KARACHI_COORDINATES.longitude),
    method: String(ALADHAN_METHOD_ID),
    timezonestring: KARACHI_TIMEZONE,
  });
  return `https://api.aladhan.com/v1/timings/${apiDate(date)}?${query}`;
}

async function fetchSourceDate(date: GregorianDate, fetchSource: SourceFetch): Promise<{ hijri: HijriParts; maghrib: string; sourceUrl: string }> {
  const url = sourceUrl(date);
  const response = await fetchSource(url);
  if (!response.ok) throw new Error("The structured prayer-time source is unavailable.");
  const payload = await response.json() as SourcePayload;
  const data = payload.data;
  const maghrib = parsePrayerTime(data?.timings?.Maghrib);
  const hijriDay = Number(data?.date?.hijri?.day);
  const hijriMonth = Number(data?.date?.hijri?.month?.number);
  const hijriYear = Number(data?.date?.hijri?.year);
  const sourceGregorianDate = data?.date?.gregorian?.date;

  const isValid = payload.code === 200
    && sourceGregorianDate === apiDate(date)
    && maghrib
    && Number.isInteger(hijriDay) && hijriDay >= 1 && hijriDay <= 30
    && Number.isInteger(hijriMonth) && hijriMonth >= 1 && hijriMonth <= 12
    && Number.isInteger(hijriYear) && hijriYear >= 1300
    && data?.meta?.timezone === KARACHI_TIMEZONE
    && isCloseToKarachi(data.meta.latitude, KARACHI_COORDINATES.latitude)
    && isCloseToKarachi(data.meta.longitude, KARACHI_COORDINATES.longitude)
    && data.meta.method?.id === ALADHAN_METHOD_ID;

  if (!isValid) throw new Error("The structured prayer-time source returned invalid or non-Karachi data.");
  return { hijri: { day: hijriDay, month: hijriMonth, year: hijriYear }, maghrib, sourceUrl: url };
}

function fallbackMaghrib(date: GregorianDate): string {
  const start = Date.UTC(date.year, 0, 0);
  const dayOfYear = Math.floor((Date.UTC(date.year, date.month - 1, date.day) - start) / 86_400_000);
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + 0.5);
  const equationOfTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const latitude = KARACHI_COORDINATES.latitude * Math.PI / 180;
  const zenith = 90.833 * Math.PI / 180;
  const hourAngle = Math.acos((Math.cos(zenith) / (Math.cos(latitude) * Math.cos(declination))) - Math.tan(latitude) * Math.tan(declination));
  const solarNoon = 720 - 4 * KARACHI_COORDINATES.longitude - equationOfTime + KARACHI_UTC_OFFSET_HOURS * 60;
  const sunsetMinutes = Math.round(solarNoon + 4 * (hourAngle * 180 / Math.PI));
  const hours = Math.floor(sunsetMinutes / 60) % 24;
  const minutes = ((sunsetMinutes % 60) + 60) % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function fallbackHijri(date: GregorianDate): HijriParts {
  const formatter = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", {
    timeZone: KARACHI_TIMEZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)))
    .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return { day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) };
}

function formatHijri(parts: HijriParts) {
  const englishMonth = englishMonths[parts.month - 1] || "Hijri month";
  const urduMonth = urduMonths[parts.month - 1] || "ہجری مہینہ";
  const urduNumbers = new Intl.NumberFormat("ur-PK-u-nu-arabext");
  return {
    ...parts,
    en: `${parts.day} ${englishMonth} ${parts.year} AH`,
    ur: `${urduNumbers.format(parts.day)} ${urduMonth} ${urduNumbers.format(parts.year)} ھ`,
  };
}

function formatGregorian(date: GregorianDate) {
  const noon = new Date(Date.UTC(date.year, date.month - 1, date.day, 12));
  const options: Intl.DateTimeFormatOptions = { timeZone: KARACHI_TIMEZONE, day: "numeric", month: "long", year: "numeric" };
  return {
    iso: isoDate(date),
    en: new Intl.DateTimeFormat("en-GB", options).format(noon),
    ur: new Intl.DateTimeFormat("ur-PK-u-nu-arabext", options).format(noon),
  };
}

function sameHijri(left: HijriParts, right: HijriParts): boolean {
  return left.day === right.day && left.month === right.month && left.year === right.year;
}

type ManualOverride = { effectiveGregorianDate: string; day: number; month: number; year: number; reason?: string };

function parseManualOverride(raw: string | undefined, date: GregorianDate): ManualOverride | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<ManualOverride>;
    const isValid = value.effectiveGregorianDate === isoDate(date)
      && Number.isInteger(value.day) && value.day! >= 1 && value.day! <= 30
      && Number.isInteger(value.month) && value.month! >= 1 && value.month! <= 12
      && Number.isInteger(value.year) && value.year! >= 1300;
    return isValid ? value as ManualOverride : undefined;
  } catch {
    return undefined;
  }
}

function resolvedHijri(sourceHijri: HijriParts, effectiveDate: GregorianDate, rawOverride: string | undefined) {
  const override = parseManualOverride(rawOverride, effectiveDate);
  return override ? { hijri: { day: override.day, month: override.month, year: override.year }, override } : { hijri: sourceHijri, override: undefined };
}

const defaultFetch: SourceFetch = (url) => fetch(url);

export async function getInstitutionalDateStatus({ now = new Date(), fetchSource = defaultFetch, manualOverride = process.env.HIJRI_DATE_OVERRIDE }: { now?: Date; fetchSource?: SourceFetch; manualOverride?: string } = {}): Promise<InstitutionalDateStatus> {
  const today = karachiGregorianDate(now);
  const fallbackTodayMaghrib = fallbackMaghrib(today);
  const fallbackAfterMaghrib = now.getTime() >= makeKarachiDate(today, fallbackTodayMaghrib).getTime();
  const fallbackEffectiveDate = addDays(today, fallbackAfterMaghrib ? 1 : 0);
  const fallbackEffectiveHijri = fallbackHijri(fallbackEffectiveDate);

  try {
    const todaySource = await fetchSourceDate(today, fetchSource);
    const todayMaghribAt = makeKarachiDate(today, todaySource.maghrib);
    const afterMaghrib = now.getTime() >= todayMaghribAt.getTime();
    const effectiveDate = addDays(today, afterMaghrib ? 1 : 0);
    const effectiveSource = afterMaghrib ? await fetchSourceDate(effectiveDate, fetchSource) : todaySource;
    const nextMaghrib = afterMaghrib ? effectiveSource.maghrib : todaySource.maghrib;
    const nextDate = afterMaghrib ? effectiveDate : today;
    const sourceHijri = effectiveSource.hijri;
    const resolved = resolvedHijri(sourceHijri, effectiveDate, manualOverride);
    const fallbackForEffectiveDate = fallbackHijri(effectiveDate);
    const mismatch = !resolved.override && !sameHijri(sourceHijri, fallbackForEffectiveDate);
    if (mismatch) console.warn("Institutional Hijri-date discrepancy", { effectiveDate: isoDate(effectiveDate), source: sourceHijri, fallback: fallbackForEffectiveDate });

    return {
      boundary: "maghrib",
      karachiTimezone: KARACHI_TIMEZONE,
      hijri: formatHijri(resolved.hijri),
      gregorian: formatGregorian(effectiveDate),
      maghrib: { time: nextMaghrib, startsAt: makeKarachiDate(nextDate, nextMaghrib).toISOString(), nextSyncAt: makeKarachiDate(nextDate, nextMaghrib).toISOString() },
      source: { name: SOURCE_NAME, method: "Method 1", url: effectiveSource.sourceUrl },
      verification: {
        status: resolved.override ? "manual_override" : mismatch ? "source_mismatch" : "verified",
        checkedAt: now.toISOString(),
        ...(resolved.override ? { message: resolved.override.reason || "An official institutional Hijri-date decision is active for this Karachi date." } : mismatch ? { message: "The structured source differs from the server fallback calculation; the configured structured source remains authoritative and the discrepancy was logged." } : {}),
      },
    };
  } catch (error) {
    console.error("Institutional Hijri-date source fallback", { message: error instanceof Error ? error.message : "Unknown source failure" });
    const nextDate = fallbackAfterMaghrib ? addDays(today, 1) : today;
    const nextMaghrib = fallbackAfterMaghrib ? fallbackMaghrib(nextDate) : fallbackTodayMaghrib;
    const resolved = resolvedHijri(fallbackEffectiveHijri, fallbackEffectiveDate, manualOverride);
    return {
      boundary: "maghrib",
      karachiTimezone: KARACHI_TIMEZONE,
      hijri: formatHijri(resolved.hijri),
      gregorian: formatGregorian(fallbackEffectiveDate),
      maghrib: { time: nextMaghrib, startsAt: makeKarachiDate(nextDate, nextMaghrib).toISOString(), nextSyncAt: makeKarachiDate(nextDate, nextMaghrib).toISOString() },
      source: { name: "Server fallback: Umm al-Qura calendar and astronomical Karachi sunset", method: "Fallback", url: "" },
      verification: {
        status: resolved.override ? "manual_override" : "fallback",
        checkedAt: now.toISOString(),
        message: resolved.override?.reason || "The structured source is temporarily unavailable. The server fallback remains active and will resynchronize automatically.",
      },
    };
  }
}
