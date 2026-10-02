# FEAT-001 — Diseño del grid v1

Estado: `APPROVED_BY_USER`. Fecha: 2026-10-01, America/Tijuana. Base: `ae67fc729d871ac4a771bfb93880f81931c67d67`, rama `codex/agent-separation`. Plataformas: desktop web 1280×800 y móvil web 390×844. [Sesión y fuentes](../design-sessions/2026-10-01-feat-001-data-grid.md). [Contrato funcional aprobado](../../specs/FEAT-001-data-grid-sorting.md).

## Procedencia y alcance

CONFIRMED: usar estilo actual como referencia. OBSERVED aquí significa leído en código, sin render observado: toolbar, paneles blancos, tabla desktop, tarjetas móviles, badges, skeletons y paginación del componente local. Todo ajuste descrito abajo es PROPOSED para aceptación de esta versión; no modifica reglas de negocio aprobadas. Local y servidor comparten composición; en servidor el estado visual sigue props controladas hasta que el consumidor las actualiza.

No incluye interfaces nativas, CCentral ni un nuevo sistema general Shadcn. No existen capturas verificadas ni referencias externas para esta versión.

## Base visual conservada

| Elemento        | Observado en referencia                                                                                     | Aplicación v1 propuesta                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Superficie      | Blanco; body `#F8FAFC`; borde `#E2E8F0`; `shadow-sm`                                                        | Conservar paneles y separación                                                 |
| Color principal | `#0D9488`; hover `#0F766E`; active `#115E59`                                                                | Conservar acciones e indicador activo                                          |
| Texto           | Títulos `#0B1C30`; secundarios clases slate                                                                 | Conservar jerarquía y comprobar contraste del foco/texto                       |
| Error           | `#DC2626`, fondo `#FEE2E2`                                                                                  | Conservar panel y usar mensaje apto para usuario                               |
| Radios          | Paneles `rounded-2xl`, controles `rounded-xl`/`rounded-lg`, badges pill                                     | Conservar; no convertir todo en un radio único                                 |
| Tipografía      | Plus Jakarta Sans, Inter, system-ui; título `text-lg`, tarjeta `text-sm`, cuerpo `text-xs`, encabezado 11px | Conservar familia heredada y jerarquía; disponibilidad de fuente no verificada |
| Espaciado       | Panel p-4, separación 16px, tarjeta p-4, celdas px-4/py-3                                                   | Conservar densidad; ampliar áreas interactivas móviles                         |
| Badge/Skeleton  | Badge `slate` y variantes existentes; skeleton slate-200 animado                                            | Reutilizar; skeleton no anuncia cada placeholder                               |

Los controles nuevos heredan estos colores, radios y tipografía. Foco propuesto: contorno visible de 2px teal con offset 2px, sin recorte por overflow; validar contraste en la superficie real. Estado activo usa también flecha y texto accesible, no solo color.

## Desktop web: 1280×800

Orden vertical: toolbar → panel de filtros expandido dentro de toolbar → panel de estado o tabla → paginación. Toolbar mantiene título/descripción a izquierda y export/agregar a derecha; siguiente fila búsqueda, filtros y selección/lote con wrap cuando corresponda. Tabla conserva cabecera slate-50, separadores, selección inicial y acciones finales. El scroll horizontal, si una tabla amplia lo necesita, queda dentro de su contenedor; la página y toolbar no desbordan.

Cada encabezado sortable contiene un botón con texto de columna y `⇅` en none, `▲` asc, `▼` desc. Flecha activa teal, las otras neutras. Botón mantiene foco tras activar; `th` recibe `aria-sort="none|ascending|descending"`. Iconos decorativos `aria-hidden`. Nombre accesible expresa próxima acción: «Nombre: ordenar ascendente», «Nombre: ordenar descendente», «Nombre: quitar orden». Columna no ordenable no tiene botón ni aria-sort. Enter/Espacio activa el mismo ciclo aprobado; cambiar columna inicia asc y página 1.

