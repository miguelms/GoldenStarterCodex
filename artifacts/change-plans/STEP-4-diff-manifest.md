# Paso 4 — mapa del diff antes de commits

Fecha de corte: 2026-10-02. Rama local: `codex/feat-001-data-grid-sorting`. Base publicada: `ae67fc7` (`origin/codex/agent-separation`).

Este mapa organiza el checkout actual para revisión. No autoriza commit, push, PR ni release. No incluye cambios en CCentral.

## Lote 1 — FEAT-001: contrato de `GenericCrudDataGrid`

- Spec, sesiones, plan y evidencia: `specs/FEAT-001-data-grid-sorting.md`, `docs/design-sessions/2026-10-01-feat-001-data-grid.md`, `docs/design-specs/feat-001-data-grid-v1.md`, `docs/live-sessions/2026-10-01-data-grid-sorting.md`, `artifacts/change-plans/FEAT-001-data-grid-sorting.md` y `artifacts/results/FEAT-001/`.
- Implementación: `src/components/shared/data-grid/generic-crud-data-grid.tsx`, `src/components/shared/data-grid/data-grid-query.ts` y exports/documentación de `src/components/shared/`.
- Pruebas y fixture: `tests/unit/data-grid-sorting.test.ts`, `tests/e2e/data-grid-contract.spec.ts`, `tests/fixtures/data-grid/`, `playwright.data-grid.config.ts`, `tsconfig.data-grid-fixture.json` y `vite.data-grid.config.ts`.
- La aceptación temporal de `node-forge` nació durante este piloto, pero se agrupa con CI/seguridad para evitar mezclar política de dependencias con el componente.

## Lote 2 — FEAT-002: Base UI3

- Spec, sesiones, plan y evidencia: `specs/FEAT-002-shadcn-ui-foundation.md`, `docs/design-sessions/2026-10-01-ui-foundation.md`, `docs/design-specs/shadcn-ui-foundation-v1.md`, `docs/live-sessions/2026-10-01-ui-foundation.md`, `docs/guides/ui-foundation.md`, `artifacts/change-plans/FEAT-002-shadcn-ui-foundation.md` y `artifacts/results/FEAT-002/`.
- Tokens y muestra productiva: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx` y `src/components/ui/`.
- Pruebas y fixture: `tests/unit/ui-foundation*.test.ts`, `tests/e2e/ui-foundation*.spec.ts`, `tests/fixtures/ui-foundation/`, `playwright.ui-foundation*.config.ts`, `tsconfig.ui-foundation-fixture.json`, `vite.ui-foundation.config.ts` y `scripts/check-ui-contrast.mjs`.
- Dependencias propias: `@base-ui/react` y `@axe-core/playwright` en los archivos de paquete compartidos con los demás lotes.

## Lote 3 — CI, seguridad y release del starter

- Workflows: `.github/workflows/ci.yml` y `.github/workflows/release.yml`.
- Validadores: `scripts/validate-codex-ui.py`, `scripts/audit-with-allowlist.mjs`, `scripts/audit-with-allowlist.test.mjs` y `scripts/lib/npm-audit-policy.mjs`.
- Política: `security/npm-audit-exceptions.json`, `docs/security/FEAT-001-node-forge-risk-acceptance.md`, `docs/QUALITY.md` y las actualizaciones de verificación SDD.
- Empaquetado y nombre del producto: `golden-starter.manifest.json`, `scripts/extract-golden-starter.mjs`, `package.json` y `.github/workflows/release.yml`.
- La regla de release exige tag semántico, versión coincidente, commit perteneciente a `codex/agent-separation` y CI reutilizable verde antes de publicar.

## Archivos compartidos que requieren staging por hunks

- `package.json` y `package-lock.json`: nombre/dependencias, comandos FEAT-001, comandos/dependencias FEAT-002 y comandos de CI/seguridad.
- `README.md`, `SDD/`, `TASKS.md`, `docs/QUALITY.md`, `specs/README.md` y la plantilla de spec: estado y proceso de más de un lote.
- `src/components/shared/README.md`, `src/components/shared/index.ts` y `tests/unit/generic-components.test.ts`: contrato del grid y regresión de primitivas UI.
- `.gitignore` y `.prettierignore`: salidas generadas de las dos suites. Los logs `.txt` anidados se conservan localmente y quedan fuera del commit; los JSON de axe se mantienen como evidencia deliberada.

## Cambios mecánicos o de alineación, fuera del núcleo de FEAT-001/002

El formatter actualizado tocó documentación, código de API/DB/mobile y pruebas que no cambian comportamiento. Estos archivos deben ir en un commit de mantenimiento separado o salir del PR mediante edición explícita; no deben ocultarse dentro de los commits de las features. También existe el bloque generado por Next.js en `AGENTS.md` y ajustes previos de identidad del starter.

La revisión inicial detectó referencias heredadas al nombre anterior; esta pasada de identidad las migra a `GoldenStarterCodex`. Se conserva únicamente la mención histórica en `SDD/constitution.md` que documenta el origen de GoldenStarterAntigravity.

## Orden propuesto de commits, después del cambio pendiente del usuario

1. `feat(grid): define local and server data-grid contract`
2. `feat(ui): add the Base UI3 component foundation`
3. `ci: validate Codex, UI contracts and scoped audit policy`
4. `chore: align GoldenStarterCodex release metadata and formatting`

Antes de crear esos commits se debe revisar cada lote por hunks, mantener fuera los logs generados y volver a ejecutar las verificaciones afectadas. El warning de Better Auth permanece como riesgo preexistente del starter; no se resolverá con la regla de organización de CCentral.
