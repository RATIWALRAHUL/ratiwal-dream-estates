import { z, ZodError } from "zod";
import { ValidationError } from "@/lib/api/errors";
import { formatZodFieldErrors } from "@/lib/api/response";

/**
 * Parses and validates a JSON request body against a Zod schema.
 * Throws a typed ValidationError on failure.
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    throw new ValidationError("Invalid or malformed JSON in request body.", undefined, error);
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const fields = formatZodFieldErrors(result.error);
    throw new ValidationError("The submitted information is invalid.", fields, result.error);
  }

  return result.data;
}

/**
 * Parses and validates URL query parameters against a Zod schema.
 * Throws a typed ValidationError on failure.
 */
export function validateQueryParams<T>(
  target: Request | URL | string,
  schema: z.ZodType<T>
): T {
  let searchParams: URLSearchParams;

  if (target instanceof Request) {
    const url = new URL(target.url);
    searchParams = url.searchParams;
  } else if (target instanceof URL) {
    searchParams = target.searchParams;
  } else {
    const url = new URL(target, "http://localhost");
    searchParams = url.searchParams;
  }

  const paramsObject: Record<string, string | string[]> = {};
  for (const [key, value] of searchParams.entries()) {
    const all = searchParams.getAll(key);
    paramsObject[key] = all.length > 1 ? all : value;
  }

  const result = schema.safeParse(paramsObject);

  if (!result.success) {
    const fields = formatZodFieldErrors(result.error as ZodError);
    throw new ValidationError("Invalid query parameters provided.", fields, result.error);
  }

  return result.data;
}
