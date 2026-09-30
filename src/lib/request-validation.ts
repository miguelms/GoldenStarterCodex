import { z } from "zod";
import { NextResponse } from "next/server";

export async function readJson<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.output<T> } | { success: false; response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { code: "INVALID_JSON_BODY", message: "Request body is not valid JSON", requestId: crypto.randomUUID() },
        { status: 400 }
      ),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Request payload failed schema validation",
          details: parsed.error.flatten(),
          requestId: crypto.randomUUID(),
        },
        { status: 422 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

export function readSearchParams<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): { success: true; data: z.output<T> } | { success: false; response: NextResponse } {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          code: "INVALID_QUERY_PARAMS",
          message: "Query parameters failed validation",
          details: parsed.error.flatten(),
          requestId: crypto.randomUUID(),
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}
