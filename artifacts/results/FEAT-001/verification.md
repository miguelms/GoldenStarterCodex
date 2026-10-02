# FEAT-001 — Verificación de implementación

Fecha: 2026-10-01 (America/Tijuana). Rama: `codex/feat-001-data-grid-sorting`.
Base: `ae67fc729d871ac4a771bfb93880f81931c67d67`. Cambios sin commit; digest y archivos evaluados en `snapshot.json`.

Implementación integrada. **Gate de verificación PASS**; spec `VERIFIED`. No se ha creado release.

## Resultado

Grid local: búsqueda bruta con trim, filtros AND, orden estable por valor bruto o `sortValue`, comparadores tipados texto/números/fechas, vacíos finales en ambas direcciones y paginación después de ordenar. Conserva renderer `accessor` y callbacks CRUD.

Grid servidor: query controlada, callback atómico por interacción, filas recibidas sin reprocesar, total tras filtros, selección por IDs con objetos cargados y exportación explícita de página. El consumidor controla solicitudes, vigencia de respuestas, carga/error y páginas válidas. No se añadió backend.

Desktop conserva encabezados al cargar/error/vacío para mantener consulta y foco. Móvil conserva tarjetas, selector y targets mínimos. Anuncios fuera de busy; errores mediante alerta única. Fuente visual local y diseño v1 aprobados.

Fixture loopback separado con Vite 6.4.3, sin HMR; no existe ruta fixture en el build Next. Vite 8.3.2 no se instaló por incompatibilidad con @types/node fijado.

La fixture explica que “Probar carga + error” oculta filas y error para mostrar skeletons porque carga tiene precedencia; los controles para error y vacío están etiquetados por separado. También anuncia visiblemente acciones de demostración: exportación y alta solo registran callbacks, selección externa informa los IDs inyectados, aplicar consulta explica cuándo está disponible y las solicitudes diferidas indican cómo resolverlas. TypeScript y Prettier pasan; la suite volvió a ejecutarse: 19/19 browser tests PASS.

## Checks

| Check                               | Resultado                                                                            | Evidencia                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Instalación limpia                  | PASS: `npm ci`                                                                       | install-final.txt                                        |
| Unit                                | PASS: 65 tests, 10 archivos                                                          | unit-final.txt                                           |
| Browser grid                        | PASS: 19 tests; 19/19 tras añadir feedback accesible a controles fixture             | browser-final.txt, browser-fixture-feedback-followup.txt |
| TypeScript raíz                     | PASS                                                                                 | typecheck-final.txt                                      |
| TypeScript fixture                  | PASS                                                                                 | fixture-typecheck.txt                                    |
| ESLint global                       | PASS                                                                                 | lint-final.txt                                           |
| Build web                           | PASS; sin ruta fixture                                                               | build-final.txt                                          |
| E2E web existente                   | PASS: 1 test health                                                                  | e2e-web-final.txt                                        |
| Check estático móvil                | PASS                                                                                 | mobile-check.txt                                         |
| Formato global                      | PASS                                                                                 | format-final.txt                                         |
| Auditoría producción (`--omit=dev`) | PASS: 19 registros; excepción exacta GHSA aplicada, ningún high/critical sin aceptar | audit-production-after-waiver.txt                        |
| Auditoría completa (`audit:ci`)     | PASS: 19 registros; 15 moderate, 4 high aceptados bajo excepción temporal            | audit-full-after-waiver.txt                              |
| Política de excepción de audit      | PASS: 5/5 pruebas; desconocidos, cambios de ruta/versión y caducidad bloquean        | audit-policy-tests.txt                                   |
| Umbral de críticos                  | PASS: 0 critical                                                                     | audit-critical-threshold.txt                             |
| Diff whitespace                     | PASS                                                                                 | diff-check.txt                                           |
| Revisión visual desktop/web móvil   | PASS por inspección de capturas; no aprobación de release                            | browser-evidence.md, browser-\*.png                      |
| Lector de pantalla manual           | PASS: el usuario confirmó VoiceOver sobre fixture local                              | manual-assistive.md                                      |
| API/DB y app móvil nativa           | NOT_APPLICABLE                                                                       | No modificados                                           |

