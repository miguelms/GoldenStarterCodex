# FEAT-002 — revisión visual Base UI3

Capturas del fixture local `?view=ui3` con la paleta candidata cálida/oliva/grafito. Son una propuesta de diseño para GoldenStarterCodex web; los menús y diálogos de esta página son muestras visuales.

| Viewport         | Claro                            | Oscuro                          |
| ---------------- | -------------------------------- | ------------------------------- |
| Desktop 1280×800 | [Captura](ui3-desktop-light.png) | [Captura](ui3-desktop-dark.png) |
| Móvil 390×844    | [Captura](ui3-mobile-light.png)  | [Captura](ui3-mobile-dark.png)  |
| Estrecho 320×700 | [Captura](ui3-narrow-light.png)  | [Captura](ui3-narrow-dark.png)  |

Los estados de capa muestran el scrim y el borde del modal sobre la página. Son maquetas estáticas: la política de cierre y foco se probará con Base UI al implementar.

| Estado      | Claro desktop                                | Oscuro desktop                              | Claro móvil                                 | Oscuro móvil                               |
| ----------- | -------------------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| Dialog      | [Captura](ui3-desktop-light-dialog.png)      | [Captura](ui3-desktop-dark-dialog.png)      | [Captura](ui3-mobile-light-dialog.png)      | [Captura](ui3-mobile-dark-dialog.png)      |
| AlertDialog | [Captura](ui3-desktop-light-alertdialog.png) | [Captura](ui3-desktop-dark-alertdialog.png) | [Captura](ui3-mobile-light-alertdialog.png) | [Captura](ui3-mobile-dark-alertdialog.png) |

El [manifiesto](manifest.json) registra Chromium 153, la URL local y las medidas de cada captura. En los seis estados base, el ancho del documento coincidió con el viewport. No se detectó texto visible menor de 12px; los botones, campos y enlaces de las dos vistas móviles midieron al menos 44px en ambas dimensiones. Con `prefers-reduced-motion: reduce`, las duraciones calculadas de animación y transición fueron `0.00001s`. Los modales de propuesta caben completos en 1280×800 y 390×844.

La [matriz de contraste](../contrast-matrix.md) calcula los pares de tokens de la propuesta. La accesibilidad e interacción de los componentes productivos se verificarán durante la implementación TDD; estas capturas no prueban foco de teclado, VoiceOver ni el comportamiento de Base UI.
