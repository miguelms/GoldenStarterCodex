import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@starter/contracts";

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  requestId: string = crypto.randomUUID(),
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      requestId,
    },
    { status },
  );
}

export function handleRouteError(
  error: unknown,
  requestId: string = crypto.randomUUID(),
): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiHttpError) {
    return createErrorResponse(error.status, error.code, error.message, error.details, requestId);
  }

  if (error instanceof ZodError) {
    return createErrorResponse(
      422,
      "VALIDATION_ERROR",
      "Request validation failed",
      error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      requestId,
    );
  }

  if (error instanceof Error) {
    // If the error message indicates an archived conflict
    if (error.message.includes("already archived")) {
      return createErrorResponse(409, "ALREADY_ARCHIVED", error.message, undefined, requestId);
    }
    // If missing reason or required fields
    if (
      error.message.includes("Archive reason is required") ||
      error.message.includes("archivedBy")
    ) {
      return createErrorResponse(422, "VALIDATION_ERROR", error.message, undefined, requestId);
    }
    return createErrorResponse(500, "INTERNAL_SERVER_ERROR", error.message, undefined, requestId);
  }

  return createErrorResponse(
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
    undefined,
    requestId,
  );
}
