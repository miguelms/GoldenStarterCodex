# Golden Starter V3 — Suite de Componentes Genéricos y Hooks del Starter

Esta librería proporciona un conjunto de primitivas genéricas, reactivas y tipadas con TypeScript estricto para **Golden Starter V3**. Están diseñadas para desacoplar completamente el núcleo empresarial multi-tenant de la lógica de negocio específica de cualquier vertical, garantizando una experiencia visual moderna con Tailwind CSS 4 y Shadcn UI.

---

## 📦 Contenido del Módulo

| Recurso | Tipo | Ubicación | Descripción |
| :--- | :--- | :--- | :--- |
| `<GenericCrudDataGrid<T>>` | Componente | `src/components/shared/data-grid/` | Tabla desktop completa con ordenación, paginación, filtros y selección; conmutación responsiva automática a tarjetas móviles. |
| `<FormBuilder<T>>` | Componente | `src/components/shared/forms/` | Generador de formularios reactivos a partir de esquemas Zod (`z.ZodObject`), validación en tiempo real y bloqueo de submit si es inválido. |
| `<ResponsiveShell>` | Componente | `src/components/shared/layout/` | Shell de aplicación adaptativo con sidebar colapsable, drawer móvil, selector multi-tenant y perfil con roles RBAC. |
| `useOfflineQueue` | Hook | `src/hooks/use-offline-queue.ts` | Encolamiento de peticiones HTTP en pérdida de conexión, persistencia en localStorage/memoria y reintento con backoff exponencial y encabezado `X-Idempotency-Key`. |
| `useGeofence` | Hook | `src/hooks/use-geofence.ts` | Cálculo de proximidad geográfica en tiempo real mediante fórmula esférica Haversine, soporte para radio umbral y validación de precisión GPS. |
| `apiClient` / `AppError` | Cliente HTTP | `src/lib/api-client.ts` | Cliente universal con inyección automática de `X-Request-Id`, `X-Organization-Id` y `Authorization: Bearer`, normalizando errores estructurados en `AppError`. |

---

## 🚀 Guía Rápida de Uso y Ejemplos

### 1. `GenericCrudDataGrid<T>`: Tabla Desktop y Tarjetas Móviles

Renderiza una tabla con controles avanzados en pantallas grandes (`>= md`) y se transforma automáticamente en tarjetas táctiles fluidas en dispositivos móviles (`< md`).

```tsx
"use client";

import React, { useState } from "react";
import { GenericCrudDataGrid, type ColumnDef } from "@/components/shared";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "archived";
}

const COLUMNS: ColumnDef<UserRecord>[] = [
  {
    key: "name",
    header: "Nombre del Colaborador",
    sortable: true,
    mobilePriority: "primary",
  },
  {
    key: "email",
    header: "Correo Electrónico",
    sortable: true,
    mobilePriority: "secondary",
  },
  {
    key: "role",
    header: "Rol de Seguridad",
    filterable: true,
    filterOptions: [
      { label: "Admin Global", value: "admin_global" },
      { label: "Manager", value: "manager" },
      { label: "Miembro", value: "member" },
    ],
    mobilePriority: "meta",
  },
  {
    key: "status",
    header: "Estado",
    accessor: (row) => (
      <span className={row.status === "active" ? "text-emerald-600 font-bold" : "text-slate-400"}>
        {row.status.toUpperCase()}
      </span>
    ),
    mobilePriority: "meta",
  },
];

export function UsersDataGridExample() {
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: "u-1",
      name: "Laura Morales",
      email: "laura@example.com",
      role: "manager",
      status: "active",
    },
    {
      id: "u-2",
      name: "Carlos Fuentes",
      email: "carlos@example.com",
      role: "member",
      status: "active",
    },
  ]);

  return (
    <GenericCrudDataGrid<UserRecord>
      title="Catálogo de Colaboradores"
      description="Listado operativo centralizado de usuarios de la organización"
      data={users}
      columns={COLUMNS}
      keyExtractor={(user) => user.id}
      selectable
      onAdd={() => alert("Abrir formulario de creación")}
      onEdit={(user) => alert(`Editar usuario: ${user.name}`)}
      onDelete={(user) => alert(`Archivar lógicamente: ${user.name}`)}
      onViewDetail={(user) => alert(`Ver detalle: ${user.name}`)}
      onExport={(data) => alert(`Exportando ${data.length} registros a CSV`)}
      batchActions={[
        {
          label: "Archivar seleccionados",
          variant: "danger",
          action: (selected) => alert(`Archivando ${selected.length} usuarios`),
        },
      ]}
    />
  );
}
```

