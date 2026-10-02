# FEAT-002: Base visual Shadcn para web

> Estado: `APPROVED_BY_USER`
> Owner: `product_manager` (Codex subagent)
> Metodología: Spec-Driven Development (SDD)
> Repo: [miguelms/GoldenStarterCodex](https://github.com/miguelms/GoldenStarterCodex)
> Rama: `codex/feat-001-data-grid-sorting`
> Base: `ae67fc729d871ac4a771bfb93880f81931c67d67`
> Sesión: [2026-10-01-ui-foundation](../docs/live-sessions/2026-10-01-ui-foundation.md)

Esta spec establece una selección pequeña, mantenida y verificable de componentes Shadcn para la web responsive del starter, con temas claro y oscuro. No replica el catálogo completo de Shadcn. El usuario aprobó explícitamente esta spec el 2026-10-01. Los valores exactos de tokens son candidatos pendientes de medir contraste; la aprobación de la spec no equivale a aprobación de tokens finales, diseño visual detallado ni plan técnico.

## 1. Visión y caso de uso

- **Como:** equipo que crea aplicaciones a partir de GoldenStarterCodex.
- **Quiero:** una base visual consistente, accesible y probada para controles y superficies comunes, disponible en temas claro y oscuro.
- **Para:** componer interfaces nuevas sin reinventar sus estilos y estados, y adoptar luego la base en CCentral de forma evaluada y gradual.

### Alcance funcional

**CONFIRMADO:** incluir tema claro y tema oscuro; definir tokens semánticos para color y superficie, tipografía, radios, foco y movimiento; acordar variantes y estados de componentes frecuentes; probar el contrato antes de adoptar componentes en CCentral.

**Selección acotada confirmada:**

| Grupo         | Componentes incluidos                   | Alcance                                                                                                                                             |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acción        | `Button`                                | variantes default, secondary, outline, ghost, destructive y link; tamaños default, sm, lg e icon                                                    |
| Campos        | `Input`, `Textarea`, `Label`            | estados default, hover, focus-visible, disabled, invalid y readonly cuando aplique; asociación label/control y texto de ayuda/error                 |
| Superficie    | `Card`                                  | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`; estilo base, no variantes de producto                            |
| Estado        | `Badge`                                 | default, secondary, outline, destructive, success, warning e info; contenido de texto siempre comprensible sin depender solo del color              |
| Carga         | `Skeleton`                              | bloques genéricos y composición demostrativa de tarjeta; decorativo para AT, con estado de carga anunciado por el contenedor                        |
| Superposición | `DropdownMenu`, `Dialog`, `AlertDialog` | disparador, contenido, título/descripción, acciones, cierre, teclado, foco y capas; `AlertDialog` solo para confirmaciones importantes/destructivas |

No se propone añadir `Select`, `Checkbox`, `Table`, `Tooltip`, `Popover`, `Tabs`, `Toast`, `Form`, `Calendar` ni un componente genérico de estado/alerta en esta entrega. Podrán evaluarse en specs separadas. Las siete variantes Badge están confirmadas; sus colores exactos requieren contraste medido. No se añadirán paletas ilimitadas por aplicación.

### Base observada

`components.json` declara estilo `new-york`, variables CSS, Tailwind 4 y Lucide. Existen `button`, `input`, `textarea`, `label`, `card`, `badge` y `skeleton` bajo `src/components/ui`. El CSS global hoy fija `color-scheme: light`, fuente Plus Jakarta Sans/Inter y colores propios, mientras algunos componentes usan clases Slate hard-coded y otros contienen clases `dark:`. No existen `DropdownMenu`, `Dialog` o `AlertDialog`. La base exacta y sus dependencias deben confirmarse durante el plan, después de aprobar la spec.

## 2. Contrato de comportamiento y presentación

**CONFIRMADO (paquete aceptado por el usuario):** dirección visual Base UI3 premium cálida, superficies carbón/grafito y acento oliva; serif editorial para títulos y sans para UI; tema inicial del sistema con override manual recordado; primitivas Base UI bajo wrappers estilo Shadcn; Dialog cierra con Escape y clic fuera; AlertDialog no cierra por clic fuera y Escape equivale a Cancelar; siete variantes Badge: default, secondary, outline, destructive, success, warning, info.

Los detalles adicionales siguientes conservan carácter **RECOMMENDATION** salvo esas decisiones explícitas. La aprobación del paquete no constituye aprobación final de esta spec funcional ni verificación de contraste.

### 2.1 Tema y tokens

- **Given** el usuario eligió claro u oscuro (por atributo/clase de tema en la raíz del documento), **when** navega o abre una superposición, **then** toda superficie, texto, borde, estado, foco, skeleton y overlay usa tokens semánticos del mismo tema; ninguna superficie cambia accidentalmente a tema claro dentro de un diálogo.
- **Given** no hay preferencia persistida de la aplicación, **then** la raíz usa la preferencia del sistema; una selección manual persistida por la aplicación tiene precedencia. El cambio no recarga la página ni pierde el foco o valores de formularios.
- **Then** `color-scheme` del navegador refleja el tema activo para controles nativos y scrollbars. La estrategia para inicializar tema y evitar flash/hidratación debe definirse en el plan compatible con Next.js actual.
- Los componentes consumen variables semánticas; Tailwind usa esas variables. No se autoriza introducir colores hex o escalas de paleta directamente en las variantes de los componentes, salvo tokens de ilustraciones fuera de esta base.

Paleta semántica **candidata** alineada con Base UI3. Los HEX siguientes son referencias visuales de tokens, no autorización para hard-codearlos en componentes. La conversión a variables CSS/OKLCH y los pares restantes se resolverán en el plan y la validación visual.

| Token                                                     | Claro (candidato)                      | Oscuro (candidato)                      | Uso                                     |
| --------------------------------------------------------- | -------------------------------------- | --------------------------------------- | --------------------------------------- |
| `background`                                              | `#EEEAE1`                              | `#171916`                               | Fondo de página                         |
| `card` / `popover`                                        | `#F9F7F1`                              | `#20221E`                               | Superficies                             |
| `foreground` / `card-foreground` / `popover-foreground`   | `#252720`                              | `#F0ECDF`                               | Texto principal                         |
| `muted-foreground`                                        | `#686960`                              | `#AAA99D`                               | Texto secundario                        |
| `primary`                                                 | `#52684E`                              | `#C1CA8C`                               | Acción/acento oliva                     |
| `primary-foreground`                                      | `#FFFDF7`                              | `#20221B`                               | Texto sobre primary                     |
| `border` / `input`                                        | `#858176`                              | `#73746A`                               | Límites de controles y superficies      |
| `secondary`, `muted`, `accent` y foregrounds              | Por definir con dirección cálida/oliva | Por definir con dirección grafito/oliva | Superficies y estados de énfasis        |
| `destructive`, `success`, `warning`, `info` y foregrounds | Por definir                            | Por definir                             | Semántica textual y cromática de estado |
| `ring` / `overlay`                                        | Por definir                            | Por definir                             | Foco y fondo modal                      |

**Contraste completo pendiente; ninguna combinación tiene PASS.** Verificar texto normal ≥4.5:1, texto grande ≥3:1 y componentes/estados visuales relevantes ≥3:1 contra colores adyacentes. Deben incluirse hover, active, disabled, invalid, badges, foco y overlays; registrar matriz de ratios y ajustar candidatos que fallen. La dirección visual confirmada no aprueba cada valor HEX. Evitar transparencia como único medio de indicar estado.

Tokens no cromáticos recomendados:

| Categoría        | Contrato recomendado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tipografía       | CONFIRMADO: serif editorial para títulos y sans para UI, siguiendo Base UI3. Familias exactas, carga y fallbacks por validar; no se considera Plus Jakarta Sans/Inter aprobada como elección final. Conservar stack monoespaciado del sistema para datos técnicos. Escala: `xs 12/16`, `sm 14/20`, `base 16/24`, `lg 18/28`, `xl 20/28`, `2xl 24/32`, `3xl 30/36` (tamaño/line-height en px); peso regular 400, medium 500, semibold 600. Definir suministro de fuentes en el plan sin asumir una dependencia remota. Revisar legibilidad móvil. |
| Radio            | `radius-sm 6px`, `radius-md 8px`, `radius-lg 12px`, `radius-xl 16px`; control por defecto md, card lg, diálogo xl; pill solo badge. Mantener radio derivado por tokens y no utilidades dispares.                                                                                                                                                                                                                                                                                                                                                 |
| Foco             | Indicador `:focus-visible` de dos capas recomendado: offset/superficie y ring semántico, mínimo 2px visible; contraste ≥3:1 frente a colores contiguos, sin ocultarlo por overflow. No mostrar ring de teclado al click de puntero si el navegador distingue `:focus-visible`.                                                                                                                                                                                                                                                                   |
| Movimiento       | Duración corta `120–180ms` para color/opacidad/transform; overlay/superposición hasta `200ms`; easing consistente. No animar layout por defecto. Con `prefers-reduced-motion: reduce`, quitar desplazamientos y pulsos no esenciales y reducir duración prácticamente a cero; skeleton mantiene señal estática legible sin animación.                                                                                                                                                                                                            |
| Espaciado/altura | Reusar escala Tailwind existente; controles interactivos objetivo visual mínimo 40px desktop y 44px móvil cuando el layout lo permita. Enlace/botón táctil no debe depender de icono diminuto.                                                                                                                                                                                                                                                                                                                                                   |

### 2.2 Contrato por componente

**Button**

- Variantes: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; tamaños `default`, `sm`, `lg`, `icon`. Default = acción primaria; secondary = acción alternativa; destructive = acción destructiva; no expresar éxito como botón verde en esta base.
- Estados: default, hover, active/pressed, focus-visible, disabled; loading se recomienda como patrón composable con indicador y texto accesible. Loading conserva tamaño, bloquea doble envío y expone `aria-busy`; icon-only requiere nombre accesible. Disabled no puede ser el único medio de explicar por qué una acción no está disponible.
- `asChild` se conserva solo si resulta necesario y se verifica que el elemento final tenga semántica interactiva correcta; no anidar controles interactivos.

**Input y Textarea**

- Estados: default, hover, focus-visible, disabled, readonly, invalid y autofill visible. Estilos de invalid combinan token `destructive`, texto explicativo y asociación `aria-describedby`; `aria-invalid=true` cuando aplica. Placeholder no sustituye Label.
- `Label` vinculado por `htmlFor`/`id`; ayuda y error accesibles por ID. Altura recomendada input 40px desktop / 44px touch, textarea mínimo 96px, redimensionamiento vertical configurable.
- No se agrega control `Form` ni validación de datos en este alcance.

**Card**

- Partes semánticas: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Card no interactiva por defecto, sin hover/cursor de botón. Para tarjetas clicables se debe usar enlace/botón semántico en spec/consumidor aparte.
- Fondo, borde, texto y elevación sutil provienen de tokens; card no debe depender de shadow para distinguirse. Slots admiten composición con contenido largo y layout móvil.

**Badge**

- Variantes: `default`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`. Apariencia no interactiva por defecto; no asignar `button` role ni estilos de foco a Badge informativo. Estados de producto deben tener etiqueta textual y no solo color/icono.
- Si se usa como filtro interactivo, se requiere un control Button separado con `aria-pressed`, fuera del contrato Badge.

**Skeleton**

- Decorativo y `aria-hidden=true`; un contenedor de carga proporciona `aria-busy=true` y texto/estado `role=status` anunciado una vez. Nunca reemplazar la estructura completa sin anunciar loading. No animar con reduced motion. Tokens semánticos distintos de placeholder de texto.

**DropdownMenu**

- Menú efímero asociado a botón disparador: abre con Enter/Espacio/click; Escape cierra y devuelve foco al disparador; flechas navegan elementos; Home/End saltan al primero/último; typeahead si lo proporciona la primitiva elegida. Cerrar al seleccionar acción que termina el menú; deshabilitados no se activan. Click/tap fuera cierra sin secuestrar foco.
- Exponer roles/relaciones de menú y estado expandido correctamente. No usarlo para navegación principal del sitio ni como sustituto automático de Select/listbox.

**Dialog**

- Modal por defecto: trigger abre; foco inicial dentro con estrategia documentada; Tab/Shift+Tab permanece dentro; Escape cierra (CONFIRMADO); al cerrar devuelve foco al trigger (o al siguiente destino lógico si trigger desapareció). Fondo inert/no interactuable y scroll de fondo bloqueado mientras abierto.
- Título accesible obligatorio; descripción asociada opcional; botón visible de cierre con nombre accesible si se ofrece cierre. CONFIRMADO: clic fuera cierra Dialog. No se añade una excepción ni política de cambios sin guardar; cualquier protección de formularios requiere contrato separado. En móvil, diálogo permanece dentro de viewport y botones no quedan bajo teclado/áreas seguras del navegador.

**AlertDialog**

- Confirmación modal para acción destructiva/importante; exige título, descripción que explica consecuencia, acción principal explícita y Cancel visible. CONFIRMADO: clic fuera no cierra. Escape equivale a Cancelar: cierra sin ejecutar la acción y devuelve el foco al disparador. Foco inicial en Cancelar recomendado para acción destructiva. La operación async/pending requiere contrato separado. Solo la acción explícita ejecuta callback, exactamente una vez.
- El nombre de acción incluye objeto/efecto cuando sea posible (p. ej. “Eliminar organización”), no un Confirmar ambiguo.

### 2.3 Acceso al tema

- **Given** componentes de cualquier grupo se ven en claro y oscuro, **then** texto, placeholders, iconos, bordes, focus ring, hover, disabled, invalid, destructive, overlays y skeletons tienen contraste y jerarquía adecuados en ambos temas.
- **Given** tema claro u oscuro y viewport 390×844 o 1280×800, **then** menús y diálogos caben en pantalla, se pueden operar por touch/teclado y no crean scroll horizontal accidental.
- El cambio de tema no se ofrece como nuevo componente en esta feature; sí debe existir un mecanismo/fixture documentado de prueba para fijar ambos modos.

## 3. Contratos afectados

- Sin contratos HTTP ni esquemas Zod; alcance de componentes web React.
- API pública propuesta: exports desde `src/components/ui/` para los diez componentes, props tipadas y variantes de clase. No congelar nombres de props avanzadas hasta planificar los wrappers.
- `components.json`, `src/app/globals.css` y configuración Tailwind son fuentes posibles del estándar; implementación debe respetar las versiones presentes y evitar upgrade de Next/React/Tailwind como parte incidental.
- Modo de tema: propuesta `data-theme="light|dark"` en raíz (o convención ya presente que se confirme en el plan), variables CSS semánticas y `color-scheme`. No combinar múltiples mecanismos independientes.
- **CONFIRMADO:** Base UI para primitivas de `DropdownMenu`, `Dialog` y `AlertDialog`, debajo de wrappers estilo Shadcn. Base UI3 es la dirección visual seleccionada, no un número de versión de la librería. Verificar APIs, versión y compatibilidad del stack en el plan; la dependencia Radix Slot existente no cambia esta decisión ni autoriza migraciones adicionales.

## 4. Criterios de aceptación y evidencia

Agregar evidencia de tema: sin override usa sistema; override manual prevalece y se restaura al recargar sin perder estado de controles al alternar tema.

Rutas de prueba sugeridas, aún no creadas. La spec aprobada definirá ubicación final según estructura vigente.

| ID     | Descripción verificable                                                                                                                                                                   | Prueba/evidencia propuesta                                   | Estado  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| AC-001 | Claro/oscuro asigna una sola familia coherente de tokens a body, inputs, tarjetas, menú, diálogo y overlay; no quedan colores de texto/superficie hard-coded en los componentes incluidos | Unit tokens + Playwright fixture por tema                    | NOT_RUN |
| AC-002 | Cada par foreground/background de texto cumple ratios AA acordados; estados de control relevantes cumplen 3:1 con adyacentes                                                              | Script de contraste sobre tabla de tokens + reporte de pares | NOT_RUN |
| AC-003 | Fuente, escala, pesos, radios, foco y movimiento coinciden con tokens; reduced motion elimina pulso/desplazamiento no esencial                                                            | Unit CSS contract + Playwright media emulation               | NOT_RUN |
| AC-004 | Button ofrece variantes/tamaños definidos y estados hover/pressed/focus/disabled/loading; icon-only tiene nombre accesible y disabled/loading no invoca acción                            | Unit + Playwright                                            | NOT_RUN |
| AC-005 | Label se asocia a Input/Textarea; error e invalid están asociados con `aria-describedby`/`aria-invalid`; placeholder no funciona como único label                                         | Playwright + axe-core (si la dependencia se aprueba)         | NOT_RUN |
| AC-006 | Card slots renderizan semánticamente y contenido largo fluye a 390px sin desborde; Card no se anuncia como control interactivo                                                            | Unit + Playwright responsive                                 | NOT_RUN |
| AC-007 | Badge comunica cada estado mediante texto y mantiene contraste en ambos temas; Badge informativo no aparece como control                                                                  | Unit + Playwright                                            | NOT_RUN |
| AC-008 | Skeleton se excluye del árbol accesible; padre anuncia carga una vez y marca busy; no pulsa con reduced motion                                                                            | Playwright accesibilidad + emulación de movimiento           | NOT_RUN |
| AC-009 | DropdownMenu satisface apertura, flechas, Home/End, typeahead según primitivas, Escape, selección, disabled, cierre externo y retorno de foco                                             | Playwright teclado/touch + revisión manual AT                | NOT_RUN |
| AC-010 | Dialog cumple nombre, descripción opcional, foco atrapado, cierre, retorno de foco, fondo no interactivo, scroll y viewport responsive; click overlay sigue regla aprobada                | Playwright + revisión manual con VoiceOver                   | NOT_RUN |
| AC-011 | AlertDialog requiere Cancelar y acción explícita; clic fuera no cierra; acción ejecuta callback una vez; foco y teclado cumplen contrato revisado de Base UI                              | Unit callback + Playwright + VoiceOver                       | NOT_RUN |
| AC-012 | Smoke page reúne variantes, estados, temas y tamaños de los diez componentes; ningún control truncado en 390×844 y 1280×800                                                               | Playwright screenshots + revisión visual aprobada            | NOT_RUN |
| AC-013 | axe sin violaciones críticas/serias atribuibles a la base en fixtures claro/oscuro; teclado cubre los flujos sin trampa fuera de modal intencional                                        | axe Playwright + teclado; revisión manual                    | NOT_RUN |

### Estrategia de prueba propuesta

- **Unitarias:** token mapping y ratios de contraste; render básico, atributos semánticos, props/variantes, composición de Card, reglas de loading de Button y callback explícito de AlertDialog. Las pruebas no sustituyen interacción real ni inspección visual.
- **Playwright:** catálogo/fixture local de showcase aislado; snapshots de comportamiento en 390×844 y 1280×800 y en ambos temas; flujos por teclado y pointer/touch; `prefers-reduced-motion`; overlays, focus return, scroll lock y callbacks. Visual snapshots se revisan y aprueban antes de actualizar baselines.
- **Accesibilidad automatizada:** axe-core propuesto para chequeos de WCAG automatizables; añadir dependencia solo si se aprueba. Exigir cero violaciones críticas/serias en fixture y justificar falsos positivos. Axe no certifica accesibilidad global.
- **Manual:** VoiceOver/Safari al menos para Input/invalid, DropdownMenu, Dialog y AlertDialog; verificar orden/nombre/estado/anuncios, retorno de foco, navegación táctil y tema. Registrar navegador/SO y resultado; requiere aprobación humana de UX por web.
- **Visual:** revisión de ambas variantes de tema en desktop y móvil web antes de implementar componentes; la aprobación visual es gate separado de aprobación funcional y no cubre plataformas nativas.

Las pruebas actuales y todos estos AC están **NOT_RUN**. No declarar PASS con documentación o revisión de código sola. La ejecución será después de spec aprobada y artefacto visual revisable.

## 5. Fuera de alcance

- Expo/React Native nativo; tema y primitives móviles.
- CCentral, migración de pantallas, servicios externos o distribución compartida. Método de distribución se decide durante piloto posterior de CCentral.
- Copiar todos los componentes del catálogo oficial, implementar sistema de formularios, navegación, tabla/grid, toasts/notificaciones, charts, date picker o aplicación de temas por tenant.
- Rebranding completo, diseño de páginas de producto, variaciones ilimitadas por aplicación, personalización de usuario avanzada o editor de tokens.
- Cambios de framework/versión mayores, diseño de API de backend o despliegue/release.

## 6. Revisión y gate

Las preguntas de dirección visual, primitivas, tema, cierre de Dialog/AlertDialog y siete badges quedaron resueltas por la confirmación del usuario; no se vuelven a pedir.

Validación restante antes de implementación:

1. Completar y medir matriz de contraste de la paleta candidata y todos los estados; ajustar pares que fallen.
2. Validar familias serif/sans, carga/fallback, legibilidad, radios, foco y movimiento contra la dirección visual Base UI3.
3. Confirmar compatibilidad y API de Base UI en el stack, incluida interacción/foco/teclado de los wrappers; comprobar el contrato confirmado de Escape en AlertDialog.
4. Completar y obtener aprobación explícita del artefacto visual claro/oscuro en desktop/móvil web, conforme al alcance aprobado.

Veredicto de spec funcional: `APPROVED_BY_USER` el 2026-10-01 (conversación principal, solicitud «spec aprobada»). Las pruebas, ratios y validación AT permanecen `NOT_RUN`.

Gate: spec funcional aprobada → artefacto de diseño claro/oscuro para desktop/móvil web y aprobación visual → plan técnico aprobado → implementación TDD por AC → QA independiente y evidencia → solo después se evalúa adopción piloto en CCentral. Esta aprobación no autoriza implementación antes de cerrar los gates visual y técnico.

**Actualización de ejecución (2026-10-02):** los `NOT_RUN` anteriores describen la línea base al aprobar esta spec. Los resultados posteriores, límites y gates pendientes están en [verification.md](../artifacts/results/FEAT-002/verification.md); no cambian los criterios aprobados.
