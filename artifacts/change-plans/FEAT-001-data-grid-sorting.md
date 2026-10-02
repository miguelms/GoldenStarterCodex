# FEAT-001 — Plan técnico de ordenación y consulta del grid

Estado: `APPROVED_BY_USER`, implementación y checks `NOT_RUN`. Fecha: 2026-10-01 (America/Tijuana).

Fuente: [spec aprobada](../../specs/FEAT-001-data-grid-sorting.md), revisión aprobada por el usuario el 2026-10-01. Base: `ae67fc729d871ac4a771bfb93880f81931c67d67`. Rama actual: `codex/agent-separation`; futura rama recomendada: `codex/feat-001-data-grid-sorting`, desde la base confirmada incorporando los documentos aprobados. Este plan no crea la rama.

## Objetivo y límites

Cubrir AC-001 a AC-013 en el componente web existente: comparación estable y valores reales, consulta local y servidor controlado, selección, estados y accesibilidad desktop/web móvil. Hoy ya existen ciclo asc/desc/none, búsqueda, filtros, paginación local y selección por ID; el comparador cambia según el par de filas, falta consulta servidor y la cobertura existente es SSR. El resultado esperado es el contrato de la spec, conservando modo local por defecto, `accessor` exclusivamente visual y callbacks CRUD actuales.

No incluye CCentral, Antigravity, backend, endpoints, DB, contratos Zod, app Expo, baseline Shadcn, distribución, workflows de release ni despliegue. Las vistas móviles aquí son web responsive, no Android/iOS nativos.

## Gate previo a implementación

La aprobación funcional permite redactar este plan; aún falta aprobarlo cuando aplique y resolver el gate visual desktop (1280×800) y web móvil (390×844). No hay referencias Stitch/Figma confirmadas. La conversación principal conduce `live-design-review` y delega los artefactos documentales a `ui_ux_designer`; registra referencias y aprobación por plataforma. No implementar cambios UI antes de ese gate. Las decisiones funcionales ya aprobadas no se vuelven a abrir en este plan.

## Rutas y responsabilidades

Fuentes leídas: `AGENTS.md`, `ARCHITECTURE.md`, `STACK.md`, `docs/QUALITY.md`, `SDD/implementation-plans.md`, spec, registro y perfiles `change_planner`, `frontend`, `test_engineer`, `platform_release`, `package.json`, `vitest.config.ts`, `playwright.config.ts`, `postcss.config.mjs`, `tsconfig.json`, componente, barrel y ejemplo documental. En implementación leer también estilos globales, primitives importadas y pruebas completas pertinentes.

| Área / owner                                                          | Rutas probables a modificar o crear                                                                                                                    | Entrega                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `frontend`                                                            | `src/components/shared/data-grid/generic-crud-data-grid.tsx`, nuevo `data-grid-query.ts` en ese directorio, `src/components/shared/index.ts`           | Tipos UI, helpers puros y componente integrado        |
| `test_engineer`                                                       | `tests/unit/data-grid-sorting.test.ts`, `tests/unit/generic-components.test.ts`, `tests/e2e/data-grid-contract.spec.ts`, `tests/fixtures/data-grid/**` | Casos vinculados a AC y consumidor sintético          |
| `platform_release`, con rutas de configuración delegadas expresamente | `package.json`, `package-lock.json`, nueva `playwright.data-grid.config.ts`, configuración/build del fixture y eventual config TypeScript específica   | Runner aislado reproducible; sin tocar release/deploy |
| `docs`                                                                | `src/components/shared/README.md`, evidencia en `artifacts/results/` asignada                                                                          | Ejemplos local/servidor y límites reales              |
| Conversación principal / `qa`                                         | Integración; QA en lectura                                                                                                                             | Diff, evidencia y veredicto independiente             |

Estos owners están registrados; sus tareas se delegan con rutas explícitas. Pruebas y componente se escriben por turnos Red/Green, sin escritores concurrentes sobre archivos compartidos. No se asigna backend porque el grid no solicita datos.

