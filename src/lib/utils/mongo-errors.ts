/**
 * Ratiwal Dream Estates — MongoDB Error Normalization Utility
 * Extracts and clarifies MongoDB errors such as E11000 duplicate key violations.
 */

export interface NormalizedDuplicateError {
  isDuplicate: boolean;
  field?: string;
  value?: string;
  message: string;
}

/**
 * Checks if an error is a MongoDB duplicate key error (code 11000) and formats a clean message.
 */
export function normalizeMongoDuplicateError(error: unknown): NormalizedDuplicateError {
  if (
    error &&
    typeof error === "object" &&
    ("code" in error && (error as { code: number }).code === 11000)
  ) {
    const mongoError = error as { keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown>; message?: string };

    let field: string | undefined = undefined;
    let value: string | undefined = undefined;

    if (mongoError.keyValue && typeof mongoError.keyValue === "object") {
      const keys = Object.keys(mongoError.keyValue);
      if (keys.length > 0) {
        field = keys.join(" + ");
        value = String(mongoError.keyValue[keys[0]]);
      }
    } else if (mongoError.keyPattern && typeof mongoError.keyPattern === "object") {
      field = Object.keys(mongoError.keyPattern).join(" + ");
    }

    const fieldLabel = field ? `on "${field}"` : "";
    const valueLabel = value ? `with value "${value}"` : "";
    const message = `A record with the same unique identifier ${fieldLabel} ${valueLabel} already exists.`.replace(/\s+/g, " ");

    return {
      isDuplicate: true,
      field,
      value,
      message,
    };
  }

  return {
    isDuplicate: false,
    message: error instanceof Error ? error.message : "An unexpected database error occurred.",
  };
}
