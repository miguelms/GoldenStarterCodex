# FEAT-002 — Safari, accesibilidad y zoom real

Fecha: 2026-10-02 (America/Tijuana). Fixture local: `http://127.0.0.1:3105/`.

## Resultado

| Comprobación    | Resultado    | Evidencia                                                                                                                                                                                                                                |
| --------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input inválido  | PARTIAL PASS | El árbol de accesibilidad de macOS/Safari expuso el campo con nombre `Correo` y el texto de error `Introduce un correo válido.`. La salida hablada no fue observable.                                                                    |
| DropdownMenu    | PARTIAL PASS | Safari expuso el disparador `Opciones` como `pop up button`; el comportamiento de teclado, opciones y retorno de foco pasó en Playwright Chromium. La apertura mediante automatización nativa de Safari no produjo un estado observable. |
| Dialog          | PARTIAL PASS | Safari expuso `Abrir diálogo` como `pop up button`; aislamiento modal, Escape y retorno de foco pasaron en Playwright Chromium. La salida hablada no fue observable.                                                                     |
| AlertDialog     | PARTIAL PASS | Safari expuso `Eliminar registro` como `pop up button`; Escape equivalente a Cancelar, clic fuera bloqueado y retorno de foco pasaron en Playwright Chromium. La salida hablada no fue observable.                                       |
| Zoom real 200 % | PASS         | Safari mostró `200%`. El texto largo envolvió, los controles permanecieron visibles y la página desplazó verticalmente sin recorte horizontal visible. Safari se restauró a `100%`.                                                      |

## Límite de la evidencia

La API de accesibilidad de macOS permite inspeccionar la semántica que Safari entrega a tecnologías asistivas, pero no permite escuchar ni transcribir la voz de VoiceOver. Por eso no se marca el anuncio audible como PASS. Este límite no invalida las pruebas automatizadas de teclado y foco; mantiene explícita la parte que la herramienta no puede observar.
