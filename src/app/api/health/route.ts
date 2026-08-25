import { connectToDatabase, getDatabaseState } from "@/lib/db/mongoose";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getOrGenerateRequestId } from "@/lib/api/request-id";
import { logger } from "@/lib/logger";
import type { HealthCheckData } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health Check Route Handler
 * Validates real MongoDB connectivity and service readiness without exposing internals.
 */
export async function GET(request: Request) {
  const requestId = getOrGenerateRequestId(request);

  try {
    const mongooseInstance = await connectToDatabase();

    // Verify ping to active database admin interface
    const isReady = mongooseInstance.connection.readyState === 1;
    if (isReady && mongooseInstance.connection.db) {
      await mongooseInstance.connection.db.admin().ping();
    }

    const healthData: HealthCheckData = {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    };

    return successResponse(healthData, {
      status: 200,
      requestId,
    });
  } catch (error) {
    logger.error("Health check failed: database connectivity issue", {
      requestId,
      route: "/api/health",
      databaseState: getDatabaseState(),
    });

    return errorResponse(
      {
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        message: "Database service is currently unavailable.",
      },
      {
        status: 503,
        requestId,
      }
    );
  }
}
