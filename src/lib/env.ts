import "server-only";
import { z } from "zod";

/**
 * Server Environment Validation Schema
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required. Please set it in your environment or .env.local")
    .refine(
      (uri) => uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"),
      {
        message: "MONGODB_URI must begin with 'mongodb://' or 'mongodb+srv://'",
      }
    ),
  MONGODB_DB_NAME: z
    .string()
    .min(1, "MONGODB_DB_NAME cannot be empty")
    .default("ratiwal_dream_estates"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
  IMAGEKIT_PUBLIC_KEY: z
    .string()
    .min(1, "IMAGEKIT_PUBLIC_KEY is required")
    .default("public_dzOgOjve3IxMrPVRKJcU4f9qHlY="),
  IMAGEKIT_PRIVATE_KEY: z
    .string()
    .min(1, "IMAGEKIT_PRIVATE_KEY is required")
    .default("private_bEblHeV+VfAZ+5YAznJ+FjF4fBg="),
  IMAGEKIT_URL_ENDPOINT: z
    .string()
    .url("IMAGEKIT_URL_ENDPOINT must be a valid URL")
    .default("https://ik.imagekit.io/ratiwaldream"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let parsedServerEnv: ServerEnv | null = null;

/**
 * Validates and returns the server environment configuration.
 * Caches validated result for subsequent calls within the same process.
 * Never outputs secret values in error messages.
 */
export function getServerEnv(): ServerEnv {
  if (parsedServerEnv) {
    return parsedServerEnv;
  }

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  };

  const result = serverEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => ` - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    const safeErrorMessage =
      `[Environment Config Error] Server environment validation failed:\n` +
      `${errorDetails}\n` +
      `Check your environment variables or .env.local file.`;

    throw new Error(safeErrorMessage);
  }

  parsedServerEnv = result.data;
  return parsedServerEnv;
}

export const serverEnv = getServerEnv;