## Móvil web: 390×844

Conservar transición `md` del código: debajo de md tarjetas y sin tabla; desde md tabla y sin tarjetas. Cambiar viewport conserva query y selección; no duplicar controles ocultos en el recorrido de foco. No se afirma que este diseño cubra apps nativas.

Toolbar apilada: título/descripción → acciones con wrap → búsqueda de ancho disponible y filtros → selección/lote → filtros expandidos → bloque de orden. Bloque de orden dentro de la toolbar, antes del panel de estado/tarjetas: etiqueta «Ordenar por», select flexible y botón de dirección; gap 8px. Si nombres largos impiden caber, botón pasa a otra línea sin truncar su acción. Select solo ofrece «Sin orden» y columnas sortable visibles (`mobilePriority: hidden` excluidas). No mostrar bloque si no hay columnas elegibles.

| Query visible | Select            | Botón y próxima acción                                         |
| ------------- | ----------------- | -------------------------------------------------------------- |
| none          | Sin orden         | «Dirección» deshabilitado; elegir una columna primero          |
| columna asc   | Nombre de columna | «Ascendente ▲»; nombre accesible «Nombre: ordenar descendente» |
| columna desc  | Nombre de columna | «Descendente ▼»; nombre accesible «Nombre: quitar orden»       |

Elegir columna activa asc; elegir otra reemplaza la anterior; elegir «Sin orden» limpia orden. Botón cicla asc → desc → none; al llegar a none el select vuelve a «Sin orden», evitando que una columna aparezca activa sin orden. Es propuesta de representación del mismo contrato single-sort. En servidor no mostrar selección optimista antes de props actualizadas.

Tarjetas conservan fila superior de selección/título principal y badges meta, pares etiqueta/valor y acciones al pie. Textos largos hacen wrap; pares pueden apilarse sin solaparse. Acciones de tarjeta envuelven a nueva línea. Todos los objetivos interactivos móviles alcanzan 44×44px, incluidos checkbox mediante label/área asociada, limpiar búsqueda, filtros, select, lote, export/agregar, retry y paginación; ampliar área sin agrandar necesariamente el glyph. La clase global existente `min-touch-target` de 48px es compatible.

Paginación apila tamaño/conteo y navegación; permitir wrap y separar «Pág. X de Y» de botones si falta espacio. Conservar cuatro acciones y etiquetas, aumentar botones actuales de 36px a mínimo 44px en móvil. Tamaño de página y consulta siguen disponibles con cero resultados.

## Selección y estados comunes

Checkbox de todos visibles disponible también en toolbar móvil cuando selectable y hay filas; label «Seleccionar todos los visibles», estado indeterminado real para selección parcial. Persistencia de IDs no implica disponibilidad de objetos. Texto de lote: «N seleccionados · M disponibles»; si M<N, acciones basadas en objetos deshabilitadas y explicación visible «Carga los registros seleccionados para usar acciones en lote». No esconder la causa dentro de un tooltip. Conservar selección y tono teal de tarjetas/filas.

Precedencia visual: loading → error → vacío → datos. Solo un panel principal visible.

| Estado | Composición y anuncio                                                                                                                              | Disponibilidad                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Carga  | Panel blanco y skeleton; en móvil skeleton de tarjeta ajustado al ancho, sin fila fija que desborde; grid `aria-busy`; status «Cargando registros» | Consulta habilitada; navegación, selección y acciones de filas deshabilitadas |
| Error  | Panel rojo, título/mensaje seguro y Reintentar si existe; en móvil botón apilable; role alert                                                      | Consulta disponible; retry no altera query                                    |
| Vacío  | Icono decorativo, título/mensaje existentes; conteo «0 resultados»; agregar si configurado                                                         | Búsqueda, filtros, orden y tamaño disponibles                                 |
| Datos  | Tabla o tarjetas; conteo/rango de modo correspondiente y paginación                                                                                | Lote condicionado a objetos disponibles                                       |

