# FEAT-002 — matriz de contraste de tokens Base UI3 v1

- **Estado:** propuesta visual v1 `APPROVED_BY_USER`; ratios HEX `CALCULATED_ONLY`; el fixture estático se conserva como `PREVIEW` histórico. Los 70 pares de tokens CSS de producción evaluados por [check-ui-contrast.mjs](../../../scripts/check-ui-contrast.mjs) pasaron en [contrast-production.txt](contrast-production.txt). Los tests de componentes y axe posteriores constan en [verification.md](verification.md); render/AT manual aún requiere QA.
- **Versión de paleta aprobada:** Base UI3 cálida/oliva/grafito, 2026-10-01.
- **Alcance:** texto/estado activo, controles, badges, menús, diálogos, bordes funcionales, foco y composición de overlay en claro/oscuro.
- **No es:** validación integral de render, prueba de componente ni certificación WCAG.
- Spec visual: [Base UI Shadcn v1](../../../docs/design-specs/shadcn-ui-foundation-v1.md).

## Método y umbrales

Se calculó la luminancia relativa WCAG sobre canales sRGB de los HEX, con la transferencia sRGB habitual (`0.04045`, `12.92`, `1.055`, `2.4`) y la combinación `0.2126R + 0.7152G + 0.0722B`. Ratio = `(L más clara + 0.05) / (L más oscura + 0.05)`. Los valores se redondean a dos decimales. Para el overlay se aplicó composición source-over por canal sRGB de 8 bits y redondeo al entero más cercano; los ratios se calcularon sobre los HEX compuestos resultantes listados más abajo.

Umbral usado para texto activo normal: 4.5:1. Para texto grande: 3:1. Para límites de componentes/estados y foco: 3:1 respecto a colores adyacentes cuando el límite/indicador es necesario para identificar el componente/estado. Los pares mostrados son los pares efectivos de esta propuesta; no representan todos los píxeles de una página ni estados que todavía no tienen tokens definidos.

## Paleta aprobada medida

| Token                            | Claro                             | Oscuro                            |
| -------------------------------- | --------------------------------- | --------------------------------- |
| background / foreground          | `#EEEAE1` / `#252720`             | `#171916` / `#F0ECDF`             |
| card / foreground                | `#F9F7F1` / `#252720`             | `#20221E` / `#F0ECDF`             |
| popover, dialog / foreground     | `#F9F7F1` / `#252720`             | `#2A2C27` / `#F0ECDF`             |
| muted / muted-foreground         | `#E8E4DB` / `#62635A`             | `#2A2C27` / `#AAA99D`             |
| primary / primary-foreground     | `#52684E` / `#FFFDF7`             | `#C1CA8C` / `#20221B`             |
| primary hover / pressed          | `#465B43` / `#3A4E38`             | `#B5C080` / `#AAB574`             |
| secondary / secondary-foreground | `#E3DED2` / `#252720`             | `#30322B` / `#F0ECDF`             |
| secondary hover / pressed        | `#D8D3C7` / `#CEC9BD`             | `#3A3C34` / `#44463D`             |
| accent / accent-foreground       | `#E4E8D9` / `#3D4B34`             | `#34392A` / `#D7DDB1`             |
| border / input                   | `#858176`                         | `#73746A`                         |
| border-hover / ring              | `#686960` / `#52684E`             | `#AAA99D` / `#C1CA8C`             |
| popover-border                   | `#858176`                         | `#858176`                         |
| disabled surface / text / border | `#D7D4CB` / `#595A51` / `#686960` | `#30312B` / `#B7B4A7` / `#858176` |
| destructive solid / foreground   | `#9D2B22` / `#FFFFFF`             | `#F0A49A` / `#2B1512`             |
| destructive hover / pressed      | `#8F251E` / `#781D17`             | `#F4B2A9` / `#E9968B`             |
| destructive badge / foreground   | `#F5DDD8` / `#78261E`             | `#4A2622` / `#F6C2B8`             |
| success badge / foreground       | `#DCE8D3` / `#314A2E`             | `#263A29` / `#C7DFBF`             |
| warning badge / foreground       | `#F4E6C4` / `#614516`             | `#45391F` / `#F0D99B`             |
| info badge / foreground          | `#DFE9EB` / `#324F54`             | `#26393B` / `#B9DADD`             |
| invalid                          | `#8E2B22`                         | `#F0A49A`                         |
| menu hover / selected            | `#E6E8DD` / `#DCE2D3`             | `#303329` / `#373A2D`             |
| overlay                          | `rgb(20 21 16 / 46%)`             | `rgb(0 0 0 / 45%)`                |

