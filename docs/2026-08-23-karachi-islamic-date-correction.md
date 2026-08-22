# Karachi Islamic-Date Correction — 23 August 2026

## Issue and Resolution

The live date card incorrectly showed **10 Rabi al-Awwal 1448** on 23 August 2026 because the previous one-day institutional override had expired and the configured structured source followed a different calendar convention.

Pakistan reporting of the Central Ruet-e-Hilal Committee decision states that **1 Rabi al-Awwal 1448 began in Pakistan on 15 August 2026**. Therefore, the Karachi institutional display for **23 August 2026** is **9 Rabi al-Awwal 1448**. The date-scoped `HIJRI_DATE_OVERRIDE` now records that decision for 23 August only, without changing the Karachi Maghrib transition, general source-resynchronization behavior, or stored Fatwa dates.

## Verification

| Check | Result |
| --- | --- |
| Environment-override regression | Passed with 9 Rabi al-Awwal 1448 and `manual_override` status. |
| Live `/api/institutional-date` response | Returned 9 Rabi al-Awwal 1448, 23 August 2026, Karachi timezone, and 19:00 Maghrib boundary. |
| Desktop date card | Displayed the corrected Urdu 9 Rabi al-Awwal value without layout issues. |
| Mobile date card | The card remains contained and readable at 375px width. |

## Evidence

The Pakistan Central Ruet-e-Hilal Committee decision was reported as making 15 August 2026 the first day of Rabi al-Awwal, with 12 Rabi al-Awwal on 26 August 2026: <https://www.nation.com.pk/13-Aug-2026/rabi-ul-awwal-moon-sighted-eid-milad-un-nabi-observed-august-26>.