## Arquitectura propuesta y compatibilidad

Separar helpers TypeScript puros sin React/DOM: normalización por tipo, resolución de comparador por consulta, orden estable por índice original, pipeline local y transiciones atómicas de query. Columnas con `sortValue` usan ese valor; sin él usan `row[key]`. Nunca ejecutar `accessor` para obtener claves de comparación. Vacíos/invalidos permanecen últimos antes de aplicar dirección; no invertir su colocación con el signo. Inferir un único tipo para los valores de la consulta local tras búsqueda/filtros: numérico solo si todos los no vacíos son números finitos; de otro modo texto. Mantener ese comparador durante toda la ordenación, sin inferencia por par. No inferir fechas; validar estrictamente fechas y timezone según la spec.

Exportar `GridQuery`, `GridSort` y valores/tipos de columna como tipos UI locales. Conservar el nombre público `GenericCrudDataGridProps<T>` mediante alias a unión discriminada de props comunes y modos. `mode` omitido equivale a local; servidor exige `query`, `onQueryChange` y `totalRows`. Cuando `selectable: true` en servidor exigir `selectedIds` y callback de selección para un consumidor controlado; `selectable: false`/omitido no necesita IDs. El fixture y ejemplos tipados cubrirán ambas formas y usos previos. No añadir validación Zod ni corregir props servidor inválidas mediante callbacks de render.

El grid deriva todos los controles servidor de props: handlers crean una sola query completa; cambiar búsqueda/filtro/orden/tamaño fija página 1, navegar conserva el resto. No emitir al montar ni duplicar callbacks por efectos. En servidor `data` se muestra tal cual, sin buscar/filtrar/ordenar/slice; rangos y páginas usan `totalRows`. El consumidor controla carga/error y suministra una página válida cuando cambie el total.

Seleccionar todos opera únicamente sobre IDs visibles, preservando externos; checkbox parcial necesita propiedad DOM `indeterminate` y evidencia browser. `selectedItems` incluye solo seleccionados presentes en `data`. Mostrar cantidad disponible y bloquear lote basado en objetos si faltan IDs seleccionados. No mantener caché global de objetos. Export callback local recibe todo el resultado filtrado/ordenado; servidor solo la página recibida. Exportación global y acciones por IDs externos son responsabilidad del consumidor. Conservar callbacks CRUD y renderers sin reinterpretarlos.

## Consumidor browser aislado

La config Playwright actual tiene un único servidor Next en 3101; no existe fixture ni proyecto dedicado. No agregar una ruta de demostración bajo `src/app` ni un endpoint Next protegido solo por una bandera. Proponer una config Playwright separada con `testDir: tests/e2e`, `testMatch: data-grid-contract.spec.ts` y proyecto `data-grid`; servidor dedicado loopback en 3102, `reuseExistingServer: false`. La config existente excluirá esta spec con `testIgnore`, conservando los E2E del producto. El script futuro `test:e2e:data-grid` ejecutará esa config; no se afirma que exista hoy.

Fixture propuesto: `tests/fixtures/data-grid/index.html`, `main.tsx`, `vite.config.ts` y CSS de entrada. Vite como única dependencia de desarrollo directa nueva, con versión exacta compatible con Node 24 verificada por `platform_release` al implementarlo y lockfile actualizado. No depender de un bundler transitivo ni añadir plugin React/DOM testing si TSX estándar basta. Configurar root del fixture, alias `@` a `src`, PostCSS existente explícito y Tailwind con fuentes del componente/primitives para probar estilos reales. Importar el componente directamente y montarlo con React DOM; no layouts Next, auth ni APIs. Si se demuestra una alternativa con dependencias directas existentes y compilación TSX/CSS reproducible, documentarla antes de sustituir esta propuesta. Añadir typecheck del TSX del fixture: la config actual solo incluye `tests/**/*.ts`, por lo que el typecheck de raíz no lo cubre automáticamente.

