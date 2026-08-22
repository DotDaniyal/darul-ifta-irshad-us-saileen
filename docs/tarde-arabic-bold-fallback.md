# Tarde Arabic Bold Masthead Treatment

The requested `Tarde Arabic Bold` family is now the first font in the right-side Arabic/Urdu masthead heading’s CSS stack. No licensed webfont file or public CDN import for that exact family is included in this project, so the published website uses its delivered `Noto Naskh Arabic` bold face when Tarde Arabic Bold is unavailable on a visitor’s device. `Katibeh` remains a final Arabic display fallback.

This keeps the institutional heading selectable, searchable, and consistently bold for all visitors without downloading or redistributing an unverified font file. A licensed Tarde Arabic Bold `.woff2` file may be added in a future release if the owner supplies it together with public-web embedding permission.

## Verification

The targeted letterhead regression and strict TypeScript check passed after the stack change. Desktop review at 1280px confirmed a prominent bold heading contained in the right-side masthead column without collision with the logo or address capsule. Phone review at 375px confirmed the existing mobile sizing rule remains in effect, with the bold heading wrapping naturally and without clipping or horizontal overflow.
