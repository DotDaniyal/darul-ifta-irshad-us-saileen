# Homepage Fatwa Search Refinement

## Visual editor diagnosis

The attempted visual edit did not change `client/src/pages/Home.tsx` because its saved target reference no longer matched the current JSX after previous homepage revisions. The current relevant section is the explicit `<section id="fatawa">` in `Home.tsx`; its generated location metadata was therefore stale or unmatched rather than a runtime rendering failure.

The requested change will be applied manually to that current section. The Fatwa panel itself remains on the homepage, while only its existing featured-Fatwa cards are removed and replaced with a bilingual search form that sends the visitor to the established `/fatawa` archive with the supplied search text.