---

### 2. `FormBuilder<T>`: Formulario Reactivo basado en Esquemas Zod

Genera campos automáticamente según el tipo inferido de Zod (`string`, `number`, `boolean`, `enum`, `date`, `email`, `password`, `textarea`), valida de forma reactiva en tiempo real y bloquea el botón de envío si el formulario tiene errores.

```tsx
"use client";

import React from "react";
import { z } from "zod";
import { FormBuilder } from "@/components/shared";

// Contrato formal Zod
const resourceFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  code: z.string().min(2, "Código de recurso requerido"),
  quantity: z.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  description: z.string().min(5, "Ingrese la descripción detallada"),
  category: z.enum(["hardware", "software", "servicio"]),
  isAvailable: z.boolean(),
  effectiveDate: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export function ResourceRegistrationExample() {
  const handleSubmit = async (data: ResourceFormValues) => {
    console.log("Recurso validado y listo para persistir:", data);
  };

  return (
    <FormBuilder<ResourceFormValues>
      schema={resourceFormSchema}
      title="Registro de Recurso Operativo"
      description="Formulario generado automáticamente a partir del contrato de datos Zod"
      onSubmit={handleSubmit}
      columns={2}
      fieldOverrides={{
        description: {
          type: "textarea",
          rows: 3,
          placeholder: "Descripción operativa del recurso...",
        },
        isAvailable: {
          label: "¿Disponible inmediatamente para asignación?",
          helperText: "Habilita la reserva en tiempo real si está marcado",
        },
      }}
    />
  );
}
```

---

### 3. `useOfflineQueue`: Resiliencia HTTP y Cola Fuera de Línea

Encola llamadas de mutación (`POST`, `PUT`, `PATCH`, `DELETE`) en almacenamiento local (`localStorage`) ante fallas de red o modo avión. Al reconectarse, reintenta automáticamente con backoff exponencial y el encabezado de deduplicación `X-Idempotency-Key`.

```tsx
"use client";

import React from "react";
import { useOfflineQueue } from "@/components/shared";

export function OfflineSyncMonitorExample() {
  const {
    isOnline,
    pendingCount,
    failedCount,
    isProcessing,
    enqueueRequest,
    processQueue,
  } = useOfflineQueue({
    storageKey: "starter_offline_queue_v1",
    baseDelayMs: 1000,
    maxAttempts: 5,
  });

  const handleSendEvent = async () => {
    await enqueueRequest({
      url: "/api/sync",
      method: "POST",
      body: {
        eventType: "field_event",
        metric: "operational_status",
        status: "completed",
      },
    });
  };

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">
          Estado de Red: {isOnline ? "🟢 Conectado" : "🟡 Fuera de Línea"}
        </span>
        <span className="text-xs text-slate-500">
          En cola: {pendingCount} | Fallidos: {failedCount}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSendEvent}
          className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Registrar Evento (Encolar)
        </button>
        <button
          type="button"
          onClick={() => processQueue()}
          disabled={isProcessing || !isOnline}
          className="px-3 py-2 border rounded-xl text-xs font-semibold disabled:opacity-50"
        >
          {isProcessing ? "Procesando..." : "Sincronizar Ahora"}
        </button>
      </div>
    </div>
  );
}
```

---

### 4. `useGeofence`: Cálculo Haversine de Proximidad en Tiempo Real

Calcula con precisión trigonométrica la distancia entre las coordenadas del dispositivo y una ubicación de referencia en campo. Comprueba si el usuario se encuentra dentro del radio permitido (ej. 50 metros).