Usar datos sintéticos y controles de prueba para local y servidor; instrumentación visible de callbacks/query/export/selección exclusiva del fixture. El consumidor servidor usa promesas diferidas en memoria con orden de resolución controlado y contador/version de consulta: solo publica la vigente; no sleeps como sincronización ni fetch a servicios. Mostrar en una prueba que la query no cambia visualmente hasta actualizar props. AC-008 verifica este consumidor, no garantiza manejo de red del grid. No incluir fixture en el build Next; revisar diff y build para confirmar ausencia de ruta pública. El servidor de fixture solo corre al ejecutar su suite.

## Secuencia y trazabilidad TDD

1. Resolver gate visual y aprobar plan; confirmar checkout/base sin borrar cambios existentes. Preparar runner aislado (`platform_release`) y consumidor mínimo (`test_engineer`) antes de la primera prueba browser. Comprobar que estilos y TSX se compilan; fallos de infraestructura no cuentan como Red funcional.
2. `test_engineer` añade casos puros y registra Red pertinente; `frontend` implementa helpers mínimos para AC-002/003/004/005, luego refactor con mismos casos verdes. Cubrir pares iguales, dirección, inmutabilidad, inválidos de calendario, offsets, texto y columnas mixtas.
3. Integrar helpers y props locales; browser prueba transiciones, cálculo/presentación y pipeline. Conservar cobertura que ya pasa para el ciclo existente; Red de las deficiencias reales, por ejemplo limpieza de búsqueda en página posterior o valores calculados.
4. Añadir modo servidor y callbacks atómicos mediante Red/Green de AC-006/007; conectar fake y demostrar AC-008 con resoluciones invertidas y reintento, separados del contrato del componente.
5. Integrar selección, export y estados (AC-009/010/013), preservando CRUD y SSR anteriores; después cambios accesibles y móvil aprobados (AC-011/012). Prueba keyboard con foco real, no solo inspección del HTML.
6. Integración final, documentación, checks y revisión independiente; corregir fallos con regresión reproducible antes del fix. No marcar verificado mientras falte evidencia requerida.

| AC  | Casos/evidencia previstos                                                                        | Suite                                    |
| --- | ------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 001 | Tres activaciones, cambio de columna, no ordenable, reset página                                 | Browser                                  |
| 002 | Collator es, 2/10, negativos, empates, mezcla, entrada intacta                                   | Unit node                                |
| 003 | Epoch/UTC/offset equivalentes, leap/calendar inválido, vacíos finales asc/desc                   | Unit node                                |
| 004 | sortValue calculado, fallback bruto y JSX monetario/fecha sin comparar renderer                  | Unit + browser                           |
| 005 | Trim búsqueda, filtros AND, clear/tamaño reset, pipeline y clamp tras reducción                  | Unit + browser                           |
| 006 | Página servidor contradictoria con consulta sin reprocesar; total/rango y cero                   | Browser                                  |
| 007 | Un callback completo/evento, montaje cero, props tardías y navegación conservadora               | Browser                                  |
| 008 | Promesas invertidas, vigente solamente; error/retry y total menor con página válida              | Browser consumidor                       |
| 009 | IDs externos persistentes, todos visibles, indeterminate, objetos cargados y lote bloqueado      | Browser                                  |
| 010 | Matriz loading/error/empty/data, loading+error, busy/status/alert y retry único                  | Browser + SSR                            |
| 011 | Enter/Espacio, foco/nombres siguiente acción, aria-sort, labels y anuncios                       | Browser + revisión asistiva manual       |
| 012 | 390×844 / 1280×800, sin desborde, targets 44×44, ocultas excluidas, viewport preserva query      | Browser + revisión visual por plataforma |
| 013 | Consumidor local anterior tipa/renderiza, CRUD callbacks y export local completa/servidor página | SSR + browser + types                    |

