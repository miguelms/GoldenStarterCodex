# Runbook: componer una aplicación con GoldenStarterCodex y GoldenStarterWebIA

Este runbook define cómo iniciar y actualizar una aplicación sin convertirla en un fork permanente de dos repositorios.

## Fuentes

- **GoldenStarterCodex**: gobernanza, agentes, subagents, skills, MCP, SDD/TDD, plantillas, gates y evidencia.
- **GoldenStarterWebIA**: stack web con IA, dependencias, componentes UI, backend, contratos, infraestructura y pruebas técnicas.

GoldenStarterAntigravity puede ocupar la posición de gobernanza para flujos Antigravity, pero sus agentes y configuración no se mezclan con `.codex/` ni con las skills de Codex.

## Crear una aplicación

1. Confirma las versiones publicadas de ambos repositorios.
2. Crea `.golden/composition.yaml`:

   ```yaml
   governance:
     repository: miguelms/GoldenStarterCodex
     version: 1.0.0
     mode: codex
   stack:
     repository: miguelms/GoldenStarterWebIA
     version: 3.0.0
     variant: web-ia
   ```

3. Genera `.golden/lock.yaml` con los commits exactos y checksums de ambas fuentes.
4. Instala la gobernanza en `.codex/`, `.agents/`, `AGENTS.md` y `SDD/`.
5. Instala el stack en `src/`, `apps/`, `backend-ai/`, `packages/`, configuración, dependencias y pruebas técnicas.
6. Ejecuta primero los checks de composición y después los gates técnicos del stack.
7. Redacta la spec de la aplicación en `specs/` y empieza el ciclo SDD/TDD.

Mientras no exista el compositor CLI, la composición inicial puede hacerse con una copia versionada de cada fuente y una revisión manual contra este contrato. Esa copia temporal debe conservar `.golden/lock.yaml` y no debe mezclar ownership.

## Ownership de archivos

GoldenStarterCodex posee agentes, skills, MCP, SDD/TDD, specs, planes y evidencia. GoldenStarterWebIA posee código, dependencias, UI, backend, infraestructura y pruebas técnicas. La aplicación posee dominio, branding, configuración de entorno y adaptaciones propias.

Si dos fuentes quieren modificar el mismo archivo, se detiene la actualización y se crea una decisión explícita. No se resuelve sobrescribiendo silenciosamente el archivo del consumidor.

## Actualizar gobernanza

1. Cambia únicamente `governance.repository` y su versión.
2. Revisa el diff de `.codex/`, `.agents/`, `AGENTS.md`, `SDD/` y templates.
3. Ejecuta los validadores de perfiles, skills, composición y formato.
4. Ejecuta nuevamente los gates SDD/TDD afectados.
5. Actualiza `governance.commit` en `lock.yaml` después de aprobar el diff.

## Actualizar el stack

1. Cambia únicamente `stack.repository`, `stack.version` o `stack.variant`.
2. Revisa dependencias, migraciones, componentes, APIs, configuración y lockfile.
3. Ejecuta typecheck, lint, unit, integración, Playwright, auditoría y build según el perfil técnico.
4. Revisa incompatibilidades de la aplicación y actualiza sus specs si cambia un contrato.
5. Actualiza `stack.commit` en `lock.yaml` después de aprobar el diff.

## CI y release

CI ejecuta gates abstractos de gobernanza y gates concretos del stack. GoldenStarterCodex publica versiones de gobernanza; GoldenStarterWebIA publica versiones técnicas. Una aplicación solo actualiza su lockfile después de que ambos releases estén publicados y compatibles.

## Evolución futura

El contrato permite añadir `GoldenStarterWebCore`, `GoldenStarterMobileCore` y `GoldenStarterMobileIA` como variantes de stack. La gobernanza Codex no cambia: solo se seleccionan otro repositorio y otro perfil técnico en `composition.yaml`.
