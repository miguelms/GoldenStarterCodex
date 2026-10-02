# FEAT-002 — evidencia RED

Fecha: 2026-10-01 (America/Tijuana). Comando: `npx vitest run tests/unit/ui-foundation.test.ts`.

Resultado antes de modificar componentes de producción: **1 test PASS, 3 FAIL** (salida de Vitest 5.0.3, exit code 1).

| Criterio                      | Falla observada                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Button ocupado, AC-004        | `loading=true` llegó como atributo DOM no booleano; faltaban `aria-busy="true"` y `disabled`.                               |
| Tokens semánticos, AC-001/007 | Las variantes renderizaban clases directas como `ring-slate-950`, `bg-slate-900` y `text-slate-50`.                         |
| Tema y movimiento, AC-001/003 | `src/app/globals.css` no definía `--background`, `--foreground`, `--ring` ni reglas para tema oscuro y movimiento reducido. |

El test de asociación Label/Input y Skeleton decorativo pasó en la base anterior. Esta evidencia solo cubre el primer ciclo RED; los flujos de Base UI, tema, responsive y accesibilidad necesitan pruebas posteriores.

## Ciclos posteriores (2026-10-02)

- `AlertDialog` (histórico previo a la decisión final): el caso Playwright comprobó primero que Escape cerraba con el comportamiento por defecto de Base UI (RED); el wrapper canceló temporalmente `escape-key` y `outside-press`, y la suite volvió a verde bajo aquella interpretación conservadora.
- Clarificación posterior de AlertDialog (2026-10-02): el usuario confirmó «Escape equivale a Cancelar». La expectativa anterior de mantener abierto quedó RED frente al contrato aclarado; se retiró únicamente la cancelación de `escape-key`. La nueva prueba requiere cierre, cero callbacks destructivos y foco devuelto al trigger; `outside-press` continúa bloqueado.
- Tema del sistema: el caso en la app Next detectó que utilidades Tailwind `dark:` heredadas mantenían fondo claro bajo `data-theme="system"` y preferencia OS oscura (RED). Se amplió la variante `dark` para sistema oscuro y override manual; los 2 casos de tema pasaron.
- `Button asChild`: el caso de enlace ocupado/deshabilitado mostró que un handler del hijo aún podía ejecutarse (RED); el wrapper ahora bloquea navegación y callback, y la suite pasa.
- Los casos de teclado, responsive, axe y contraste se conservaron en verde tras el refactor. Resultado integral: 22 pruebas de fixture Base UI3, 2 de tema, 73 unitarias.
