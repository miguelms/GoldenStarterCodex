# Product Requirements Document (PRD) — Base Golden Starter V2

> Documento canónico de requisitos del Golden Starter V2. Esta base define el esqueleto sobre el cual se instanciará la nueva aplicación.

## 1. Visión y Propósito del Starter

Proporcionar una plantilla de inicio lista para producción (Golden Starter) que elimine la fricción de configuración inicial en nuevas aplicaciones web y móviles, garantizando desde el día 1:
- Aislamiento multi-tenant por organización.
- Sincronización offline tolerante a fallos de red.
- Contratos tipados de extremo a extremo compartidos entre Web y Mobile.
- Un equipo autónomo de 17 agentes de IA especializados bajo metodología Spec-Driven Development (SDD).

## 2. Capacidades de la Plataforma Base

1. **Gestión de Cuentas y Organizaciones:**
   - Multi-tenant estricto con jerarquía Organizaciones -> Usuarios -> Roles (`admin_global`, `org_admin`, `manager`, `member`, `viewer`).
   - Autenticación segura mediante Better-Auth sobre PostgreSQL 18.
2. **Registro y Seguridad de Dispositivos:**
   - Registro de huellas digitales de dispositivos (`deviceFingerprint`).
   - Revocación administrativa de acceso: dispositivos revocados quedan en cuarentena inmediata.
3. **Cola de Sincronización Offline (Outbox):**
   - Soporte para operar sin conexión a internet en clientes móviles y web.
   - Sincronización idempotente con deduplicación por UUIDv4 en servidor.
4. **Almacenamiento de Archivos Híbrido:**
   - Abstracción unificada para almacenamiento local en disco (desarrollo) o AWS S3 (producción).
5. **Auditoría Append-Only:**
   - Registro inmutable de eventos administrativos y de seguridad con trazabilidad completa.

## 3. Próximo Paso: Definición de la Nueva Aplicación

Este Golden Starter V2 está preparado para incorporar los requisitos específicos del nuevo producto (módulos, entidades de negocio, pantallas y flujos operativos) en este documento y en especificaciones atómicas bajo `specs/`.