Carga oculta error anterior, vacío y datos. No anunciar skeletons ni desplazar foco al resolver. Error no expone detalles técnicos crudos. Export conserva significado aprobado: local conjunto completo filtrado/ordenado; servidor «Exportar página» para no prometer todos los resultados.

## Accesibilidad y recorrido

Tab sigue DOM visual: acciones toolbar → búsqueda y limpiar → filtros/lote → filtros expandidos → orden móvil → selección/encabezados o tarjetas/acciones → tamaño y navegación. No forzar tabindex positivos. Inputs/selects tienen label asociado; botones de iconos nombre explícito; filtro expone expansión. Foco sigue visible al pulsar, cargar o reintentar y nunca desaparece al cambiar datos.

Una región `role=status`/`aria-live=polite` anuncia orden y resultados, por ejemplo «Nombre, ascendente. 24 resultados» o «Sin orden. 0 resultados»; se deriva del estado vigente, incluido el control por props servidor. No duplicar anuncios con iconos o skeletons. Error usa alerta. Revisión manual de lector de pantalla debe comprobar anuncios efectivos y foco; inspeccionar atributos DOM no la sustituye.

## Criterios visuales y evidencia pendiente

| ID   | Verificación requerida                                                                               | AC funcional       | Evidencia |
| ---- | ---------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| V-01 | Tres estados de flecha/nombres, cambio columna y foco sin recorte desktop                            | 001, 011           | NOT_RUN   |
| V-02 | Selector móvil, none coherente, columnas ocultas excluidas, misma query al cambiar viewport          | 001, 012           | NOT_RUN   |
| V-03 | Toolbar, filtros, títulos y tarjetas largas sin desborde a ambas dimensiones; targets móviles ≥44×44 | 005, 012           | NOT_RUN   |
| V-04 | Parcial/todos visibles y N/M; lote incompleto bloqueado con causa visible                            | 009, 011           | NOT_RUN   |
| V-05 | Matriz loading/error/empty/data y loading+error; consulta activa durante loading; skeleton contenido | 010, 012           | NOT_RUN   |
| V-06 | Tab/Enter/Espacio, labels, aria-sort, status/busy/alert y lector de pantalla sin anuncios duplicados | 011                | NOT_RUN   |
| V-07 | Servidor sigue props, conserva orden recibido y presenta rango correcto; export página explícita     | 006, 007, 008, 013 | NOT_RUN   |
| V-08 | Renderer formateado, badges y CRUD conservan composición mientras orden cambia por valor real        | 004, 013           | NOT_RUN   |

AC-002/003 corresponden a comparadores unitarios; no se validan con capturas. Tras implementar, guardar capturas reales por plataforma, modo y estado, medición de áreas táctiles, browser checks y revisión asistiva identificando entorno. Ninguna evidencia se ejecutó para este documento.

## Gate de revisión

Pendiente aceptar v1 para desktop web y móvil web, incluida composición del control móvil y selección incompleta. La aprobación de la referencia no aprueba esta versión. Tras aceptación, la conversación principal registra el gate y revisa el plan técnico antes de delegar TDD. Cambios visuales materiales posteriores requieren nueva versión.

## Aceptación registrada

El usuario aprobó la versión 1 para desktop web y móvil web el 2026-10-01 (America/Tijuana) con «aprobado», en respuesta a la solicitud que incluía también el plan técnico y Vite para el fixture. Los apartados previos describen el proceso de propuesta; esta aceptación resuelve su gate. Pruebas y evidencia runtime siguen pendientes.

## Aplicación del contrato durante implementación

Los encabezados desktop permanecen disponibles durante carga, error y vacío; una celda a todo el ancho muestra el panel de estado. Esto cumple disponibilidad de consulta y conservación de foco (AC-010/011) sin trasladar foco por código. En móvil el panel se muestra sin encabezados y conserva el selector. Los anuncios permanecen fuera del área busy y el error usa solamente la alerta. Capturas y resultados runtime: [verification.md](../../artifacts/results/FEAT-001/verification.md).
