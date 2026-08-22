# Karachi Maghrib Hijri-Date Sources

The live institutional-date service uses AlAdhan's documented structured prayer-time and Islamic-calendar service, rather than search-result scraping. It requests a fixed Karachi coordinate (`24.8607, 67.0011`), `Asia/Karachi`, and calculation method `1` (University of Islamic Sciences, Karachi). The response is accepted only when its Gregorian date, timezone, coordinates, method, Maghrib time, and Hijri fields validate against the request.

The source's calculation-method documentation identifies the University of Islamic Sciences, Karachi as a supported method and notes that prayer times are calculated from location and method conventions. Its prayer-time API provides city and coordinate access, while the Islamic-calendar API documents Hijri conversion and calendar support.

| Source | Use in the implementation |
|---|---|
| [Prayer Times API](https://aladhan.com/prayer-times-api) | Structured Maghrib time and paired daily Hijri/Gregorian response. |
| [Islamic / Hijri Calendar API](https://aladhan.com/islamic-calendar-api) | Structured Hijri-calendar reference. |
| [Calculation Methods](https://aladhan.com/calculation-methods) | Method selection: University of Islamic Sciences, Karachi. |

If the structured response is unavailable or invalid, the server returns an explicitly marked fallback based on an Umm al-Qura server calendar calculation and an astronomical Karachi sunset calculation. If the structured source and fallback disagree, the response is marked `source_mismatch`, the discrepancy is logged, and the configured structured source remains authoritative rather than hiding the disagreement.

## Official institutional decision override

An authorized maintainer may set `HIJRI_DATE_OVERRIDE` to a single JSON object for a formally announced decision. It applies **only** to the specified Karachi effective Gregorian date and does not alter any persisted Fatwa record. For example:

```json
{"effectiveGregorianDate":"2026-08-23","day":10,"month":3,"year":1448,"reason":"Official committee announcement"}
```

When active, the date endpoint returns the explicit `manual_override` verification state and the public component identifies that an official date decision is being applied. Invalid, stale, or differently dated values are ignored.
