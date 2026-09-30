import { roleSchema, type Role } from "@starter/contracts";
import { ApiHttpError } from "./errors";

export type RequestContext = {
  organizationId: string;
  userId: string;
  role: Role;
  requestId: string;
};

export function getRequestContext(request: Request, defaultOrgId?: string): RequestContext {
  const url = new URL(request.url, "http://localhost");
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Multi-tenant resolution:
  // 1. Header 'x-organization-id'
  // 2. Query param 'organizationId'
  // 3. Optional fallback
  // 4. Default 'org-demo-001'
  const organizationId =
    request.headers.get("x-organization-id") ??
    url.searchParams.get("organizationId") ??
    defaultOrgId ??
    "org-demo-001";

  const userId =
    request.headers.get("x-user-id") ?? url.searchParams.get("userId") ?? "user-demo-001";

  const rawRole =
    request.headers.get("x-user-role") ??
    request.headers.get("x-role") ??
    url.searchParams.get("role") ??
    "member";

  const roleResult = roleSchema.safeParse(rawRole);
  const role: Role = roleResult.success ? roleResult.data : "member";

  return {
    organizationId,
    userId,
    role,
    requestId,
  };
}

export function assertOrganizationAccess(context: RequestContext, resourceOrgId: string): void {
  // admin_global is granted cross-tenant operational permissions
  if (context.role === "admin_global") {
    return;
  }

  if (context.organizationId !== resourceOrgId) {
    throw new ApiHttpError(
      403,
      "CROSS_ORG_ACCESS_DENIED",
      `Access denied: resource belongs to organization '${resourceOrgId}', but caller is authenticated for '${context.organizationId}'`
    );
  }
}
