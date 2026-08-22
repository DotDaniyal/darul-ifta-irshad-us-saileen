# Bilingual Fatwa Translation Source Audit

## Current State

The website’s existing language switcher persists the active language in `localStorage` under `darul-ifta-language`, synchronizes React consumers through the `darul-ifta-language` browser event, and applies the matching document language and direction. The Fatwa listing and detail pages already consume this shared language state.

The current 204-record Fatwa catalog stores Urdu titles alongside generic English archive labels. Its question and answer fields are bilingual publication notices directing visitors to the privacy-sanitized original PDF; they are not complete translated Fatwa text. The approved source PDFs are image-only public derivatives, and no scholar-approved English full-text translation corpus is currently stored in the project.

## Publication Boundary

The bilingual user experience must therefore preserve every Urdu original and present any newly generated English material as **review-required draft content** until a qualified reviewer approves it. The public data model will keep the PDF privacy boundary unchanged and will not imply that a generic archive notice is a translation of the underlying Fatwa.
