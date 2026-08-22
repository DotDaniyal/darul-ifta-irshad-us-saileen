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

export function useInstitutionalDate() {
  const [status, setStatus] = useState<InstitutionalDateStatus>();
  const [loading, setLoading] = useState(true);
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
