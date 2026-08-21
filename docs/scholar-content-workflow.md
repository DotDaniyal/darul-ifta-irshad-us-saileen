# Scholar Content Workflow

The public scholars system now uses the managed `scholars` database table as its source of truth. Published records supply the Scholars directory, homepage preview, and individual `/scholars/:slug` profile routes through the public scholar API. Profiles deliberately contain **no portrait or image field** unless an authorised editor later adds an approved, rights-cleared image workflow.

| Editorial action | Administrator workflow | Public result |
|---|---|---|
| Add a scholar | Open `/scholars/admin`, enter the administrator access key, and complete the bilingual record form with a unique slug. | A record marked **Published** appears in the directory, homepage preview, and its individual profile route. |
| Edit a profile | Select **Edit** in the protected management page and update Urdu and English content together. | All public profile and card surfaces reflect the saved record consistently. |
| Publish or unpublish | Change the record’s publication status through the protected management controls. | Unpublished records are excluded from `/api/scholars`, the directory, homepage preview, and public profile routes. |
| Delete a scholar | Use **Delete** only after confirming the record is obsolete. | The record and its public profile route are removed from the live registry. |

Every record has a stable internal identifier and unique slug, bilingual name and designation, organisation, short and full introductions, educational background, Islamic qualifications, expertise, institutional responsibilities, services, optional contact details, optional social links, publication status, and audit timestamps. The first live record preserves the supplied content for **Hazrat Maulana Mufti Abdul Mannan Sahib** without adding unverified credentials, contact details, or imagery.

## Access and publication controls

The public API exposes only published records through `GET /api/scholars` and `GET /api/scholars/:slug`. Administrator listing, creation, editing, and deletion routes are separated under `/api/admin/scholars` and require the server-side administrator access key. The browser management page stores the entered key only for the active session and sends it as an `x-scholar-admin-key` request header; the key is never embedded in public source code or returned by the API.

Before publishing a scholar, verify both language fields, title, scholarly claims, contact information, and publication status. This keeps the Darul Ifta’s public scholarly representation accurate, governed, and consistent across every public surface.