## Texto y componentes

Los ratios dentro de cada celda son `claro / oscuro`. Todos estos pares representan el primer plano y el fondo visibles del estado indicado.

| Par efectivo                                                  |   Ratio L / D | Mínimo | Resultado   |
| ------------------------------------------------------------- | ------------: | -----: | ----------- |
| Texto principal / background                                  | 12.59 / 14.97 |    4.5 | PASS / PASS |
| Texto principal / card                                        | 14.11 / 13.57 |    4.5 | PASS / PASS |
| Muted-foreground / background                                 |   5.07 / 7.47 |    4.5 | PASS / PASS |
| Muted-foreground / card (input, placeholders)                 |   5.68 / 6.78 |    4.5 | PASS / PASS |
| Muted-foreground / muted surface                              |   4.80 / 5.96 |    4.5 | PASS / PASS |
| Card/popover foreground / popover surface                     | 14.11 / 11.94 |    4.5 | PASS / PASS |
| Muted-foreground / popover surface                            |   5.68 / 5.96 |    4.5 | PASS / PASS |
| Button primary foreground / primary default                   |   5.99 / 9.26 |    4.5 | PASS / PASS |
| Button primary foreground / primary hover                     |   7.27 / 8.28 |    4.5 | PASS / PASS |
| Button primary foreground / primary pressed                   |   8.87 / 7.33 |    4.5 | PASS / PASS |
| Button secondary foreground / secondary default               | 11.26 / 10.99 |    4.5 | PASS / PASS |
| Button secondary foreground / secondary hover                 |  10.12 / 9.47 |    4.5 | PASS / PASS |
| Button secondary foreground / secondary pressed               |   9.15 / 8.12 |    4.5 | PASS / PASS |
| Button destructive foreground / destructive default           |   7.49 / 8.60 |    4.5 | PASS / PASS |
| Button destructive foreground / destructive hover             |   8.57 / 9.67 |    4.5 | PASS / PASS |
| Button destructive foreground / destructive pressed           |  10.57 / 7.55 |    4.5 | PASS / PASS |
| Button disabled foreground / disabled surface                 |   4.71 / 6.31 |    4.5 | PASS / PASS |
| Button outline/ghost neutral foreground / page                | 12.59 / 14.97 |    4.5 | PASS / PASS |
| Button outline/ghost neutral foreground / card                | 14.11 / 13.57 |    4.5 | PASS / PASS |
| Button outline/ghost neutral text / candidate hover surface   | 12.20 / 10.89 |    4.5 | PASS / PASS |
| Button outline/ghost neutral text / candidate pressed surface |  11.41 / 9.84 |    4.5 | PASS / PASS |
| Button link primary text / page                               |  5.07 / 10.19 |    4.5 | PASS / PASS |
| Button link primary text / card                               |   5.68 / 9.24 |    4.5 | PASS / PASS |
| Secondary Badge text / secondary fill                         | 11.26 / 10.99 |    4.5 | PASS / PASS |
| Outline Badge neutral text / card                             | 14.11 / 13.57 |    4.5 | PASS / PASS |
| Destructive Badge text / fill                                 |   7.74 / 8.37 |    4.5 | PASS / PASS |
| Success Badge text / fill                                     |   7.69 / 8.57 |    4.5 | PASS / PASS |
| Warning Badge text / fill                                     |   7.15 / 8.13 |    4.5 | PASS / PASS |
| Info Badge text / fill                                        |   7.13 / 8.17 |    4.5 | PASS / PASS |
| Default Badge text / primary fill                             |   5.99 / 9.26 |    4.5 | PASS / PASS |
| Input invalid text / card                                     |   7.78 / 8.01 |    4.5 | PASS / PASS |
| Menu normal text / popover                                    | 14.11 / 11.94 |    4.5 | PASS / PASS |
| Menu disabled text / popover                                  |   5.68 / 5.96 |    4.5 | PASS / PASS |
| Menu item text / hover surface                                | 12.20 / 10.89 |    4.5 | PASS / PASS |
| Menu item text / selected surface                             |  11.41 / 9.84 |    4.5 | PASS / PASS |
| Dialog title/body text / dialog surface                       | 14.11 / 11.94 |    4.5 | PASS / PASS |
| Dialog description / dialog surface                           |   5.68 / 5.96 |    4.5 | PASS / PASS |

