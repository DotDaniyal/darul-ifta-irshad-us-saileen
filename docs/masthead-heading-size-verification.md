# Arabic Masthead Heading Size Verification

## Scope

The visual editor produced two duplicate `style` attributes on the right-side Arabic/Urdu institutional heading. JSX permits only one attribute with a given name, so the result prevented TypeScript compilation. The requested final 29px desktop heading size was retained through the shared masthead CSS rather than an inline declaration.

## Implemented Treatment

The selectable heading remains the existing `letterhead-urdu-name` element and retains its Katibeh-first font stack, wording, right-to-left semantics, color, address capsule, logo, and three-part masthead layout. Its desktop sizing rule is now `clamp(1rem, 2.27vw, 29px)`, which reaches a maximum of 29px without forcing an oversized value on narrow screens. The existing phone breakpoint remains responsible for compact mobile sizing.

## Verification

| Check | Result |
| --- | --- |
| Duplicate JSX inline style attributes | Removed; strict TypeScript passes. |
| Focused letterhead regression | Passed: 1 file, 5 tests. |
| Desktop screenshot at 1280px | The Arabic heading is prominent, centered within its right-hand column, and does not overlap the central logo or address capsule. |
| Phone screenshot at 375px | The existing mobile clamp applies; the heading remains readable, contained, and free of horizontal overflow or clipping. |

The observed development console HMR invalidation is an expected refresh boundary notice for the mixed component/hooks module and not a runtime application error.
