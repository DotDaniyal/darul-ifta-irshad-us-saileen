# Page-Loading Investigation

## Initial production checks — 21 August 2026

The deployed homepage (`/`) and the public Fatwa archive (`/fatawa`) both rendered successfully in a fresh browser session. The archive returned all 106 published records, including the A0201–A0300 batch, and exposed their PDF actions. No blank-screen or route-level failure was reproduced on these two public routes during the initial check.

The remaining public routes and runtime logs require inspection to identify a route-specific, intermittent, or client-side loading failure.

## Reproduction

The deployed methodology route (`/methodology`) renders normally. The deployed Fatwa-intake route (`/ask-fatwa`) reproduces the reported fault: it remains on the application loading screen instead of rendering the form. This establishes that the failure is route-specific rather than a general production outage.

## Development comparison

The same `/ask-fatwa` route renders normally in the development environment, including its taxonomy request and all form controls. Production successfully serves the corresponding page chunk and the public taxonomy request returns HTTP 200, but the route remains in the React lazy-loading fallback. The correction should therefore remove the fragile production lazy-import boundary for the public intake route and include a direct render regression test.

## Repair and validation

The public intake component is now imported directly by the application router rather than being placed behind its own lazy-import boundary. Other substantial archive and workspace routes retain code splitting. A new source-level regression test prevents the intake route from being moved back behind that fragile boundary. The complete test suite passes (20 files, 55 tests), and the production build completes successfully.

Desktop and mobile preview checks confirm that `/ask-fatwa` now renders its public intake experience immediately, rather than the application loading fallback. The archive and methodology routes remain rendered and visually intact at both breakpoints.
