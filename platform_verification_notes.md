# Platform Verification Notes

## Governed public archive — 2026-08-20

- The `/fatawa` public archive rendered the complete 74-record governed library in Urdu with right-to-left navigation, labelled keyword search, category buttons, methodology selection, topic selection, and original-PDF links.
- The public language control changed the same archive to English with left-to-right navigation, English search guidance, English category labels, methodology and topic controls, and preserved Urdu Fatwa titles.
- The configured methodology label displayed as **Authorised scholarly review**, a neutral administrator-managed label that does not assert an unconfirmed fiqh-school affiliation.
- The `/methodology` page rendered its full trust, privacy, scope, publication-standard, and guidance disclaimer content in English left-to-right and Urdu right-to-left, with a clear private-question call to action in each language.
- A public keyword search for `A0199` on `/fatawa` reduced the governed archive to one matching record, displayed its Urdu title, methodology label, and the linked published PDF. This confirms Fatwa-number discovery in the visible public interface.
- The governed `publicCatalogue.search` API was called with `query: "A0199"` and returned exactly `a0199-74`, including its Urdu title, category, neutral scholarly-review taxonomy, and published PDF URL. This completes API and interface verification for Fatwa-number discovery.
