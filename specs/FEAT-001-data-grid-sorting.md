# FEAT-001: Contrato de ordenación y consulta de GenericCrudDataGrid

> Estado: `VERIFIED`
> Owner: `product_manager` (Codex subagent)
> Metodología: Spec-Driven Development (SDD)
> Repo: [miguelms/GoldenStarterCodex](https://github.com/miguelms/GoldenStarterCodex)
> Rama: `codex/agent-separation`
> Base: `ae67fc729d871ac4a771bfb93880f81931c67d67`
> Sesión: [2026-10-01-data-grid-sorting](../docs/live-sessions/2026-10-01-data-grid-sorting.md)

El usuario aprobó esta spec en la conversación principal el 2026-10-01 (America/Tijuana), con el mensaje «spec aprobada». Las reglas marcadas RECOMMENDATION se conservan como procedencia de la propuesta y quedan aceptadas por esta aprobación. Autoriza la planificación técnica; la aprobación visual permanece pendiente antes de implementar UI.

## 1. Visión y Caso de Uso (User Story)

- **Como:** usuario de una lista y desarrollador que integra el componente.
- **Quiero:** ordenar columnas desde encabezados y controles móviles, con resultados coherentes en modo local y servidor.
- **Para:** explorar datos reales sin depender de su representación visual ni perder el contexto de consulta.

**CONFIRMED:** incluir ambos modos en FEAT-001. Definir antes de adoptar en CCentral el contrato de comparación, valores reales/accessor, búsqueda, filtros, selección, paginación, carga/error/vacío, responsive y accesibilidad, con pruebas por comportamiento. La implementación se realizará después de aprobar la spec.

**Estado observado en la base:** el componente ya implementa el ciclo ascendente → descendente → sin orden y reinicia página. Compara `row[key]`; `accessor` devuelve `ReactNode` para renderizar. Ordena, filtra y pagina localmente. Falta `aria-sort`, control móvil de ordenación y contrato servidor. Hay seis pruebas SSR en `tests/unit/generic-components.test.ts`, sin interacción. La búsqueda de usos encontró un ejemplo en `src/components/shared/README.md`, sin pantalla ejecutable consumidora. Esto justifica un consumidor sintético para validar el piloto.

Dependencias: [constitución SDD](../SDD/constitution.md), `AGENTS.md`, componente actual y configuración Vitest/Playwright. No hay referencias Stitch/Figma suministradas para esta feature. Métrica de éxito propuesta: todos los AC verificados y revisión visual desktop/móvil aprobada; no se establece una métrica comercial.

## 2. Especificación de Comportamiento (Given / When / Then)

Todas las reglas de esta sección son **RECOMMENDATION**.

### Escenario 1: Ordenación local y valores reales

- **Given:** datos completos en modo local y una columna `sortable`.
- **When:** se activa por clic, Enter o Espacio su encabezado.
- **Then:** alterna `none → asc → desc → none`; otra columna comienza en `asc`, reemplaza la anterior y lleva página a 1. Solo hay una columna activa. Quitar orden recupera el orden de entrada después de aplicar la consulta.
- **Given:** empates, datos visualmente formateados o una columna calculada.
- **When:** se compara.
- **Then:** los empates conservan orden de entrada; se usa `sortValue(row)` si existe, o `row[key]`. `accessor` conserva exclusivamente su función de presentación. No se inspecciona ni convierte `ReactNode` para ordenar, ni se muta `data`.

### Escenario 2: Comparadores y valores inválidos

- **Given:** columna con tipo declarado `text`, `number` o `date`.
- **When:** se ordena en cualquiera de las direcciones.
- **Then:** `null`, `undefined` y cadena vacía quedan al final en ambas direcciones; dos vacíos son empate. No se recorta una cadena de espacios para tratarla como vacía.
- Texto: comparación `Intl.Collator("es", { sensitivity: "base", numeric: false })`; diferencias ignoradas de mayúsculas/acentos son empate estable. No se aplica orden numérico a cadenas.
- Números: solo números finitos, comparados numéricamente; cadenas numéricas no se convierten automáticamente. `NaN`, infinitos y valores incompatibles se tratan como vacíos.
- Fechas: `Date` válida, epoch en milisegundos finito o ISO `YYYY-MM-DD` válida (UTC a medianoche) / datetime ISO con `Z` u offset explícito. Comparación por epoch; rechazar fechas de calendario imposibles, strings regionales, datetime sin zona y `Invalid Date`, tratándolos como vacíos. Sin detección automática de fechas en texto.
- Compatibilidad propuesta: columnas sin tipo explícito resuelven un único comparador por consulta: numérico si todos los valores no vacíos son números finitos; texto en los demás casos, convirtiendo los valores compatibles a string. No se cambia de comparador según el par de filas, para mantener un orden consistente. Esta normalización de columnas mixtas es un cambio respecto de la comparación actual y requiere aprobación. Columnas nuevas con datos mixtos deben declarar tipo y normalizar mediante `sortValue`; las fechas requieren tipo explícito.

### Escenario 3: Búsqueda, filtros y paginación local

- **Given:** búsqueda, filtros y orden activos.
- **When:** cambia cualquiera de ellos o el tamaño de página.
- **Then:** reinicia página a 1; limpiar búsqueda también lo hace. Pipeline: buscar → filtrar → ordenar → paginar. Búsqueda global sobre valores brutos no nulos de la fila mediante inclusión sin distinguir mayúsculas; recortar consulta antes de comparar. Filtros por columna: igualdad de `String(row[key])` sin distinguir mayúsculas, excluyendo nulos; filtros múltiples se combinan con AND. No buscan en contenido JSX.
- **Given:** disminuye el número de filas disponibles.
- **When:** la página queda fuera de rango.
- **Then:** localmente se limita a la última página válida. Cero resultados muestra vacío y conteo 0; los controles de consulta permanecen disponibles. Tamaños son enteros positivos de `pageSizeOptions`; página es un entero basado en 1.

### Escenario 4: Consulta controlada en servidor

- **Given:** modo servidor con `data` igual a la página recibida, `totalRows` igual al total tras filtros y estado controlado.
- **When:** cambia orden, búsqueda, filtros o tamaño.
- **Then:** emite una sola llamada atómica `onQueryChange(nextState)` incluyendo `page: 1`; navegar conserva el resto de la consulta. Sin callback inicial por montar. No ordena, filtra ni hace slice local de `data`. Muestra sus filas en el orden recibido y calcula rango/páginas usando `totalRows`.
- **Given:** se emite la consulta y su consumidor aún no actualiza props.
- **Then:** el estado visible sigue las props controladas. El consumidor realiza solicitudes, aplica parámetros, normaliza comparación compatible, actualiza estado/carga/error y descarta respuestas obsoletas. El grid no crea un backend ni realiza fetch.
- **Given:** total cambia y la página controlada queda fuera de rango.
- **Then:** el consumidor suministra una página válida (o 1 para total 0); el grid no dispara callbacks por render para corregirla. Props inválidas son incumplimiento del contrato y se validan mediante tipos/fixture, sin inventar datos.
- **Given:** dos respuestas llegan fuera de orden al consumidor sintético.
- **Then:** solo publica la respuesta de la consulta vigente. Esta evidencia pertenece al consumidor, no a una garantía de red del grid.

### Escenario 5: Selección estable

- **Given:** IDs únicos y estables obtenidos de `keyExtractor`.
- **When:** cambia consulta, página o orden.
- **Then:** persisten los IDs seleccionados; seleccionar todos agrega o retira solo IDs visibles y conserva los de otras páginas. Estado parcial usa checkbox indeterminado.
- **Then:** `selectedItems` representa únicamente objetos seleccionados presentes en `data`; en servidor no promete objetos de páginas no cargadas. Propuesta: exigir selección controlada en servidor. Las acciones en lote basadas en objetos se deshabilitan si hay IDs seleccionados ausentes; el consumidor puede resolver acciones globales mediante IDs fuera del grid. Debe indicarse cuántos seleccionados están disponibles.

### Escenario 6: Carga, error y vacío

- **Given:** cualquier modo.
- **Then:** precedencia propuesta `isLoading → error → vacío → datos`: loading muestra skeleton y `aria-busy`, oculta filas, error anterior y vacío; error muestra mensaje y reintento si existe; vacío solo sin carga/error. Reintento invoca una vez `onRetry`, sin modificar consulta. No renderizar error crudo con secretos: consumidor suministra mensaje apto para usuario.
- Controles de consulta permanecen disponibles durante carga para permitir nueva consulta; navegación, selección y acciones de filas quedan deshabilitadas. Tras resolver, se anuncia estado/cantidad sin mover foco. No se anuncian skeletons individuales.

### Escenario 7: Desktop, móvil y accesibilidad

- **Given:** desktop.
- **Then:** encabezados ordenables son botones con foco visible, nombre que incluye columna y siguiente acción; `th` expone `aria-sort="none|ascending|descending"` coherente. Iconos decorativos no duplican anuncios. Columnas no ordenables no tienen acción ni `aria-sort`.
- **Given:** móvil con tabla oculta.
- **Then:** control de columna y dirección/sin orden usa el mismo estado/ciclo; tarjetas muestran idéntico orden y página. Solo incluye columnas ordenables visibles; `mobilePriority: hidden` sigue excluida. No se pierde consulta al cambiar viewport.
- **Then:** búsqueda, filtros, tamaño, paginación y selección tienen etiquetas accesibles; región `role=status`/`aria-live=polite` anuncia orden y resultados, error usa alerta. A 390×844 y 1280×800 los controles no desbordan; objetivos táctiles móviles de al menos 44×44 px. Revisión visual por plataforma pendiente y separada, sin rediseño general.

## 3. Contratos Afectados (`packages/contracts`)

**RECOMMENDATION:** contrato UI TypeScript local, sin nuevo esquema Zod ni cambio de contrato HTTP compartido en `packages/contracts`. Forma propuesta, nombres sujetos al plan posterior:

```typescript
type GridSort = { key: string; direction: "asc" | "desc" } | null;
type GridQuery = {
  sort: GridSort;
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>;
};
type GridSortValue = string | number | Date | null | undefined;
// Extensiones a ColumnDef<T>, manteniendo accessor?: (row: T) => React.ReactNode:
// sortType?: "text" | "number" | "date";
// sortValue?: (row: T) => GridSortValue;
type GridMode =
  | { mode?: "local" }
  | {
      mode: "server";
      query: GridQuery;
      onQueryChange: (next: GridQuery) => void;
      totalRows: number;
      selectedIds: string[];
    };
```

Compatibilidad: modo local por defecto, firma de `accessor` y callbacks CRUD existentes preservada. Si `selectable=false`, el plan podrá afinar la unión para no exigir `selectedIds`; ese detalle no cambia la selección controlada cuando se habilita. `totalRows` entero no negativo; orden solo acepta claves declaradas ordenables, con mapping autorizado a API responsabilidad del consumidor. No interpolar claves de UI en SQL. Sin datos reales, servicios externos ni producción para validar.

Exportación propuesta: callback local recibe resultados filtrados/ordenados completos como hoy; servidor recibe únicamente la página recibida. Exportar todo el resultado del servidor requiere una acción propia del consumidor y queda fuera de alcance. Documentar esta diferencia, sin prometer exportación global.

## 4. Scorecard de Criterios de Aceptación (Verificación Automática)

Rutas siguientes **propuestas y futuras**, no archivos creados en esta tarea. `U` = `tests/unit/data-grid-sorting.test.ts`; `B` = `tests/e2e/data-grid-contract.spec.ts`; `R` = `tests/unit/generic-components.test.ts`. Consumidor de pruebas sintético y aislado para ambos modos por definir en el plan; habilitado solo en pruebas, sin endpoint público de producción ni pantalla de producto para el piloto.

| ID     | Descripción verificable propuesta                                                                                                                             | Tipo / archivo          | Evidencia |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------- |
| AC-001 | Activar tres veces una columna produce asc/desc/none; cambiar columna empieza asc; no ordenables no reaccionan; página vuelve a 1                             | Browser / B             | NOT_RUN   |
| AC-002 | Texto es con mayúsculas/acentos, números 2/10, negativos y empates siguen comparador y estabilidad; input no se muta                                          | Unit / U                | NOT_RUN   |
| AC-003 | Fechas equivalentes con distinto offset empatan; epoch, fecha UTC y límites de calendario; inválidos y vacíos quedan últimos en asc y desc                    | Unit / U                | NOT_RUN   |
| AC-004 | Accessor monetario/fecha/JSX y sortValue calculado ordenan valor real; renderer no se usa como comparador                                                     | Unit / U + Browser / B  | NOT_RUN   |
| AC-005 | Buscar, filtrar AND, limpiar y cambiar tamaño reinician página; pipeline correcto y límite local tras reducir datos                                           | Unit / U + Browser / B  | NOT_RUN   |
| AC-006 | Servidor preserva orden/filas recibidas incluso si contradicen consulta; sin segundo slice; total/rango/páginas correctos                                     | Browser / B             | NOT_RUN   |
| AC-007 | Cada cambio servidor emite exactamente una query completa con reset adecuado; montaje no emite; navegación conserva consulta                                  | Browser / B             | NOT_RUN   |
| AC-008 | Consumidor fake resuelve dos solicitudes invertidas y rechaza la antigua; controla error/retry y página válida tras cambio de total                           | Browser integración / B | NOT_RUN   |
| AC-009 | IDs persisten al ordenar/filtrar/paginar; todos visibles conserva IDs externos; checkbox parcial; selectedItems solo cargados y lote incompleto deshabilitado | Browser / B             | NOT_RUN   |
| AC-010 | Carga/error/vacío/datos y loading+error cumplen precedencia, busy/alert/status; retry no cambia query y dispara una vez                                       | Browser / B + SSR / R   | NOT_RUN   |
| AC-011 | Enter/Espacio, foco, nombres de próxima acción, aria-sort y anuncios coherentes; etiquetas accesibles en todos los controles                                  | Browser / B             | NOT_RUN   |
| AC-012 | 390×844/1280×800 sin desborde; móvil permite ordenar misma página; viewport conserva query; controles táctiles ≥44×44                                         | Browser / B             | NOT_RUN   |
| AC-013 | API local previa, renderer y acciones CRUD siguen funcionando; export local completa vs servidor página explícita                                             | SSR / R + Browser / B   | NOT_RUN   |

Vitest usa entorno `node` e incluye `tests/**/*.test.ts`: adecuado para comparadores puros/SSR, no demuestra interacción. Playwright usa `tests/e2e` y servidor local en puerto 3101: usar interacción real y consumidor fake con datos sintéticos. No incorporar librería DOM o modificar configuración sin necesidad demostrada en el plan.

Evidencia requerida tras aprobación: por AC prueba Red relevante, cambio mínimo Green y refactor si aporta valor; comandos, resultado real, SHA y artifacts. Revisión visual desktop/móvil y comprobación manual con tecnología asistiva complementan AC-011/012; prueba DOM no prueba por sí sola experiencia de lector de pantalla. Suite actual y propuesta: **NOT_RUN**. Checks de documentación se reportan en la entrega, separados de pruebas funcionales.

## 5. Fuera de Alcance (Límites Estrictos para Evitar Drift)

- Implementación durante esta revisión; plan técnico antes de aprobación.
- Cambios en CCentral o configuración/agentes de Antigravity; migración de pantallas.
- Backend, endpoints, seguridad/autorización nueva, caché o framework de solicitudes.
- Orden multicolumna, columnas ocultables nuevas, virtualización, fechas regionales automáticas, exportación global servidor.
- Rediseño general, base Shadcn/tokens/variantes, CI/release o despliegue. Son pasos posteriores.
- Decidir distribución por copias versionadas o paquete compartido: se posterga al piloto de CCentral.

## 6. Revisión aprobada y gate

Los puntos funcionales 1–4 y la propuesta funcional móvil del punto 5 quedaron aprobados con esta spec. La revisión visual de desktop y móvil se aprobó durante el piloto y está respaldada por evidencia de capturas.

1. Aprobar o ajustar ciclo único, comparadores, reglas de vacíos/fechas y compatibilidad sin `sortType`.
2. Aprobar contrato servidor controlado, callback atómico y responsabilidades del consumidor.
3. Aprobar búsqueda/filtro sobre valores brutos, selección persistente, límite de selectedItems/lotes y exportación por página servidor.
4. Aprobar precedencia carga/error y controles disponibles durante carga.
5. Aprobar propuesta funcional móvil y solicitar artefacto/revisión visual por plataforma antes de implementar UI.

Riesgos: backend consumidor debe acordar comparadores equivalentes; ICU puede producir diferencias marginales entre runtimes, por lo que fixtures de texto requieren resultados explícitos en runtime probado. Selección global requiere resolución externa. No existe consumidor ejecutable para pruebas de interacción y deberá prepararse un fixture aislado en la implementación aprobada.

Gate: spec `APPROVED_BY_USER` → planificación aplicable y aprobación visual → TDD → diff/evidencia contra AC. La aprobación funcional está registrada; no acredita pruebas ni aceptación visual.

## Implementación y verificación

Implementación en `codex/feat-001-data-grid-sorting`, con aprobación funcional y visual registradas. La evidencia original NOT_RUN de esta matriz corresponde a la redacción; los resultados actuales y límites están en [verification.md](../artifacts/results/FEAT-001/verification.md). AC-011 recibió PASS manual de VoiceOver confirmado por el usuario y registrado en [manual-assistive.md](../artifacts/results/FEAT-001/manual-assistive.md). La spec queda `VERIFIED`: ambos audits pasan con una excepción de riesgo temporal, acotada y aceptada para GHSA-86w9-cpqp-85rv, documentada en [FEAT-001-node-forge-risk-acceptance.md](../docs/security/FEAT-001-node-forge-risk-acceptance.md). La aceptación requiere revisión antes del 2026-10-31 y caduca en CI el 2026-11-01. No hay release.
