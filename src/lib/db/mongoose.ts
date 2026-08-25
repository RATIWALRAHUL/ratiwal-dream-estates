import "server-only";
import mongoose, { type Mongoose } from "mongoose";
import { getServerEnv } from "@/lib/env";
import { DatabaseError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Strips credentials and host addresses from raw connection errors.
 */
function sanitizeMongoErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    let msg = error.message;
    // Replace connection URIs if present in error message
    msg = msg.replace(/mongodb(\+srv)?:\/\/[^\s@]+@[^\s/]+/gi, "mongodb://[REDACTED_CREDENTIALS]");
    return msg;
  }
  return "An unexpected database connection error occurred.";
}

/**
 * Connects to MongoDB with singleton caching to survive Next.js dev server reloads.
 * Returns the active Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  const env = getServerEnv();

  // If we already have an established connection, reuse it
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is currently in flight, await that promise
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    logger.info("Initializing MongoDB connection singleton...", {
      database: env.MONGODB_DB_NAME,
      category: "DATABASE",
    });

    cached.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((m) => {
        logger.info("MongoDB connected successfully.", {
          database: env.MONGODB_DB_NAME,
          category: "DATABASE",
        });
        return m;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;

        const safeMsg = sanitizeMongoErrorMessage(error);
        logger.error("MongoDB connection failed.", {
          category: "DATABASE",
          error: safeMsg,
        });

        throw new DatabaseError(`Database connection failed: ${safeMsg}`, error);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(sanitizeMongoErrorMessage(error), error);
  }

  return cached.conn;
}

/**
 * Returns human-readable state of the database connection.
 */
export function getDatabaseState(): "connected" | "connecting" | "disconnecting" | "disconnected" {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    case 0:
    default:
      return "disconnected";
  }
}

/**
 * Closes the active database connection if connected.
 * Primarily useful for integration tests and graceful shutdown.
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    logger.info("MongoDB disconnected.", { category: "DATABASE" });
  }
}
