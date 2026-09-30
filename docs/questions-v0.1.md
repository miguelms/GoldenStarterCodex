# Preguntas para cerrar PRD v0.1

Estado: sesión live Q&A completada el 2026-09-20. Decisiones clínicas, operativas y legales aprobadas. Alcance de producto en estado READY.

Estas preguntas salen del refinamiento inicial del PRD. El agente de producto las resolvió en sesión live con el usuario; las decisiones quedan reflejadas en `PRD.md`, `docs/live-sessions/2026-09-20-product-qa.md` y tareas asociadas.

1. ¿En qué país/jurisdicción se probaría primero la solución y qué responsable clínico valida el formulario SOAPIE?
   En Mexico y la responsable clinica es la Jefa de Enfermeras

2. ¿Qué rol puede crear una adenda y qué campos pueden corregirse después de sincronizar?
   Solo el Admin y la Jefa de Enfermeras pueden crear Adendas.
   Ningún dato se "borra" o se "elimina" una vez registrado en la historia clínica. Sin embargo, si se comete un error, existen datos que pueden y deben corregirse o enmendarse mediante un registro complementario o de corrección. Con excepcion de los datos internos (como Date of birth of record) todos los datos pueden corregirse si no han pasado mas de 12hrs.
   Los timestamps técnicos generados por el sistema con `Now()` son inmutables y no pueden modificarse por ningún rol. `createdAt` representa el momento de creación del registro y `recordedAt` el momento clínico u operativo del evento. Los logs para process mining también son inmutables y append-only. `DOB` queda reservado para fecha de nacimiento y no se usará como timestamp.
   También son inmutables los identificadores técnicos (`id`, `organizationId`, `actorUserId`, `clientEventId`, `deviceId`) y la identidad del autor. Los datos clínicos y operativos sí pueden corregirse mediante adenda dentro de 12 horas.

3. ¿Cuál será el proveedor de autenticación para el piloto y se requiere una organización multi-tenant desde el primer corte?
   Usaremos Better Auth. Habrá tres organizaciones: cuidados de adultos mayores y neonatos sanos; hospital en casa; y atención a post-operados turistas médicos. Cada usuario pertenece a una organización y cada paciente, cuidadora, turno y registro tendrá `organizationId`. Existe un único Admin global con acceso a las tres organizaciones; el resto de usuarios solo puede acceder a los datos de su organización. Las pruebas deben rechazar cualquier acceso cruzado no autorizado.

4. ¿Qué signos vitales son obligatorios por tipo de plan y cuáles son sus rangos de validación?
   La configuración es por paciente y plan, según situación clínica, valoración inicial, petición expresa del cliente o receta médica. Temperatura, presión arterial y SpO₂ pueden ser obligatorios; glucosa y ritmo cardiaco son opcionales. La Jefa de Enfermeras o Coordinadora define qué signos aparecen, qué roles pueden capturarlos, los rangos y el escalamiento. La app solo muestra los campos autorizados. La enfermera ejecuta el plan y puede sugerir cambios a la Jefa, pero no modifica el plan. Cualquier signo fuera de rango puede notificar a la Jefa y/o Coordinador según el caso. El Admin global puede cambiar reglas clínicas; todo cambio queda auditado con usuario, fecha y versión.
   _Rangos basales por defecto aprobados para adultos:_ Temp 36.0–37.5 °C (alerta < 35.5 o > 37.5), PA Sistólica 90–120 mmHg (alerta < 90 o > 139), PA Diastólica 60–80 mmHg (alerta < 60 o > 89), SpO₂ 94–100% (alerta < 94%), Pulso 60–100 lpm (alerta < 50 o > 100), Glucosa 70–140 mg/dL (alerta < 70 o > 180).
   _Comportamiento:_ Por defecto opera en Opción B (alerta con justificación obligatoria en app antes de guardar y notificación a Jefa/Coordinador); a nivel de plan/organización es configurable para operar como Opción A (advertencia informativa sin bloqueo de guardado).

5. ¿El radio de geofence será 50, 75 o 100 metros y quién autoriza una excepción fuera de radio?
   50 metros esta bien, y podra ser configurable por el Admin

6. ¿Qué datos mínimos deben quedar disponibles offline y cuál es el comportamiento si el dispositivo se pierde?
   Quedan disponibles offline los menús, datos del cliente/paciente y el plan mínimo. Si se pierde el dispositivo, el Admin global puede revocar la sesión y el dispositivo, bloquear cualquier sincronización posterior y enviar los eventos pendientes a revisión antes de incorporarlos al expediente.

7. ¿Se requiere consentimiento explícito para ubicación y para almacenar notas, aunque el piloto use fixtures?
   si.

8. ¿Qué matriz mínima de dispositivos Android/iOS se usará en el development build?
   usaremos ipad y android generico

9. ¿Se elige Maestro o Detox para E2E nativo, o se difiere hasta que exista la primera pantalla móvil?
   Maestro

10. ¿Qué criterio permite declarar el golden validado y quién firma la promoción del starter?
    Cero regresiones visuales o de comportamiento: El resultado de la prueba actual coincide exactamente al 100% (o bajo un umbral de tolerancia de pixeles preestablecido si es UI) con el archivo de referencia original.Aprobación de la Suite E2E (Determinismo): En herramientas de pruebas móviles como Maestro, el flujo de pruebas (los archivos YAML) debe pasar de manera consistente y repetible en múltiples ejecuciones locales y en la nube sin presentar comportamiento errático (flakiness).Aislamiento de Entorno: El entorno donde se ejecuta el test ha sido limpiado y las dependencias simuladas (mocked) están aisladas para asegurar que los datos no se corrompan externamente.Cumplimiento de Criterios de Aceptación (AC): El flujo cumple de forma estricta con las especificaciones técnicas e historias de usuario definidas previamente por el negocio.

Con la conclusión de la sesión live (Turnos 1 a 12), las decisiones de rangos clínicos basales, política de retención legal de 5 años (NOM-004-SSA3-2012 / LFPDPPP) y adendas quedan formalmente aprobadas y el alcance de producto pasa a READY.

La sesión está registrada en [`docs/live-sessions/2026-09-20-product-qa.md`](live-sessions/2026-09-20-product-qa.md) y se actualizó `PRD.md`, `TASKS.md` y este documento.
