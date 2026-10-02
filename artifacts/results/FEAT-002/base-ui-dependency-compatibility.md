# FEAT-002 — compatibilidad de Base UI

Fecha: 2026-10-01. Estado: **PASS** para la selección e instalación de la dependencia; la UI de producción aún requiere implementación y pruebas.

## Decisión

Se instaló y fijó exactamente `@base-ui/react@1.8.0` como dependencia runtime en `package.json` y `package-lock.json`, sin `--force` ni versiones canary. La [lista oficial de releases](https://base-ui.com/react/overview/releases) y el dist-tag `latest` del registro npm coincidían en `1.8.0` al momento de la consulta. El [quick start oficial](https://base-ui.com/react/overview/quick-start) prescribe el paquete único `@base-ui/react` y los imports por subpath; no se instalaron paquetes separados para los overlays.

| Comprobación        | Resultado                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entorno local       | Node `24.15.0`, npm `11.12.1`; `package.json` exige Node `>=24 <25`, npm `>=11 <12`.                                                                                     |
| Runtime web         | React y React DOM `19.2.0` en la raíz.                                                                                                                                   |
| Engines del paquete | `node >=14.0.0`; admite Node 24.                                                                                                                                         |
| Peers obligatorios  | `react` y `react-dom` admiten React 17, 18 o 19; incluyen React 19.2.0.                                                                                                  |
| Peers opcionales    | `date-fns ^4`, `@date-fns/tz ^1.2` y `@types/react` para React 17, 18 o 19. No se añadieron para estos tres overlays.                                                    |
| Instalación         | `npm install --save-exact @base-ui/react@1.8.0`: salida `added 8 packages`, código 0. `npm ls @base-ui/react react react-dom --depth=0`: código 0, Base UI `1.8.0`.      |
| Imports             | Los tres subpaths ESM se resolvieron con Node: `@base-ui/react/dialog`, `@base-ui/react/alert-dialog`, `@base-ui/react/menu`; exportan `Dialog`, `AlertDialog` y `Menu`. |

Metadata de engines, peers y exports: `npm view @base-ui/react@1.8.0 ... --json` y `node_modules/@base-ui/react/package.json`, cotejados después de instalar. Las guías oficiales de [Dialog](https://base-ui.com/react/components/dialog), [Alert Dialog](https://base-ui.com/react/components/alert-dialog) y [Menu](https://base-ui.com/react/components/menu) confirman esas rutas y las partes `Root`, `Trigger`, `Portal`, `Popup` y `Close` o `Item` según el control. `Dialog.Root` expone `disablePointerDismissal` (default `false`) y `onOpenChange(open, details)` con razones como `outside-press` y `escape-key`; `AlertDialog.Root` omite `disablePointerDismissal` de su API. El comportamiento acordado de cierre debe verificarse en tests de wrappers reales; esta comprobación de paquetes no lo da por aprobado.

## Seguridad y límites

Tras la instalación, `npm audit --json` reportó 19 hallazgos: 15 moderados, 4 altos, 0 críticos. Ningún paquete `@base-ui/*` ni `@floating-ui/*` aparece como vulnerable en ese reporte. `npm run audit:ci` pasó con la aceptación existente de `GHSA-86w9-cpqp-85rv` hasta 2026-10-31 para la cadena Expo / `node-forge`; no se alteró la política de auditoría. El conteo del audit posterior no prueba por sí solo que los 19 hallazgos fueran idénticos antes de instalar.

El lockfile ya contenía cambios no relacionados de trabajo previo (entre ellos Next `16.3.8`, Vite `6.4.3` y Vitest `5.0.3`), que se conservaron. Esta tarea no valida todavía comportamiento de Dialog, AlertDialog o Menu, accesibilidad, SSR/hidratación ni el build completo.
