# Fatwa Library Visibility Investigation

## Live reproduction

On 21 August 2026, the deployed public archive at `https://darulifta-bkfbzf6u.manus.space/fatawa` returned the catalogue search controls and published records in the rendered document. The inspected live page included entries A0001 onward, each paired with an original-PDF action. This indicates the records are present in the deployed DOM rather than absent from the underlying catalogue data.

## Next inspection

The initial viewport showed the archive hero and the start of the library region, but the record list lies below the fold. The next step is to inspect the scrolled visual state and the desktop/mobile rendering path to determine whether excessive layout spacing, styling, or a filter state is making the records appear missing to visitors.

## Confirmed rendered symptom

After scrolling into the deployed list, the document still exposes every record link and original-PDF action to assistive extraction, but the visible cards are blank white surfaces. The issue is therefore a presentation-layer defect: record content is present but its visual text treatment is not visible against the card background. Investigation will now focus on the archive card CSS and any animation styles affecting its descendants.

## Computed-style check

The first deployed card and its Urdu title have `opacity: 1`, `visibility: visible`, and dark computed text colors. Its card, title, and PDF action also have normal geometry. The CSS animation has technically completed, but the remote rendered surface still appears blank. The repair will remove the non-essential entry animation from the catalogue cards and establish explicit content-layer stacking so the record text is reliably painted above the decorative card surface in all browsers.

## Repair validation status

The repaired development archive continues to expose the full 74-record catalogue, including titles and original-PDF actions. Automated checks now pass: two client regression tests, TypeScript validation, and a production build. The final visual confirmation will inspect the visible cards beneath the hero at both desktop and mobile sizes before publication.

## Follow-up paint inspection

After removing the card clip path and entry animation, the local card still reports a normal grid layout, no transform or filter, full opacity, visible child elements, and correct dark title colors. The render remains blank despite these computed values. The next repair will avoid the affected utility-class composition entirely for catalogue records by applying self-contained, explicit CSS declarations to the card's folio, content, title, metadata, and PDF-action layers.

## Text-paint checks

The title and PDF action have opaque `color` and `-webkit-text-fill-color` values, no background clipping, normal blending, and normal font metrics. A temporary browser-only plain-text override was also applied to the title to isolate the effect. The issue remains tied to the archive-card rendering context rather than the record data, text content, or font declarations. The final implementation will replace the grid card rendering with a simpler block-and-flex layout that does not rely on the problematic catalogue card composition.

## Final layout replacement

The public archive now uses a dedicated, non-composited record layout with explicit background, text color, opacity, visibility, and responsive grid declarations. Full-page desktop verification confirms that Fatwa numbers, Urdu titles, English references, summaries, categories, dates, and original-PDF actions are painted and readable across the archive list.
