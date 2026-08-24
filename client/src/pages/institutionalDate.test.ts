import { describe, expect, it, vi } from "vitest";
import { getInstitutionalDateStatus, KARACHI_TIMEZONE } from "../../../server/institutionalDate";
import { nextSyncDelay } from "../data/institutionalDateApi";

function sourceResponse(date: string, hijri: { day: string; month: number; year: string }, maghrib = "19:00") {
  return {
    ok: true,
    json: async () => ({
      code: 200,
      data: {
        timings: { Maghrib: maghrib },
        date: { gregorian: { date }, hijri: { day: hijri.day, month: { number: hijri.month }, year: hijri.year } },
        meta: { latitude: 24.8607, longitude: 67.0011, timezone: KARACHI_TIMEZONE, method: { id: 1 } },
      },
    }),
  };
}

function sourceFor(days: Record<string, { day: string; month: number; year: string }>, maghrib = "19:00") {
  return vi.fn(async (url: string) => {
    const date = /timings\/(\d{2}-\d{2}-\d{4})/.exec(url)?.[1] || "";
    return sourceResponse(date, days[date], maghrib);
  });
}

function getDeterministicStatus(options: NonNullable<Parameters<typeof getInstitutionalDateStatus>[0]>) {
  return getInstitutionalDateStatus({ ...options, manualOverride: "", useOfficialPakistanDecisions: false });
}

describe("Karachi Maghrib institutional date", () => {
  const days = {
    "22-08-2026": { day: "9", month: 3, year: "1448" },
    "23-08-2026": { day: "10", month: 3, year: "1448" },
  };

  it("keeps the current Hijri date before Karachi Maghrib", async () => {
    const status = await getDeterministicStatus({ now: new Date("2026-08-22T13:59:00.000Z"), fetchSource: sourceFor(days) });
    expect(status.hijri.day).toBe(9);
    expect(status.gregorian.iso).toBe("2026-08-22");
    expect(status.verification.status).toBe("verified");
  });

  it("switches at and after Karachi Maghrib, not at midnight", async () => {
    const atMaghrib = await getDeterministicStatus({ now: new Date("2026-08-22T14:00:00.000Z"), fetchSource: sourceFor(days) });
    const afterMidnight = await getDeterministicStatus({ now: new Date("2026-08-22T19:30:00.000Z"), fetchSource: sourceFor(days) });
    expect(atMaghrib.hijri.day).toBe(10);
    expect(afterMidnight.hijri.day).toBe(10);
    expect(afterMidnight.gregorian.iso).toBe("2026-08-23");
  });

  it("uses a safe server fallback for source outages and malformed source data", async () => {
    const unavailable = await getDeterministicStatus({ now: new Date("2026-08-22T12:00:00.000Z"), fetchSource: async () => { throw new Error("offline"); } });
    const malformed = await getDeterministicStatus({ now: new Date("2026-08-22T12:00:00.000Z"), fetchSource: async () => ({ ok: true, json: async () => ({ code: 200, data: {} }) }) });
    expect(unavailable.verification.status).toBe("fallback");
    expect(malformed.verification.status).toBe("fallback");
    expect(unavailable.karachiTimezone).toBe(KARACHI_TIMEZONE);
  });

  it("marks a source-calculation mismatch without silently treating it as verified", async () => {
    const mismatch = await getDeterministicStatus({ now: new Date("2026-08-22T12:00:00.000Z"), fetchSource: sourceFor({ "22-08-2026": { day: "1", month: 1, year: "1400" } }) });
    expect(mismatch.verification.status).toBe("source_mismatch");
    expect(mismatch.verification.message).toContain("configured structured source remains authoritative");
  });

  it("uses only a date-scoped official decision when it is explicitly configured", async () => {
    const override = JSON.stringify({ effectiveGregorianDate: "2026-08-22", day: 12, month: 3, year: 1448, reason: "Official committee announcement" });
    const overridden = await getInstitutionalDateStatus({ now: new Date("2026-08-22T12:00:00.000Z"), fetchSource: sourceFor(days), manualOverride: override, useOfficialPakistanDecisions: false });
    const differentDay = await getInstitutionalDateStatus({ now: new Date("2026-08-23T12:00:00.000Z"), fetchSource: sourceFor(days), manualOverride: override, useOfficialPakistanDecisions: false });
    expect(overridden.hijri.day).toBe(12);
    expect(overridden.verification.status).toBe("manual_override");
    expect(differentDay.verification.status).not.toBe("manual_override");
  });

  it("reads the configured official Karachi date decision from the server environment", async () => {
    const configured = await getInstitutionalDateStatus({ now: new Date("2026-08-23T12:00:00.000Z"), fetchSource: sourceFor(days) });
    expect(configured.hijri.day).toBe(9);
    expect(configured.verification.status).toBe("manual_override");
    expect(configured.verification.message).toContain("Pakistan Central Ruet-e-Hilal Committee");
  });

  it("keeps Karachi aligned with the Pakistan committee month decision when the structured source is one day ahead", async () => {
    const source = sourceFor({
      "24-08-2026": { day: "11", month: 3, year: "1448" },
      "25-08-2026": { day: "12", month: 3, year: "1448" },
    });

    const beforeMaghrib = await getInstitutionalDateStatus({ now: new Date("2026-08-24T12:00:00.000Z"), fetchSource: source, manualOverride: "" });
    const afterMaghrib = await getInstitutionalDateStatus({ now: new Date("2026-08-24T14:00:00.000Z"), fetchSource: source, manualOverride: "" });

    expect(beforeMaghrib.hijri.day).toBe(10);
    expect(beforeMaghrib.verification.status).toBe("manual_override");
    expect(afterMaghrib.hijri.day).toBe(11);
    expect(afterMaghrib.gregorian.iso).toBe("2026-08-25");
  });

  it("schedules browser resynchronization at Maghrib or within the periodic safety window", () => {
    expect(nextSyncDelay("2026-08-22T14:00:00.000Z", Date.parse("2026-08-22T13:59:30.000Z"))).toBe(31_000);
    expect(nextSyncDelay("2026-08-23T14:00:00.000Z", Date.parse("2026-08-22T14:01:00.000Z"))).toBe(3 * 60 * 60 * 1_000);
  });
});