Default Badge shares the primary colors. Outline/ghost Button and outline Badge use neutral `foreground` (#252720 light, #F0ECDF dark) in resting state; only Button link uses primary olive at rest. Hover/pressed surface ratios for outline/ghost are calculations against candidate surfaces, not observed fixture states. The outline Badge uses the border ratios below. Informative Badge has no interactive hover/pressed state under the approved contract.

## Borders, input states y focus

| Par de límite/indicador                 |              Ratio L / D | Mínimo | Resultado   |
| --------------------------------------- | -----------------------: | -----: | ----------- |
| border / page background                |              3.24 / 3.74 |    3.0 | PASS / PASS |
| border / card                           |              3.63 / 3.39 |    3.0 | PASS / PASS |
| popover-border / popover/dialog surface |              3.63 / 3.63 |    3.0 | PASS / PASS |
| input border / page, card               |  3.24, 3.63 / 3.74, 3.39 |    3.0 | PASS / PASS |
| hover input border / page, card         |  4.63, 5.19 / 7.47, 6.78 |    3.0 | PASS / PASS |
| disabled border / disabled surface      |              3.75 / 3.37 |    3.0 | PASS / PASS |
| disabled border / page background       |              4.63 / 4.55 |    3.0 | PASS / PASS |
| focus ring / page, card                 | 5.07, 5.68 / 10.19, 9.24 |    3.0 | PASS / PASS |
| focus ring / popover/dialog surface     |              5.68 / 8.13 |    3.0 | PASS / PASS |
| outline Badge border / card             |              3.63 / 3.39 |    3.0 | PASS / PASS |

Input default and read-only use card background, foreground/muted-foreground and `input` border; hover uses `border-hover`; focus uses `ring`; invalid uses `invalid` for border and error text; disabled uses the disabled triplet. Their text and boundary pairs are included above. The computed focus ratios are token/surface only; the visual size, 2px ring and offset have not been tested in browser.

## Composición alfa de overlays

Composición candidate source-over en sRGB sobre página/card, con los valores resultantes usados para comprobar cómo se oscurece el contenido subyacente. La capa modal permanece separada y con foco; contenido bajo el overlay es inactivo mientras AlertDialog/Dialog estén modales.

| Tema   | Overlay               | Compuesto sobre page / card | Compuesto foreground principal | Ratio del texto subyacente sobre page / card | Superficie activa modal                   |
| ------ | --------------------- | --------------------------- | ------------------------------ | -------------------------------------------- | ----------------------------------------- |
| Claro  | `rgb(20 21 16 / 46%)` | `#8A8881` / `#908F8A`       | `#1D1F19`                      | 4.69 / 5.14                                  | `#F9F7F1`; frente al backdrop 3.31 / 3.02 |
| Oscuro | `rgb(0 0 0 / 45%)`    | `#0D0E0C` / `#121311`       | `#84827B`                      | 5.03 / 4.85                                  | `#2A2C27`; frente al backdrop 1.41 / 1.32 |

El muted text de fondo bajo el overlay compone a `#3E3F38` (claro) y `#5E5D56` (oscuro): su contraste con el backdrop compuesto es 3.00/3.29 y 2.93/2.82, respectivamente. Esos píxeles pertenecen al contenido de fondo que la capa modal vuelve inactivo; no son pares de texto de la superficie modal activa ni criterio de aceptación para dicho contenido inactivo. Se registran explícitamente para no ocultar el efecto real del alpha. Si el producto requiere que el contenido de fondo permanezca operable/legible al nivel AA mientras se muestra la capa, esta política de overlay deberá cambiarse y volver a medirse.

El color primario de Dialog no alcanza 3:1 con el fondo oscuro compuesto porque ambos son superficies oscuras; el límite del modal se distingue con `popover-border #858176`, que contrasta ≥3:1 con su superficie y con el fondo oscuro base. La suficiencia visual con backdrop compuesto requiere captura/revisión; no se certifica aquí.

## Preview estático de Dialog y AlertDialog

Se añadieron ocho capturas del fixture que muestran la capa, scrim, borde, contenido y acciones del mock. En desktop, cada modal mide 480px de ancho; Dialog 319px de alto y AlertDialog 226px. En móvil 390×844, el ancho es 358px; Dialog 324px de alto y AlertDialog 231px. Los ocho estados caben en los viewports reportados. El responsable inspeccionó cuatro capturas y observó el borde en claro/oscuro y el scrim candidato. El manifest contiene las medidas exactas y bordes/superficies.

| Mock visual (sin interacción) | Capturas                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Dialog desktop                | [claro](visual/ui3-desktop-light-dialog.png) · [oscuro](visual/ui3-desktop-dark-dialog.png)           |
| Dialog móvil                  | [claro](visual/ui3-mobile-light-dialog.png) · [oscuro](visual/ui3-mobile-dark-dialog.png)             |
| AlertDialog desktop           | [claro](visual/ui3-desktop-light-alertdialog.png) · [oscuro](visual/ui3-desktop-dark-alertdialog.png) |
| AlertDialog móvil             | [claro](visual/ui3-mobile-light-alertdialog.png) · [oscuro](visual/ui3-mobile-dark-alertdialog.png)   |
| Métricas/capturas completas   | [manifest](visual/manifest.json) · [índice visual](visual/README.md)                                  |

Estos son estados dibujados estáticamente por el fixture y, por sí solos, no prueban Escape, clic fuera, botones Cancelar/acción, callbacks, foco inicial/retorno, trap de foco, teclado, lector de pantalla ni comportamiento de Base UI. La política funcional aprobada es: Dialog cierra con Escape/clic fuera; AlertDialog no cierra fuera y Escape equivale a Cancelar. La interacción automatizada posterior consta en [verification.md](verification.md); lector de pantalla permanece manual.

## Correcciones detectadas durante el cálculo

| Candidato inicial                  | Par que falló                                                  |         Ratio | Corrección candidata                                              |                    Nuevo ratio |
| ---------------------------------- | -------------------------------------------------------------- | ------------: | ----------------------------------------------------------------- | -----------------------------: |
| `muted-foreground` light `#686960` | texto sobre `muted #E8E4DB`                                    | 4.38:1 (<4.5) | Cambiado a `#62635A`                                              |                         4.80:1 |
| Overlay dark negro al 62%          | texto principal subyacente compuesto frente al fondo compuesto | 2.87:1 (<4.5) | Reducido a 45%; contenido inactivo mientras el modal está abierto | 5.03:1 en page, 4.85:1 en card |

Se eligió `#62635A`, no la opción más luminosa original, para asegurar margen sobre la superficie muted manteniendo el matiz cálido. Se mantiene la opacidad overlay light 46%; el texto principal subyacente supera 4.5:1. El muted bajo cualquier scrim de estos niveles queda por debajo de 4.5:1 y se clasifica como contenido inactivo/inerte; la lectura de esa composición permanece explícita arriba.

## Estado de evidencia y límites

- **CALCULATED_ONLY:** ratios calculados de los pares explícitos HEX y composiciones alfa de las tablas.
- **PREVIEW del fixture:** Chromium 153 midió 320×700, 390×844 y 1280×800, ambos temas: `scrollWidth` igual al viewport, ningún texto visible menor de 12px, ningún botón/enlace touch menor de 44px, y con reduced motion animation/transition `1e-05s`. El DOM audit limitado del fixture estático (sin un modal abierto) reportó cero pares de texto compuesto <4.5:1; excluye pseudo-elementos/imágenes, no certifica WCAG ni producción, y no contradice el cálculo del contenido atenuado tras un overlay modal.
- **Capturas de la propuesta aprobada:** [desktop claro](visual/ui3-desktop-light.png), [desktop oscuro](visual/ui3-desktop-dark.png), [móvil claro](visual/ui3-mobile-light.png), [móvil oscuro](visual/ui3-mobile-dark.png), [320px claro](visual/ui3-narrow-light.png), [320px oscuro](visual/ui3-narrow-dark.png); [manifest.json](visual/manifest.json). Son capturas estáticas del fixture, no QA de interacción ni de producción.
- **PREVIEW, capas:** los ocho mocks de Dialog/AlertDialog caben en los viewports y muestran superficie/borde/scrim; la revisión fue estática, no de interacción.
- **NOT_RUN:** page zoom 200%, focus-ring/offset visual, pruebas keyboard/VoiceOver/axe, callbacks/cierre de overlays, comportamiento del wrapper Base UI y QA de componentes productivos.
- La versión visual v1 para web desktop y móvil responsive fue aprobada explícitamente por el usuario el 2026-10-01; el QA de producto sigue pendiente.

Los resultados matemáticos no resuelven antialiasing, diferencias entre CSS/driver, legibilidad tipográfica, estado de foco real, movimiento, lectura por AT ni calidad estética. Medir de nuevo cualquier par si cambia color, alpha, superficie, estado, tema o implementación.