```tsx
"use client";

import React from "react";
import { useGeofence } from "@/components/shared";

export function FieldCheckInGeofenceExample() {
  const TARGET_LOCATION = {
    latitude: 19.4326,
    longitude: -99.1332,
  };

  const { isInsideGeofence, distanceMeters, error, isLoading, refreshPosition } =
    useGeofence({
      targetLatitude: TARGET_LOCATION.latitude,
      targetLongitude: TARGET_LOCATION.longitude,
      thresholdMeters: 50,
    });

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-2">
      <h4 className="font-bold text-sm">Validación Perimetral de Visita (Geocerca 50m)</h4>
      {isLoading ? (
        <p className="text-xs text-slate-500">Obteniendo coordenadas GPS...</p>
      ) : error ? (
        <p className="text-xs text-red-600">Error GPS: {error}</p>
      ) : (
        <div className="text-xs space-y-1">
          <p>
            Distancia al objetivo: <strong className="tabular-nums">{distanceMeters} m</strong>
          </p>
          <p>
            Veredicto:{" "}
            {isInsideGeofence ? (
              <span className="text-emerald-600 font-bold">
                ✓ DENTRO DEL RADIO (Check-in Autorizado)
              </span>
            ) : (
              <span className="text-amber-600 font-bold">
                ⚠ FUERA DE RADIO (Requiere Justificación)
              </span>
            )}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={refreshPosition}
        className="px-3 py-1.5 border rounded-lg text-xs font-semibold"
      >
        Actualizar GPS
      </button>
    </div>
  );
}
```

---

### 5. `ResponsiveShell`: Layout Empresarial Adaptativo Multi-Tenant

Proporciona la estructura completa de aplicación con navegación lateral colapsable, drawer táctil para teléfonos, selector activo de organización y tarjeta de perfil de usuario.

```tsx
"use client";

import React, { useState } from "react";
import { ResponsiveShell } from "@/components/shared";

export function AppLayoutExample({ children }: { children: React.ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState("org-demo-001");

  return (
    <ResponsiveShell
      brandTitle="Golden Starter"
      brandSubtitle="Enterprise Monorepo Platform"
      currentOrganizationId={currentOrgId}
      onOrganizationChange={(newOrgId) => {
        console.log("Cambiando de tenant activo:", newOrgId);
        setCurrentOrgId(newOrgId);
      }}
      user={{
        name: "Admin Demo",
        email: "admin@starter.local",
        role: "admin_global",
      }}
      onLogout={() => alert("Cerrar sesión")}
    >
      {children}
    </ResponsiveShell>
  );
}
```

---

### 6. `apiClient` y `AppError`: Cliente HTTP Universal

Inyecta automáticamente `requestId`, `organizationId` y tokens de autorización, normalizando cualquier respuesta de error (4xx/5xx o falla de red) en una instancia estructurada de `AppError`.

```ts
import { apiClient, AppError } from "@/components/shared";

// Configurar contexto multi-tenant activo
apiClient.setOrganizationId("org-demo-001");
apiClient.setAuthToken("session-token");

async function fetchRecords() {
  try {
    const data = await apiClient.get<{ records: unknown[] }>("/api/records");
    return data.records;
  } catch (error) {
    if (error instanceof AppError) {
      console.error(`Error de API [${error.code}] (Status ${error.status}):`, error.message);
      console.error("Request ID correlacionado para soporte:", error.requestId);
    }
    throw error;
  }
}
```

---

## 🛡️ Principios de Diseño y Calidad

- **React 19 & Next.js 16 Directo:** Sin bibliotecas obsoletas ni APIs deprecadas.
- **Strict TypeScript:** Todos los genéricos (`<T>`, `<ColumnDef<T>>`, `<FormBuilder<T>>`) admiten inferencia estática sin pérdida de tipos.
- **Aislamiento Multi-Tenant:** Soporte nativo para propagación de `organizationId`.
- **Gobernanza y Auditoría:** Soporte para archivado lógico (`ARCHIVED`) y trazabilidad append-only.
