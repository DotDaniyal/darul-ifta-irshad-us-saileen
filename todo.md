# Soft-Premium Refinement Checklist

- [x] Introduce warmer ivory layers, subtle paper grain, and gentler tonal transitions.
- [x] Soften framing geometry with refined radii and feathered shadows while retaining mihrab cues.
- [x] Improve type rhythm, breathing room, and visual hierarchy across hero, archive, and form sections.
- [x] Add restrained hover and entry motion that feels calm and polished.
- [x] Verify the refreshed experience at desktop and mobile sizes.

## Royal Premium Redesign Checklist

- [x] Review the supplied reference site for high-level composition and interaction inspiration.
- [x] Remove the black background from the official logo while preserving its artwork.
- [x] Create a centered brand masthead with Bismillah and premium calligraphic treatment.
- [x] Rebalance the visual system around white, black, royal blue, navy, and ceremonial gold.
- [x] Upgrade hero, navigation, and primary UI surfaces for stronger premium usability.
- [x] Validate the renewed desktop and mobile presentation.

## Motion and Calligraphy Enhancement Checklist

- [x] Establish a restrained site-wide motion system with reduced-motion support.
- [x] Add meaningful entrance, hover, and scroll-driven animation for primary sections and controls.
- [x] Deepen the Bismillah colour and calligraphic treatment in the masthead and page hero areas.
- [x] Introduce a premium Arabic display calligraphy family while preserving readable Urdu body text.
- [x] Verify animation rhythm, visual contrast, and responsive behavior.

## Typography Motion Checklist

- [x] Add staggered text reveals for headings, Urdu display copy, and supporting paragraphs.
- [x] Animate section labels, metadata, and calls to action with restrained timing.
- [x] Preserve readable text at all times and honor reduced-motion preferences.
- [x] Verify headline animation rhythm across homepage, archive, and request form.

## Text Overlap Repair Checklist

- [x] Separate the hero Urdu identity, English name, and supporting text into clear vertical rhythm.
- [x] Limit the hero text measure and improve responsive type scaling to prevent collision.
- [x] Adjust hero layout alignment around the date card at desktop and mobile widths.
- [x] Verify the repaired typography on desktop and mobile.

## Online Bayan Link Checklist

- [x] Add the supplied Mixlr event to the primary navigation as Online Bayan.
- [x] Add a visible Online Bayan call to action in the homepage guidance area.
- [x] Verify both links open the correct external event in a new tab.

## Online Bayan Icon Refinement Checklist

- [x] Repair any invalid duplicate style attributes from the visual-editor output.
- [x] Remove the visible box treatment around the centered official logo.
- [x] Add a clearer Online Bayan icon to the homepage call to action.
- [x] Verify the revised header and main-page icon at desktop and mobile widths.

## Masthead Bismillah Adjustment Checklist

- [x] Remove the Bismillah detail from the centered masthead area.
- [x] Retain the Bismillah in the separate top devotional bar.
- [x] Verify the simplified header at desktop and mobile widths.

## Centered Brand Stack Checklist

- [x] Rework the centered masthead brand mark into a vertical stack.
- [x] Place the official logo above the Urdu and English brand name.
- [x] Verify the stacked logo and brand name at desktop and mobile widths.

## Enlarged Masthead Logo Checklist

- [x] Remove the invalid border-radius style created by the visual editor.
- [x] Increase the centered official logo while preserving the vertical brand stack.
- [x] Verify the enlarged logo at desktop and mobile widths.

## Enlarged Brand Typography Checklist

- [x] Remove the invalid inline style values created by the visual editor.
- [x] Increase Urdu and English masthead name sizing with responsive CSS classes.
- [x] Verify the enlarged brand text remains balanced under the logo at desktop and mobile widths.

## Fatwa Library Publication Checklist

- [x] Inventory every uploaded fatwa PDF and establish its scholarly record metadata.
- [x] Upload source PDFs to persistent website storage for direct public access.
- [x] Add all published fatwas to the searchable Fatwa catalogue and archive views.
- [x] Verify original-PDF links, search, categories, and responsive archive presentation.

## Additional Fatwa Attachments Checklist

