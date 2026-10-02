# FEAT-001 browser contract evidence

Base HEAD: `ae67fc729d871ac4a771bfb93880f81931c67d67`; branch `codex/feat-001-data-grid-sorting`. Node `v24.15.0`. Data is synthetic; fixture isolated on loopback port 3102. Neither app routes nor external services are used.

## Red before component changes

- `npm run test:e2e:data-grid -- --workers=1 -x`: exit 1, AC-001/011. Enter retains real keyboard focus and resets page 2 to 1, but accessible name is `Nombre ▲`, expected `Nombre: ordenar descendente`. `browser-red.log`.
- `npm run test:e2e:data-grid -- --workers=1 --grep 'AC-004|AC-006|AC-010|AC-012'`: exit 1, 4 tests failed. Calculated column keeps r1 first instead of r27; server range based on totalRows absent; loading aria-busy absent; mobile sorting selector absent. `browser-contract-red.log`.
- Initial infrastructure attempt could not bind loopback under sandbox (`EPERM`); successful Red runs used approved escalation. Initial pagination selector relied on role name but base icon buttons use title and glyph accessible names; corrected setup to use existing title so meaningful Red reaches new requirement.

## Traceability

`tests/e2e/data-grid-contract.spec.ts` contains keyboard/header cycles (001/011), formatted/calculated values (004), search/AND filters/clear/page size/clamp (005), untouched server rows and controlled callbacks (006/007), delayed promises with reversed resolution/error/retry (008), persistent visible-ID union/partial selection/incomplete loaded batch (009), loading/error/empty precedence (010), viewport persistence/touch targets/no overflow (012), and CRUD/export compatibility (013). AC-002/003 are covered by pure unit tests owned separately.

Four visual-state cases cover local/server × desktop 1280×800/mobile 390×844; each captures data, loading+error, error and empty. DOM assertions are not a manual assistive-technology review.

## Green

Initial integrated run: `npm run test:e2e:data-grid -- --workers=1`, exit 0, 14 passed in 6.5s (`browser-green.log`). Fixture typecheck passed with public `GridQuery`, `ColumnDef` and discriminated `GenericCrudDataGridProps`, without API casts.

Followup review found unavailable desktop sorting controls during loading/error/empty and detached header keyboard focus during deferred server loading. Added three regressions and confirmed exit 1, 3 failures before the fix (`browser-followup-red.log`). A fourth long-name/expanded-filter test passed in both viewports and produced `browser-long-names-390.png` and `browser-long-names-1280.png`. Final integrated rerun: `npm run test:e2e:data-grid -- --workers=1`, exit 0, **18 passed in 7.9s**, `browser-green.log`. Persistent desktop headers preserve sorting controls during loading/empty and keyboard focus when a controlled consumer enters loading.

Visual inspection of actual PNGs: desktop sorting and server loading, mobile data/loading/error and long names with expanded filters, desktop empty. Panels/colors/cards match approved v1; no overlap or page overflow observed in these fixtures. Sixteen mode/platform/state captures plus interaction and long-name captures are available under `browser-*.png`. Browser assertions measure mobile interaction targets at least 44×44px using associated checkbox labels.

Manual assistive-technology testing is **NOT_RUN**. Keyboard focus, names, aria-sort, live status, busy and alert DOM assertions passed; they do not prove screen-reader announcement experience. No production deployment or external API used.

## QA coverage followup

Added explicit AC-008 consumer coverage starting at page 3, requesting page 4, then resolving a total of 1. The consumer publishes page 1 and range `1 - 1 de 1`, without changing other query fields. This existing consumer behavior passed; no artificial Red introduced. AC-010 now asserts empty polite status when the error alert is active, preventing duplicate content announcements.

Final stable run after these additions: `npm run test:e2e:data-grid -- --workers=1`, exit 0, **19 passed in 8.2s**, `browser-green.log`. An earlier concurrent-build run was interrupted by page navigations and state resets (13 passed, 6 failed); retained in `browser-reload-interrupted.log`. The same assertions passed with stable sources and no concurrent build.
