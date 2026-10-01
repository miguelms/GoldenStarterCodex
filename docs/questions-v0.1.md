# Preguntas y Decisiones de Arquitectura — Golden Starter V3

Estado: Sesión live Q&A completada. Decisiones arquitectónicas, operativas y de seguridad aprobadas. Alcance de la plantilla en estado READY.

Estas preguntas y respuestas establecen los invariantes y reglas fundamentales implementadas en Golden Starter V3:

1. **¿Cómo se maneja la inmutabilidad de los registros y las correcciones posteriores?**
   - Ningún dato se borra una vez sincronizado en la base de datos principal. Las enmiendas o correcciones se realizan mediante adendas trazables tipo append-only.
   - Los timestamps técnicos del sistema (`createdAt`, `Now()`) son inmutables.
   - Los identificadores técnicos (`id`, `organizationId`, `actorUserId`, `clientEventId`, `deviceId`) son estrictamente inmutables.

2. **¿Cuál es el proveedor de autenticación y cómo opera el modelo multi-tenant?**
   - Se utiliza **Better Auth** con aislamiento multi-inquilino estricto (`organizationId` obligatorio en cada entidad y petición).
   - Existen organizaciones de prueba independientes (`org-demo-001`, `org-demo-002`, `org-demo-003`).
   - El rol `admin_global` cuenta con acceso global de supervisión; los demás roles operan aislados dentro de su respectivo tenant. Las pruebas rechazan con HTTP 403 cualquier acceso cruzado no autorizado.

3. **¿Cuál es la política de sincronización offline y manejo de dispositivos extraviados?**
   - La aplicación móvil almacena eventos en una cola outbox local cifrada por hardware (SQLCipher + Keystore/Secure Enclave).
   - Cada evento posee un `clientEventId` único que garantiza deduplicación e idempotencia total en reconexión.
   - Si un dispositivo es reportado como extraviado o revocado (`status = 'revoked'`), el backend canaliza los eventos pendientes a cuarentena (`review_required`) para auditoría y el cliente móvil purga sus credenciales locales.

4. **¿Cuál es el radio de geocerca y cómo se gestionan las excepciones?**
   - El radio estándar es de **50 metros**, configurable por organización.
   - Check-in a ≤ 50m es automático. A > 50m, la aplicación exige seleccionar una justificación tipificada dentro de un catálogo formal de excepciones operativas antes de asentar el evento.

5. **¿Qué matriz de validación y herramientas de prueba aseguran la calidad?**
   - **Unit / Integración:** Vitest con contratos TypeScript compartidos (`@starter/contracts`).
   - **Móvil E2E:** Maestro con flujos deterministas y simulador de red móvil adverso (`scripts/simulate-mobile-network.mjs`).
   - **Criterio de Validación:** Cero regresiones, tipado estricto (`tsc --noEmit`) y revisión de las instrucciones de agentes y skills aplicables.
