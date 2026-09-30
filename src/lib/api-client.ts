import { apiErrorResponseSchema, type ApiErrorResponse } from "@starter/contracts";

export interface AppErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
  status: number;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly requestId: string;
  public readonly status: number;

  constructor(payload: AppErrorPayload) {
    super(payload.message);
    this.name = "AppError";
    this.code = payload.code;
    this.details = payload.details;
    this.requestId = payload.requestId;
    this.status = payload.status;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): AppErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      requestId: this.requestId,
      status: this.status,
    };
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  organizationId?: string | (() => string | null | undefined);
  authToken?: string | (() => string | null | undefined);
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | null | undefined>;
  organizationId?: string | null;
  authToken?: string | null;
  requestId?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private organizationIdSource?: string | (() => string | null | undefined);
  private authTokenSource?: string | (() => string | null | undefined);
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl?.replace(/\/$/, "") ?? "";
    this.organizationIdSource = config.organizationId;
    this.authTokenSource = config.authToken;
    this.defaultHeaders = config.defaultHeaders ?? {};
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, "");
  }

  public setOrganizationId(orgId: string | null): void {
    this.organizationIdSource = orgId ?? undefined;
  }

  public setAuthToken(token: string | null): void {
    this.authTokenSource = token ?? undefined;
  }

  public getOrganizationId(): string | null {
    if (typeof this.organizationIdSource === "function") {
      return this.organizationIdSource() ?? null;
    }
    return this.organizationIdSource ?? null;
  }

  public getAuthToken(): string | null {
    if (typeof this.authTokenSource === "function") {
      return this.authTokenSource() ?? null;
    }
    return this.authTokenSource ?? null;
  }

  private resolveUrl(path: string, params?: RequestOptions["params"]): string {
    const isAbsolute = /^https?:\/\//i.test(path);
    let fullUrl = isAbsolute ? path : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
      }
    }

    return fullUrl;
  }

  public async request<T = unknown>(
    path: string,
    options: RequestOptions & { body?: unknown; method?: string } = {},
  ): Promise<T> {
    const {
      params,
      organizationId: customOrgId,
      authToken: customToken,
      requestId: customRequestId,
      headers: customHeaders = {},
      body,
      method = "GET",
      ...fetchOptions
    } = options;

    const requestId =
      customRequestId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    const organizationId = customOrgId !== undefined ? customOrgId : this.getOrganizationId();
    const token = customToken !== undefined ? customToken : this.getAuthToken();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
      "X-Request-Id": requestId,
    };

    const isAbsolute = /^https?:\/\//i.test(path);
    const isTargetSameOrigin = !this.baseUrl || !isAbsolute || path.startsWith(this.baseUrl);

    if (organizationId && (isTargetSameOrigin || customOrgId !== undefined)) {
      headers["X-Organization-Id"] = organizationId;
    }

    if (token && (isTargetSameOrigin || customToken !== undefined)) {
      headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (
        typeof body === "string" ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof URLSearchParams
      ) {
        requestBody = body as BodyInit;
      } else {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        requestBody = JSON.stringify(body);
      }
    }

    const url = this.resolveUrl(path, params);

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        body: requestBody,
      });
    } catch (networkError: unknown) {
      const message =
        networkError instanceof Error ? networkError.message : "Network request failed";
      throw new AppError({
        code: "NETWORK_ERROR",
        message: `Error connecting to ${url}: ${message}`,
        details: networkError,
        requestId,
        status: 0,
      });
    }

    const responseRequestId = response.headers.get("x-request-id") || requestId;

    if (!response.ok) {
      let errorData: unknown = null;
      let errorText = "";
      try {
        const text = await response.text();
        errorText = text;
        errorData = text ? JSON.parse(text) : null;
      } catch {
        errorData = null;
      }

      // Check if response conforms to ApiErrorResponse
      if (errorData && typeof errorData === "object") {
        const parsed = apiErrorResponseSchema.safeParse(errorData);
        if (parsed.success) {
          const apiError: ApiErrorResponse = parsed.data;
          throw new AppError({
            code: apiError.code,
            message: apiError.message,
            details: apiError.details,
            requestId: apiError.requestId || responseRequestId,
            status: response.status,
          });
        }

        // Generic JSON error object
        const rawObj = errorData as Record<string, unknown>;
        const code = typeof rawObj.code === "string" ? rawObj.code : `HTTP_${response.status}`;
        const message =
          typeof rawObj.message === "string"
            ? rawObj.message
            : typeof rawObj.error === "string"
              ? rawObj.error
              : response.statusText || "Request failed";
        throw new AppError({
          code,
          message,
          details: rawObj.details ?? rawObj,
          requestId: typeof rawObj.requestId === "string" ? rawObj.requestId : responseRequestId,
          status: response.status,
        });
      }

      // Plain text or empty error
      throw new AppError({
        code: `HTTP_${response.status}`,
        message:
          errorText || response.statusText || `Request failed with status ${response.status}`,
        requestId: responseRequestId,
        status: response.status,
      });
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await response.text();
      return (text ? JSON.parse(text) : null) as T;
    }

    // Default to text or unknown response
    const rawResult = await response.text();
    return rawResult as unknown as T;
  }

  public async get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public async put<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public async patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public async delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