Por cada nuevo comportamiento registrar Red con fallo atribuible al AC, implementación mínima, Green y refactor si aporta valor. Para garantías ya presentes añadir cobertura y registrar que pasa en la base; no introducir fallos artificiales para fabricar Red. El AC completo puede combinar evidencia de regresión existente y nuevas pruebas Red/Green.

## Checks y evidencia requerida

Todos los siguientes están `NOT_RUN` en este plan. Ejecutar en raíz con Node 24/npm 11; registrar SHA, comandos, exit codes, límites y artifacts reales en `artifacts/results/FEAT-001/`.

| Momento                      | Comando                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Unit focal Red/Green         | `npm run test:unit -- tests/unit/data-grid-sorting.test.ts`                              |
| Regresión SSR                | `npm run test:unit -- tests/unit/generic-components.test.ts`                             |
| Browser focal, script futuro | `npm run test:e2e:data-grid -- --grep AC-00X` (usar ID real en títulos)                  |
| Integración final types      | `npm run typecheck` y script futuro `npm run typecheck:data-grid-fixture`                |
| Integración final estilo     | `npm run lint` y `npm run format:check`                                                  |
| Integración final unit       | `npm run test:unit`                                                                      |
| Integración final web        | `npm run build:web`, `npm run test:e2e:web`, `npm run test:e2e:data-grid`                |
| Dependencia nueva            | `npm run audit:ci`; registrar hallazgos y excepciones reales, sin asumir baseline pasada |
| Diff                         | `git diff --check`; revisión humana de diff contra AC                                    |

Los scripts de fixture requieren crearse por el owner de toolchain; no ejecutarlos como existentes. Guardar evidencia por AC, logs Red/Green, salida checks y capturas/traces browser en ambas dimensiones. Foco y lector de pantalla requieren revisión manual identificando entorno/tecnología y límites; DOM verde no la sustituye. Integración PostgreSQL y checks Expo son `NOT_APPLICABLE`: no hay cambios API/DB ni código nativo. CI/release no se extiende en esta feature.

## Riesgos, recuperación y cierre

Riesgos: inferencia mixta modifica comparación histórica según regla aprobada; ICU debe probarse en runtime objetivo; parseo de fechas exige validación calendario y zona; props tardías no deben crear estado optimista servidor; consumidor real debe igualar semántica de comparación y mapear claves autorizadas, sin interpolarlas en SQL. Fixture requiere compilación CSS fiel, inclusión TSX en typecheck y aislamiento verificable. No reutilizar aprobación de baseline de calidad como evidencia de esta feature.

Recuperación: mantener commits pequeños por paso y conservar API local. Ante regresión, revertir exclusivamente commits de esta feature en la rama de trabajo tras revisión, sin reset/restore/stash de trabajo del usuario ni tocar servicios/datos. Ninguna operación productiva está prevista.

Condición de cierre: todos los AC con evidencia y checks pertinentes exitosos en la referencia revisada; gate visual y revisión asistiva documentados; ejemplos y límites servidor/export/selección consistentes con código; QA independiente sin bloqueo; diff revisado y sin cambios fuera de alcance. Entregar veredicto real, separando `COMPLETED` de `RELEASED`. Próximo paso: conversación principal presenta plan y resuelve revisión visual pendiente antes del handoff de implementación.

## Aprobación del plan

Usuario: «aprobado», 2026-10-01 America/Tijuana. Incluye Vite para pruebas y diseño v1 desktop/web móvil. Los gates previos de aprobación del plan y diseño quedan resueltos; checks de implementación pendientes.

## Ejecución

Rama creada: `codex/feat-001-data-grid-sorting`. Vite `6.4.3` compatible con los tipos Node fijados; `8.3.2` rechazó ese peer antes de instalación, sin forzar resoluciones. Fixture sin HMR para mantener estados deterministas durante las pruebas. Implementación integrada; cierre/verificación pendientes según [reporte](../results/FEAT-001/verification.md).
