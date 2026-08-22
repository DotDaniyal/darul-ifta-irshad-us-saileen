# Karachi Hijri-Date Validation Evidence

## Live endpoint

The active `/api/institutional-date` endpoint returned a verified Karachi response with `Asia/Karachi`, a `19:01` Maghrib boundary, structured source metadata, and the effective bilingual date for 22 August 2026. The Urdu payload uses Urdu numerals, including `۹ ربیع الاول ۱٬۴۴۸ ھ`.

## Homepage synchronization

The homepage date card initially presents a short synchronization state while its request is pending. After the request settles, it renders the server-provided English Hijri date, Gregorian date, Karachi label, and Maghrib-change time. The Urdu language-toggle control was also exercised successfully.

## Bilingual and responsive presentation

The Urdu presentation was verified through the live language toggle. It renders `۹ ربیع الاول ۱٬۴۴۸ ھ`, `۲۲ اگست، ۲۰۲۶ · کراچی`, and `مغرب کے بعد تبدیلی · ۱۹:۰۱`. Desktop and full mobile captures confirm that the card remains a compact, visible part of the existing hero composition without disrupting the established branding or responsive flow.

## Automated boundary and resilience coverage

The full validation suite passed with **8 test files and 23 tests**. The institutional-date tests cover pre-Maghrib behavior, the Maghrib boundary, post-Maghrib effective-date selection, midnight handling, valid-source behavior, non-Karachi and malformed-source rejection, source outage fallback, source/fallback disagreement disclosure, date-scoped official override behavior, the configured server-environment override, and client resynchronization scheduling. Strict TypeScript validation, the production build, and the production dependency audit also passed.

## Official Karachi Date Correction — 22 August 2026

Following the institution’s confirmed correction, the server environment now contains a **date-scoped** official decision for **8 Rabi al-Awwal 1448 AH** on **22 August 2026** in Karachi. The live endpoint returned `manual_override` status, Hijri day `8`, the English value `8 Rabi al-Awwal 1448 AH`, the Urdu value `۸ ربیع الاول ۱٬۴۴۸ ھ`, and the scheduled Karachi Maghrib boundary of `19:01`.

The homepage was then verified after its asynchronous request settled. It displayed the same Urdu date alongside the official-decision status. Stored Fatwa dates were not changed; this correction applies only to the live institutional date display for the configured Gregorian day.