- [x] Compare the newly attached PDFs with the existing archive and identify records that require addition or replacement.
- [x] Upload the resulting source PDFs to persistent website storage and add the corresponding searchable catalogue records.
- [x] Verify direct PDF access, archive behavior, responsive presentation, and the production build.

## Fatwa Phone Number Review Checklist

- [x] Inspect the Fatwa pages and source PDFs to locate the requested phone number.
- [x] Identify all non-approved phone-number entries in the Fatwa PDFs, retaining `+92 333 2617671`.
- [x] Create redacted archive PDFs that remove only the non-approved phone-number entries.
- [x] Replace archive links and verify the revised PDF presentation and direct access.

## Masthead Logo Size Refinement Checklist

- [x] Inspect the current masthead logo sizing and identify the appropriate visual increase.
- [x] Increase the centered logo size without disrupting the Urdu and English brand stack.
- [x] Verify desktop and mobile masthead presentation, then publish the refinement.

## Darul Ifta Platform Blueprint Checklist

- [x] Define roles, permissions, scholarly governance, and trust requirements.
- [x] Specify user journeys, information architecture, and responsive wireframes.
- [x] Document the recommended stack, data model, security controls, and delivery roadmap.

## Darul Ifta Platform Implementation Checklist

- [x] Upgrade the public website to a full-stack application and establish the governed domain model.
- [x] Add role-aware access control for questioners, scholars, reviewers, and administrators.
- [x] Implement protected tRPC procedures for questioner, scholar, reviewer, and administrator actions.
- [x] Add and verify role-gated scholar, reviewer, and administrator workspace routes.
- [x] Implement multilingual public discovery, advanced Fatwa search, and trust content.
- [x] Import the existing verified Fatwa archive into governed published-record storage without changing its source PDFs.
- [x] Add public database-backed search across fatwa number, titles, tags, category, and configured methodology.
- [x] Upgrade the archive controls with accessible keyword, category, methodology, and tag filtering.
- [x] Add a public methodology, privacy, and scholarly-guidance page with clear contextual disclaimers.
- [x] Verify Urdu and English switching on the governed archive and methodology page.
- [x] Exercise public search using a title, tag, category, and methodology query and retain the results as test coverage.
- [x] Confirm accessible labels and keyboard-operable keyword, category, methodology, and tag archive controls.
- [x] Seed one formally approved methodology taxonomy entry and associate it with published archive records.
- [x] Add automated public-catalogue result tests for fatwa number, title, tag, category, and methodology filters.
- [x] Verify and document fatwa-number search across the governed query and public archive UI.
- [x] Exercise a representative Fatwa-number search in both the governed catalogue API and the public archive interface, then record the result.
- [x] Implement confidential question intake, secure tracking, and private attachment handling.
- [x] Add confidential submission creation with an unguessable tracking secret and private status lookup.
- [x] Replace the public Fatwa request form with validated category-aware, anonymity-aware tracked submission.
- [x] Add restricted attachment validation, S3 storage, and metadata-only database persistence.
- [x] Validate attachment signatures against declared PDF, JPEG, or PNG types before private storage.
- [x] Notify the project owner of each submitted question without sharing sensitive question content.
- [x] Add contract tests for public intake validation, private tracking, and attachment safeguards.
- [x] Test private tracking with valid and invalid reference-secret pairs, asserting only non-sensitive status fields are returned.
- [x] Test submission behavior for signature and size rejection, metadata-only attachment persistence, and content-free owner-notification wiring.
- [x] Repair and verify the public private-tracking route so submitted reference details can be checked without login.
- [x] Implement Mufti drafting, review, approval, and controlled publication workflows.
- [x] Add scholar-only queues and claim assignment for submitted confidential questions.
- [x] Add draft Fatwa creation and status transitions with auditable editor attribution.
- [x] Add reviewer approval or return-for-revision actions protected by role capability checks.
- [x] Add controlled publication that creates or updates a public Fatwa record only after approval.
- [x] Add procedure-level tests for role authorization and permitted workflow transitions.
- [ ] Implement role-aware administration, scholarly profiles, taxonomy, and site policy controls.
- [ ] Test privacy, accessibility, performance, and end-to-end workflows before publication.
