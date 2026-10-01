// =============================================================================
// Golden Starter V3 - Generic Shared Components & Hooks Library
// =============================================================================

// 1. Generic CRUD Data Grid (Desktop Table + Mobile Cards)
export {
  GenericCrudDataGrid,
  type ColumnDef,
  type BatchAction,
  type GenericCrudDataGridProps,
} from "./data-grid/generic-crud-data-grid";

// 2. Reactive Schema-Driven Form Builder (Zod-powered)
export {
  FormBuilder,
  type FieldConfig,
  type FieldOverride,
  type FormInputType,
  type FormBuilderProps,
} from "./forms/form-builder";

// 3. Adaptive Responsive Shell (Sidebar, Drawer, Multi-Tenant Header)
export {
  ResponsiveShell,
  type NavigationItem,
  type OrganizationOption,
  type UserProfileInfo,
  type ResponsiveShellProps,
} from "./layout/responsive-shell";

// 4. Offline Queue Hook (Exponential Backoff + X-Idempotency-Key)
export {
  useOfflineQueue,
  type QueuedRequestItem,
  type EnqueueRequestInput,
  type UseOfflineQueueOptions,
  type HttpMethod,
} from "@/hooks/use-offline-queue";

// 5. High-Precision Geofence Hook (Haversine Distance + Accuracy Threshold)
export {
  useGeofence,
  type GeofenceCurrentPosition,
  type UseGeofenceOptions,
  type UseGeofenceResult,
} from "@/hooks/use-geofence";

// 6. Generic Enterprise HTTP Client & AppError Normalizer
export {
  apiClient,
  ApiClient,
  AppError,
  type AppErrorPayload,
  type ApiClientConfig,
  type RequestOptions,
} from "@/lib/api-client";