Se actualizaron Next.js de 16.3.5 a 16.3.8 y Vitest de 2.1.9 a 5.0.3. La instalación y todas las suites anteriores pasaron después de actualizar. Next 16.3.8 es la versión parcheada indicada por el aviso oficial consultado para la vulnerabilidad crítica de Next. No quedan hallazgos críticos. Los cuatro registros altos de npm corresponden al mismo aviso propagado a `node-forge`, `@expo/code-signing-certificates`, `@expo/cli` y `expo`, en la cadena Expo 57.0.24 → `@expo/cli@57.0.26` → `node-forge@1.4.0`. El [aviso oficial GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) cubre versiones hasta 1.4.0 y no lista versión corregida. El propietario aceptó temporalmente el riesgo el 2026-10-01; [la excepción](../../security/FEAT-001-node-forge-risk-acceptance.md) cubre solo ese advisory, versiones y rutas, requiere revisión el 2026-10-31 y caduca el 2026-11-01. Las auditorías de producción y del árbol completo pasan con esa excepción, y la política falla ante otro advisory alto/crítico, una ruta/versión distinta o la caducidad. El reporte de paquetes no demuestra por sí solo que el despliegue web tenga una ruta explotable. No se aplicó el downgrade mayor a Expo 44 que propone `npm audit fix --force`.

El check global de formato pasó tras ejecutar Prettier en los 60 paths que avisaba el check: 59 ya estaban en el baseline y uno es el nuevo `audit-after-next.json`; `README.md`, que era el path restante del aviso de baseline, también quedó formateado previamente. Esto añadió cambios mecánicos amplios de formato en archivos existentes, sin cambios intencionales de comportamiento en esas áreas.

## TDD y criterios

- Comparadores: 7 fallos/1 pase con comparación baseline; 8/8 Green. Seguimiento filtros vacíos y ISO con precisión de minutos: 2 fallos nuevos; 10/10 Green. Logs `comparators-*.txt`.
- Browser Red real: nombre accesible tras Enter, valores calculados, rango servidor, busy y control móvil. `browser-red.log`, `browser-contract-red.log`.
- Seguimiento Red: consulta desktop no disponible durante estados y foco perdido al cargar; headers persistentes corrigieron ambos. `browser-followup-red.log`.
- Green progresivo: 14 → 18 → 19 casos. La cobertura adicional de clamp servidor y alert/status pasó sobre comportamiento ya implementado; no se fabricaron fallos.
- Una ejecución intermedia se interrumpió por recarga de Vite durante cambios/build concurrentes, registrada en `browser-reload-interrupted.log`. Suite posterior estable completa verde; HMR desactivado en fixture para evitar ese problema.

AC-002/003: unit. AC-001 y AC-004–013: browser + SSR/unit según matriz; AC-008 demuestra respuesta obsoleta descartada y page4→total1→page1. AC-011 tiene evidencia automatizada, pero verificación asistiva manual incompleta. AC-012 incluye 390×844 y1280×800, nombres largos, filtros expandidos, touch targets y capturas local/servidor data/carga/error/vacío.

## Límites y siguiente paso

Revisión QA de fuentes/diff/artefactos y seguimiento de la excepción: `qa-review.md`. AC-011 recibió pase manual de VoiceOver confirmado por el usuario; el alcance registrado está en `manual-assistive.md`. El sistema operativo, navegador y versión de VoiceOver no quedaron registrados.

La spec queda `VERIFIED`; no está `RELEASED`. Mantener la excepción revisada antes de 2026-10-31 y quitarla cuando haya una actualización corregida compatible. La allowlist hace que CI vuelva a bloquear si cambia la cadena aceptada, aparece un hallazgo alto/crítico nuevo o vence la fecha. No push, PR ni despliegue; CCentral y Antigravity sin cambios.

Las instrucciones AGENTS añadidas automáticamente por `next dev` durante el E2E se retiraron del diff al finalizar; no forman parte de esta feature. No se borró trabajo previo del usuario.
