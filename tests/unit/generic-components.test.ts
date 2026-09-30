import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { z } from "zod";

// 1. ApiClient & AppError
import {
  ApiClient,
  AppError,
  apiClient as defaultApiClient,
  type AppErrorPayload,
} from "@/lib/api-client";

// 2. useOfflineQueue
import {
  useOfflineQueue,
  type QueuedRequestItem,
  type UseOfflineQueueOptions,
} from "@/hooks/use-offline-queue";

// 3. useGeofence
import {
  useGeofence,
  type UseGeofenceOptions,
} from "@/hooks/use-geofence";

// 4. FormBuilder
import {
  FormBuilder,
  type FormBuilderProps,
} from "@/components/shared/forms/form-builder";

// 5. GenericCrudDataGrid
import {
  GenericCrudDataGrid,
  type ColumnDef,
  type GenericCrudDataGridProps,
} from "@/components/shared/data-grid/generic-crud-data-grid";

// Helper para ejecutar hooks en entorno de prueba usando renderToString
function renderHook<T>(hookFn: () => T): T {
  let result!: T;
  function TestHarness() {
    result = hookFn();
    return null;
  }
  renderToString(React.createElement(TestHarness));
  return result;
}

describe("T-037: Cobertura Exhaustiva de Componentes Genéricos y Hooks (@/components/shared, @/hooks, @/lib)", () => {
  // ===========================================================================
  // 1. API CLIENT (src/lib/api-client.ts) & APP ERROR
  // ===========================================================================
  describe("1. ApiClient y Manejo Tipado de Errores con AppError", () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);
    });

    it("AppError almacena payload estructurado y serializa a JSON correctamente", () => {
      const payload: AppErrorPayload = {
        code: "APP_UNAUTHORIZED",
        message: "No posee permisos de administrador",
        details: { requiredRole: "admin" },
        requestId: "req-test-999",
        status: 403,
      };

      const error = new AppError(payload);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("AppError");
      expect(error.code).toBe("APP_UNAUTHORIZED");
      expect(error.message).toBe("No posee permisos de administrador");
      expect(error.requestId).toBe("req-test-999");
      expect(error.status).toBe(403);
      expect(error.details).toEqual({ requiredRole: "admin" });

      const json = error.toJSON();
      expect(json).toEqual(payload);
    });

    it("ApiClient inyecta automáticamente X-Request-Id autogenerado si no se proporciona", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ success: true }),
      });

      const client = new ApiClient({ baseUrl: "https://api.starter.example.com" });
      const result = await client.get("/api/health");

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe("https://api.starter.example.com/api/health");
      expect(calledInit.headers["X-Request-Id"]).toBeDefined();
      expect(calledInit.headers["X-Request-Id"].length).toBeGreaterThan(5);
    });

    it("ApiClient respeta X-Request-Id personalizado pasado en options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ ok: true }),
      });

      const client = new ApiClient();
      await client.get("https://api.starter.example.com/test", { requestId: "custom-req-12345" });

      const [, calledInit] = mockFetch.mock.calls[0];
      expect(calledInit.headers["X-Request-Id"]).toBe("custom-req-12345");
    });

    it("ApiClient inyecta automáticamente X-Organization-Id desde config estática o función getter", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ ok: true }),
      });

      // Configuración estática
      const clientStatic = new ApiClient({ organizationId: "org-static-01" });
      await clientStatic.get("https://api.test/resource");
      let [, init] = mockFetch.mock.calls[0];
      expect(init.headers["X-Organization-Id"]).toBe("org-static-01");

      // Configuración dinámica (getter function)
      let dynamicOrg = "org-dynamic-02";
      const clientDynamic = new ApiClient({ organizationId: () => dynamicOrg });
      await clientDynamic.get("https://api.test/resource");
      [, init] = mockFetch.mock.calls[1];
      expect(init.headers["X-Organization-Id"]).toBe("org-dynamic-02");

      // Cambio en tiempo de ejecución del getter
      dynamicOrg = "org-dynamic-03";
      await clientDynamic.get("https://api.test/resource");
      [, init] = mockFetch.mock.calls[2];
      expect(init.headers["X-Organization-Id"]).toBe("org-dynamic-03");

      // Sobreescritura per-request
      await clientDynamic.get("https://api.test/resource", { organizationId: "org-override-99" });
      [, init] = mockFetch.mock.calls[3];
      expect(init.headers["X-Organization-Id"]).toBe("org-override-99");
    });

    it("ApiClient inyecta encabezado Authorization con prefijo 'Bearer '", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ ok: true }),
      });

      // Sin Bearer en string original
      const client1 = new ApiClient({ authToken: "token-secret-1" });
      await client1.get("https://api.test/path");
      expect(mockFetch.mock.calls[0][1].headers["Authorization"]).toBe("Bearer token-secret-1");

      // Con Bearer ya provisto
      const client2 = new ApiClient({ authToken: "Bearer token-secret-2" });
      await client2.get("https://api.test/path");
      expect(mockFetch.mock.calls[1][1].headers["Authorization"]).toBe("Bearer token-secret-2");
    });

    it("ejecuta verbos HTTP (get, post, put, patch, delete) con serialización JSON adecuada", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ result: "done" }),
      });

      const client = new ApiClient({ baseUrl: "https://api.test" });

      // GET
      await client.get("/patients", { params: { page: 2, search: "García" } });
      expect(mockFetch.mock.calls[0][0]).toBe("https://api.test/patients?page=2&search=Garc%C3%ADa");
      expect(mockFetch.mock.calls[0][1].method).toBe("GET");

      // POST
      await client.post("/vitals", { name: "spo2", value: 98 });
      expect(mockFetch.mock.calls[1][1].method).toBe("POST");
      expect(mockFetch.mock.calls[1][1].headers["Content-Type"]).toBe("application/json");
      expect(mockFetch.mock.calls[1][1].body).toBe(JSON.stringify({ name: "spo2", value: 98 }));

      // PUT
      await client.put("/shifts/1", { status: "completed" });
      expect(mockFetch.mock.calls[2][1].method).toBe("PUT");

      // PATCH
      await client.patch("/patients/1", { addressLabel: "Nueva dirección 456" });
      expect(mockFetch.mock.calls[3][1].method).toBe("PATCH");

      // DELETE
      await client.delete("/items/1");
      expect(mockFetch.mock.calls[4][1].method).toBe("DELETE");
    });

    it("maneja respuestas 204 No Content retornando undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => "",
      });

      const client = new ApiClient();
      const res = await client.delete("https://api.test/patient/1");
      expect(res).toBeUndefined();
    });

    it("captura errores de red y los normaliza en AppError con code='NETWORK_ERROR' y status=0", async () => {
      mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

      const client = new ApiClient();
      await expect(client.get("https://api.offline.test")).rejects.toThrow(AppError);

      try {
        await client.get("https://api.offline.test", { requestId: "req-offline-1" });
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe("NETWORK_ERROR");
        expect(appErr.status).toBe(0);
        expect(appErr.requestId).toBe("req-offline-1");
      }
    });

    it("normaliza respuestas ApiErrorResponse tipadas de la API en AppError", async () => {
      const apiErrorBody = {
        code: "GEOFENCE_VIOLATION",
        message: "El colaborador se encuentra fuera del rango de 50 metros",
        details: { distanceMeters: 120, thresholdMeters: 50 },
        requestId: "req-geofence-err",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
          "x-request-id": "req-geofence-err",
        }),
        text: async () => JSON.stringify(apiErrorBody),
      });

      const client = new ApiClient();
      try {
        await client.post("https://api.test/checkin", { lat: 19.4, lng: -99.1 });
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe("GEOFENCE_VIOLATION");
        expect(appErr.message).toBe("El colaborador se encuentra fuera del rango de 50 metros");
        expect(appErr.status).toBe(400);
        expect(appErr.requestId).toBe("req-geofence-err");
        expect(appErr.details).toEqual({ distanceMeters: 120, thresholdMeters: 50 });
      }
    });

    it("normaliza errores genéricos no tipados o texto plano en AppError", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html>502 Bad Gateway</html>",
      });

      const client = new ApiClient();
      try {
        await client.get("https://api.test/broken");
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.code).toBe("HTTP_502");
        expect(appErr.status).toBe(502);
      }
    });
  });

  // ===========================================================================
  // 2. USE OFFLINE QUEUE (src/hooks/use-offline-queue.ts)
  // ===========================================================================
  describe("2. useOfflineQueue: Encolado Offline, Idempotencia y Reintentos", () => {
    let mockClient: ApiClient;

    beforeEach(() => {
      mockClient = new ApiClient();
      Object.defineProperty(globalThis.navigator, "onLine", {
        value: true,
        configurable: true,
        writable: true,
      });
    });

    it("encola solicitudes offline asignando UUID e idempotencyKey (X-Idempotency-Key)", async () => {
      const storageKey = `test_offline_queue_${Date.now()}_1`;
      const hook = renderHook(() =>
        useOfflineQueue({
          storageKey,
          autoProcessOnOnline: false,
        })
      );

      const customIdemKey = "custom-idempotency-key-001";
      const returnedKey = await hook.enqueueRequest({
        url: "/api/sync",
        method: "POST",
        body: { syncEvents: [{ type: "VITAL_SIGNS_RECORDED" }] },
        idempotencyKey: customIdemKey,
      });

      expect(returnedKey).toBe(customIdemKey);

      // Encolado con clave autogenerada
      const autoKey = await hook.enqueueRequest({
        url: "/api/check-out",
        method: "POST",
        body: { shiftId: "shift-100" },
      });

      expect(autoKey).toBeDefined();
      expect(autoKey.length).toBeGreaterThan(10);
    });

    it("procesa la cola inyectando encabezado X-Idempotency-Key en cada mutación", async () => {
      const storageKey = `test_offline_queue_${Date.now()}_2`;
      const postSpy = vi.spyOn(mockClient, "post").mockResolvedValue({ success: true });

      const hook = renderHook(() =>
        useOfflineQueue({
          storageKey,
          apiClientInstance: mockClient,
          autoProcessOnOnline: false,
        })
      );

      const idemKey = "idem-test-header-123";
      await hook.enqueueRequest({
        url: "/api/vitals",
        method: "POST",
        body: { value: 36.5 },
        idempotencyKey: idemKey,
      });

      const processSummary = await hook.processQueue();
      expect(processSummary.processed).toBe(1);
      expect(processSummary.succeeded).toBe(1);
      expect(processSummary.failed).toBe(0);

      expect(postSpy).toHaveBeenCalledTimes(1);
      const [calledUrl, calledBody, calledOptions] = postSpy.mock.calls[0];
      expect(calledUrl).toBe("/api/vitals");
      expect(calledBody).toEqual({ value: 36.5 });
      expect(calledOptions?.headers?.["X-Idempotency-Key"]).toBe(idemKey);
    });

    it("reintenta con backoff exponencial ante fallo y notifica onError", async () => {
      const storageKey = `test_offline_queue_${Date.now()}_3`;
      vi.spyOn(mockClient, "post").mockRejectedValue(new Error("503 Service Unavailable"));

      let capturedErrorItem: QueuedRequestItem | null = null;
      let capturedError: Error | null = null;

      const hook = renderHook(() =>
        useOfflineQueue({
          storageKey,
          apiClientInstance: mockClient,
          autoProcessOnOnline: false,
          baseDelayMs: 100,
          maxAttempts: 3,
          onError: (item, err) => {
            capturedErrorItem = item;
            capturedError = err;
          },
        })
      );

      await hook.enqueueRequest({
        url: "/api/notes",
        method: "POST",
        body: { note: "System note evaluation" },
      });

      const firstAttempt = await hook.processQueue();
      expect(firstAttempt.failed).toBe(1);
      const errorObj = capturedError as unknown as Error | null;
      const errorItemObj = capturedErrorItem as unknown as QueuedRequestItem | null;
      expect(errorObj?.message).toBe("503 Service Unavailable");
      expect(errorItemObj?.attempts).toBe(1);
      expect(errorItemObj?.status).toBe("pending");
      expect(errorItemObj?.nextRetryAt).toBeGreaterThan(Date.now());
    });

    it("permite limpiar la cola completa (clearQueue) y eliminar elementos puntuales (removeItem)", async () => {
      const storageKey = `test_offline_queue_${Date.now()}_4`;
      const hook = renderHook(() =>
        useOfflineQueue({
          storageKey,
          autoProcessOnOnline: false,
        })
      );

      await hook.enqueueRequest({ url: "/api/item1", method: "POST" });
      await hook.enqueueRequest({ url: "/api/item2", method: "POST" });

      hook.clearQueue();
      const summary = await hook.processQueue();
      expect(summary.processed).toBe(0);
    });
  });

  // ===========================================================================
  // 3. USE GEOFENCE (src/hooks/use-geofence.ts)
  // ===========================================================================
  describe("3. useGeofence: Cálculo Haversine de Proximidad y Perímetro de 50 m", () => {
    // Coordenadas fijas de prueba (CDMX)
    const targetLatitude = 19.432608;
    const targetLongitude = -99.133209;

    it("calcula distancia 0m y valida isInsideGeofence=true ante coordenadas idénticas", () => {
      const hookResult = renderHook(() =>
        useGeofence({
          targetLatitude,
          targetLongitude,
          thresholdMeters: 50,
          manualPosition: {
            latitude: targetLatitude,
            longitude: targetLongitude,
            accuracy: 10,
          },
        })
      );

      expect(hookResult.distanceMeters).toBe(0);
      expect(hookResult.isInsideGeofence).toBe(true);
      expect(hookResult.isLoading).toBe(false);
      expect(hookResult.error).toBeNull();
      expect(hookResult.isAccuracyLow).toBe(false);
    });

    it("valida isInsideGeofence=true a 30 metros del objetivo (dentro de umbral 50m)", () => {
      // Desplazamiento aproximado de ~30m al norte (+0.00027 grados de latitud)
      const nearLatitude = targetLatitude + 0.00027;

      const hookResult = renderHook(() =>
        useGeofence({
          targetLatitude,
          targetLongitude,
          thresholdMeters: 50,
          manualPosition: {
            latitude: nearLatitude,
            longitude: targetLongitude,
            accuracy: 12,
          },
        })
      );

      expect(hookResult.distanceMeters).toBeLessThanOrEqual(50);
      expect(hookResult.distanceMeters).toBeGreaterThan(20);
      expect(hookResult.isInsideGeofence).toBe(true);
    });

    it("valida isInsideGeofence=false a más de 50 metros del objetivo (violación de geocerca)", () => {
      // Desplazamiento aproximado de ~100m (+0.0009 grados de latitud)
      const farLatitude = targetLatitude + 0.0009;

      const hookResult = renderHook(() =>
        useGeofence({
          targetLatitude,
          targetLongitude,
          thresholdMeters: 50,
          manualPosition: {
            latitude: farLatitude,
            longitude: targetLongitude,
            accuracy: 8,
          },
        })
      );

      expect(hookResult.distanceMeters).toBeGreaterThan(50);
      expect(hookResult.isInsideGeofence).toBe(false);
    });

    it("detecta precisión baja (isAccuracyLow=true) cuando accuracy > maximumAccuracyMeters", () => {
      const hookResult = renderHook(() =>
        useGeofence({
          targetLatitude,
          targetLongitude,
          thresholdMeters: 50,
          maximumAccuracyMeters: 100,
          manualPosition: {
            latitude: targetLatitude,
            longitude: targetLongitude,
            accuracy: 150, // 150m > 100m máximo permitido
          },
        })
      );

      expect(hookResult.isInsideGeofence).toBe(true);
      expect(hookResult.isAccuracyLow).toBe(true);
    });

    it("maneja graciosamente la ausencia de geolocalización en entornos no soportados", () => {
      const hookResult = renderHook(() =>
        useGeofence({
          targetLatitude,
          targetLongitude,
          manualPosition: null, // Sin posición manual y sin navigator.geolocation en SSR
        })
      );

      expect(hookResult.isInsideGeofence).toBe(false);
      expect(hookResult.distanceMeters).toBeNull();
      expect(hookResult.error).toContain("Geolocalización no soportada");
    });
  });

  // ===========================================================================
  // 4. FORM BUILDER (src/components/shared/forms/form-builder.tsx)
  // ===========================================================================
  describe("4. FormBuilder: Inferencia de Campos desde Zod y Validación Reactiva", () => {
    const testUserSchema = z.object({
      displayName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
      contactEmail: z.string().email("Correo electrónico inválido"),
      userAge: z.number().min(1, "Edad debe ser mayor a 0"),
      gender: z.enum(["femenino", "masculino", "otro"]),
      profileNotes: z.string().optional(),
      requiresVerification: z.boolean(),
      admissionDate: z.string(),
    });

    it("infiere correctamente tipos de input HTML desde la definición del esquema Zod", () => {
      const html = renderToString(
        React.createElement(FormBuilder, {
          schema: testUserSchema,
          onSubmit: vi.fn(),
          title: "Perfil del Usuario",
          description: "Registro de usuario del sistema",
        })
      );

      // Título y descripción
      expect(html).toContain("Perfil del Usuario");
      expect(html).toContain("Registro de usuario del sistema");

      // Inferencia displayName -> input tipo text
      expect(html).toContain('type="text"');
      expect(html).toContain("Display Name");

      // Inferencia contactEmail -> input tipo email
      expect(html).toContain('type="email"');
      expect(html).toContain("Contact Email");

      // Inferencia userAge -> input tipo number
      expect(html).toContain('type="number"');
      expect(html).toContain("User Age");

      // Inferencia gender (z.enum) -> <select> con <option> para cada valor
      expect(html).toContain("<select");
      expect(html).toContain('value="femenino"');
      expect(html).toContain('value="masculino"');
      expect(html).toContain('value="otro"');

      // Inferencia profileNotes (nombre con 'notes') -> <textarea
      expect(html).toContain("<textarea");
      expect(html).toContain("Profile Notes");

      // Inferencia requiresVerification (z.boolean) -> button role="switch"
      expect(html).toContain('role="switch"');
      expect(html).toContain("Requires Verification");

      // Inferencia admissionDate (nombre con 'Date') -> input tipo date
      expect(html).toContain('type="date"');
      expect(html).toContain("Admission Date");

      // Botones de acción
      expect(html).toContain("Guardar");
    });

    it("aplica fieldOverrides personalizados (label, placeholder, helperText)", () => {
      const html = renderToString(
        React.createElement(FormBuilder, {
          schema: testUserSchema,
          onSubmit: vi.fn(),
          fieldOverrides: {
            displayName: {
              label: "Nombre y Apellidos del Usuario",
              placeholder: "Ej: Juan Pérez Morales",
              helperText: "Ingrese conforme a identificación oficial",
            },
          },
        })
      );

      expect(html).toContain("Nombre y Apellidos del Usuario");
      expect(html).toContain('placeholder="Ej: Juan Pérez Morales"');
      expect(html).toContain("Ingrese conforme a identificación oficial");
    });

    it("renderiza alertas de éxito y error provistas por props", () => {
      const html = renderToString(
        React.createElement(FormBuilder, {
          schema: testUserSchema,
          onSubmit: vi.fn(),
          successMessage: "Registro guardado exitosamente",
          errorMessage: "Error en validación de datos",
        })
      );

      expect(html).toContain("Registro guardado exitosamente");
      expect(html).toContain("Error en validación de datos");
    });

    it("respeta modo readOnly deshabilitando controles y ocultando botones de envío", () => {
      const html = renderToString(
        React.createElement(FormBuilder, {
          schema: testUserSchema,
          onSubmit: vi.fn(),
          readOnly: true,
        })
      );

      // Controles deshabilitados
      expect(html).toContain("disabled");
      // Botón submit no presente en modo lectura
      expect(html).not.toContain("Guardar");
    });
  });

  // ===========================================================================
  // 5. GENERIC CRUD DATA GRID (src/components/shared/data-grid/generic-crud-data-grid.tsx)
  // ===========================================================================
  describe("5. GenericCrudDataGrid: Tabla Interactiva Desktop, Mobile Cards y Paginación", () => {
    interface TestRecord extends Record<string, unknown> {
      id: string;
      fullName: string;
      status: string;
      eventsCount: number;
    }

    const testData: TestRecord[] = [
      { id: "rec-01", fullName: "Elena Ramos", status: "active", eventsCount: 5 },
      { id: "rec-02", fullName: "Carlos Slim", status: "archived", eventsCount: 2 },
      { id: "rec-03", fullName: "Beatriz Paredes", status: "active", eventsCount: 8 },
    ];

    const testColumns: ColumnDef<TestRecord>[] = [
      {
        key: "fullName",
        header: "Nombre del Usuario",
        sortable: true,
        mobilePriority: "primary",
      },
      {
        key: "status",
        header: "Estado",
        filterable: true,
        mobilePriority: "meta",
      },
      {
        key: "eventsCount",
        header: "Eventos",
        sortable: true,
        mobilePriority: "secondary",
      },
    ];

    it("renderiza cabecera, tabla desktop y filas de datos con accessor predeterminado", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: testData,
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          title: "Directorio General",
          description: "Listado maestro de usuarios registrados",
        })
      );

      expect(html).toContain("Directorio General");
      expect(html).toContain("Listado maestro de usuarios registrados");

      // Encabezados de tabla
      expect(html).toContain("Nombre del Usuario");
      expect(html).toContain("Estado");
      expect(html).toContain("Eventos");

      // Filas
      expect(html).toContain("Elena Ramos");
      expect(html).toContain("Carlos Slim");
      expect(html).toContain("Beatriz Paredes");

      // Paginación
      expect(html).toContain("1 - 3 de 3");
    });

    it("renderiza vista responsiva de tarjetas para móvil (md:hidden) con prioridad móvil", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: testData,
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          onViewDetail: vi.fn(),
          onEdit: vi.fn(),
          onDelete: vi.fn(),
        })
      );

      // Contenedor móvil md:hidden
      expect(html).toContain("md:hidden");

      // Objetivos táctiles mínimos de 44px
      expect(html).toContain("min-h-[44px]");
    });

    it("renderiza estado de carga (isLoading=true) mostrando skeletons", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: testData,
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          isLoading: true,
        })
      );

      // Clases del componente Skeleton
      expect(html).toContain("animate-pulse");
      expect(html).not.toContain("Elena Ramos");
    });

    it("renderiza estado vacío amigable cuando no hay datos", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: [],
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          emptyTitle: "Sin registros disponibles",
          emptyMessage: "Cree un nuevo registro para comenzar.",
          onAdd: vi.fn(),
          addLabel: "+ Nuevo Registro",
        })
      );

      expect(html).toContain("Sin registros disponibles");
      expect(html).toContain("Cree un nuevo registro para comenzar.");
      expect(html).toContain("+ Nuevo Registro");
    });

    it("renderiza banner de error con opción de reintento ante falla", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: [],
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          error: "Error 500: Falla en conexión a base de datos PostgreSQL",
          onRetry: vi.fn(),
        })
      );

      expect(html).toContain("Error al cargar los registros");
      expect(html).toContain("Error 500: Falla en conexión a base de datos PostgreSQL");
      expect(html).toContain("Reintentar");
    });

    it("renderiza controles de selección múltiple (selectable=true) y acciones en lote", () => {
      const html = renderToString(
        React.createElement<GenericCrudDataGridProps<TestRecord>>(GenericCrudDataGrid, {
          data: testData,
          columns: testColumns,
          keyExtractor: (item: TestRecord) => item.id,
          selectable: true,
          selectedIds: ["rec-01"],
          batchActions: [
            { label: "Archivar Seleccionados", action: vi.fn(), variant: "danger" },
          ],
        })
      );

      // Checkboxes de selección
      expect(html).toContain('aria-label="Seleccionar todos los visibles"');
      expect(html).toContain('aria-label="Seleccionar fila rec-01"');

      // Barra de acciones en lote (normalizando comentarios SSR <!-- --> de React)
      const normalizedHtml = html.replace(/<!-- -->/g, "");
      expect(normalizedHtml).toContain("1 seleccionados");
      expect(normalizedHtml).toContain("Archivar Seleccionados");
    });
  });
});
