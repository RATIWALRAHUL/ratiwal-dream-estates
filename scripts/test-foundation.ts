import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from .env.local if present
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore if .env.local is missing
}

async function runTests() {
  console.log("\n========================================================");
  console.log(" Ratiwal Dream Estates — Backend Foundation Test Suite");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Request ID Tests
  console.log("\n--- [1] Request ID Generator & Header Extractor ---");
  const { generateRequestId, getOrGenerateRequestId } = await import("../src/lib/api/request-id");
  const reqId1 = generateRequestId();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert(uuidRegex.test(reqId1), "generateRequestId produces valid UUID v4");

  const customUuid = "123e4567-e89b-42d3-a456-426614174000";
  const mockReqWithHeader = new Request("http://localhost/api/test", {
    headers: { "x-request-id": customUuid },
  });
  assert(getOrGenerateRequestId(mockReqWithHeader) === customUuid, "getOrGenerateRequestId reuses valid incoming x-request-id");

  const mockReqWithInvalidHeader = new Request("http://localhost/api/test", {
    headers: { "x-request-id": "invalid-non-uuid-string" },
  });
  const generatedFallback = getOrGenerateRequestId(mockReqWithInvalidHeader);
  assert(uuidRegex.test(generatedFallback) && generatedFallback !== "invalid-non-uuid-string", "getOrGenerateRequestId rejects non-UUID and generates fresh ID");

  // 2. Error Classes Tests
  console.log("\n--- [2] Application Error Classes ---");
  const {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    InternalServerError,
    isAppError,
  } = await import("../src/lib/api/errors");

  const valErr = new ValidationError("Invalid fields", { email: ["Invalid email"] });
  assert(valErr.status === 400 && valErr.code === "VALIDATION_ERROR", "ValidationError has status 400 and code VALIDATION_ERROR");
  assert(isAppError(valErr), "isAppError correctly identifies ValidationError as AppError");

  const authErr = new AuthenticationError();
  assert(authErr.status === 401 && authErr.code === "AUTHENTICATION_ERROR", "AuthenticationError has status 401");

  const authzErr = new AuthorizationError();
  assert(authzErr.status === 403 && authzErr.code === "AUTHORIZATION_ERROR", "AuthorizationError has status 403");

  const notFoundErr = new NotFoundError();
  assert(notFoundErr.status === 404 && notFoundErr.code === "NOT_FOUND", "NotFoundError has status 404");

  const conflictErr = new ConflictError();
  assert(conflictErr.status === 409 && conflictErr.code === "CONFLICT", "ConflictError has status 409");

  const rateLimitErr = new RateLimitError();
  assert(rateLimitErr.status === 429 && rateLimitErr.code === "RATE_LIMIT_EXCEEDED", "RateLimitError has status 429");

  const dbErr = new DatabaseError("Query failed", new Error("internal socket closed"));
  assert(dbErr.status === 500 && dbErr.code === "DATABASE_ERROR", "DatabaseError has status 500");

  const internalErr = new InternalServerError();
  assert(internalErr.status === 500 && internalErr.code === "INTERNAL_SERVER_ERROR", "InternalServerError has status 500");

  // 3. Response Formatters Tests
  console.log("\n--- [3] API Response Formatters ---");
  const { successResponse, errorResponse } = await import("../src/lib/api/response");

  const successRes = successResponse({ message: "Operation succeeded" }, { status: 201, requestId: customUuid });
  const successJson = await successRes.json();
  assert(successRes.status === 201, "successResponse sets custom HTTP status");
  assert(successJson.success === true && successJson.requestId === customUuid, "successResponse body has success: true and matching requestId");
  assert(successRes.headers.get("x-request-id") === customUuid, "successResponse includes x-request-id header");

  const errorRes = errorResponse(valErr, { requestId: customUuid });
  const errorJson = await errorRes.json();
  assert(errorRes.status === 400, "errorResponse preserves AppError status code");
  assert(errorJson.success === false && errorJson.error.code === "VALIDATION_ERROR", "errorResponse body has standard error envelope");
  assert(errorJson.error.fields?.email?.[0] === "Invalid email", "errorResponse includes validation field errors");

  // 4. Request Validation Helper Tests
  console.log("\n--- [4] Generic Request Validator ---");
  const { z } = await import("zod");
  const { validateRequestBody, validateQueryParams } = await import("../src/lib/validation");

  const testSchema = z.object({
    title: z.string().min(3),
    budget: z.number().positive(),
  });

  const validReq = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Villa Plot", budget: 5000000 }),
  });
  const parsedData = await validateRequestBody(validReq, testSchema);
  assert(parsedData.title === "Villa Plot" && parsedData.budget === 5000000, "validateRequestBody parses valid JSON");

  try {
    const invalidReq = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Vi", budget: -100 }),
    });
    await validateRequestBody(invalidReq, testSchema);
    assert(false, "validateRequestBody should throw on invalid input");
  } catch (err) {
    assert(isAppError(err) && err instanceof ValidationError, "validateRequestBody throws ValidationError on invalid input");
  }

  const queryParams = validateQueryParams("http://localhost/api/test?title=Luxury%20Plot&budget=1200000", z.object({
    title: z.string(),
    budget: z.coerce.number(),
  }));
  assert(queryParams.title === "Luxury Plot" && queryParams.budget === 1200000, "validateQueryParams parses URL query params correctly");

  // 5. Server Environment Validation Tests
  console.log("\n--- [5] Environment Validation ---");
  const { getServerEnv } = await import("../src/lib/env");
  const env = getServerEnv();
  assert(typeof env.MONGODB_URI === "string" && env.MONGODB_URI.length > 0, "getServerEnv successfully validates MONGODB_URI");
  assert(env.MONGODB_DB_NAME === "ratiwal_dream_estates", "getServerEnv resolves default MONGODB_DB_NAME");

  // 6. Database Connection & Health Check Endpoint Tests
  console.log("\n--- [6] MongoDB Connection Singleton & Health Check ---");
  const { connectToDatabase, getDatabaseState, disconnectFromDatabase } = await import("../src/lib/db/mongoose");
  const { GET: healthHandler } = await import("../src/app/api/health/route");

  console.log(" Connecting to MongoDB cluster...");
  const conn1 = await connectToDatabase();
  assert(conn1.connection.readyState === 1, "connectToDatabase establishes ready connection (readyState = 1)");
  assert(getDatabaseState() === "connected", "getDatabaseState returns 'connected'");

  const conn2 = await connectToDatabase();
  assert(conn1 === conn2, "connectToDatabase returns cached singleton on subsequent calls (no duplicate connections)");

  const healthReq = new Request("http://localhost/api/health");
  const healthRes = await healthHandler(healthReq);
  const healthJson = await healthRes.json();
  assert(healthRes.status === 200, "GET /api/health returns HTTP 200 OK");
  assert(healthJson.success === true, "GET /api/health response has success: true");
  assert(healthJson.data.status === "healthy" && healthJson.data.database === "connected", "GET /api/health data reports status: 'healthy' and database: 'connected'");
  assert(uuidRegex.test(healthJson.requestId), "GET /api/health returns valid requestId");

  await disconnectFromDatabase();
  assert(getDatabaseState() === "disconnected", "disconnectFromDatabase cleanly disconnects");

  console.log("\n========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
