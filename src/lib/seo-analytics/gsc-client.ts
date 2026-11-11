import "server-only";
import { GoogleAuth } from "google-auth-library";
import { AppError } from "@/lib/api/errors";

/**
 * Minimal, read-only Google Search Console Search Analytics client.
 *
 * Security notes:
 *  - Credentials are read from server env vars only; they are never logged,
 *    stored in MongoDB, or returned to callers.
 *  - Only the `webmasters.readonly` scope is requested.
 *  - Errors are mapped to safe codes/messages; upstream bodies are not leaked.
 */

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API_BASE = "https://www.googleapis.com/webmasters/v3/sites";
const ROW_LIMIT_PER_REQUEST = 25_000; // API maximum
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 30_000;

export type GscErrorCode =
  | "GSC_NOT_CONFIGURED"
  | "GSC_AUTH_FAILED"
  | "GSC_FORBIDDEN"
  | "GSC_BAD_REQUEST"
  | "GSC_QUOTA_EXCEEDED"
  | "GSC_UPSTREAM_ERROR";

export class GscError extends AppError {
  public readonly gscCode: GscErrorCode;
  constructor(gscCode: GscErrorCode, message: string, status = 502) {
    super(message, { status, code: "INTERNAL_SERVER_ERROR" });
    this.gscCode = gscCode;
  }
}

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

function parseCredentials(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  let email: string | undefined;
  let key: string | undefined;

  if (raw) {
    try {
      const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
      const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
      email = parsed.client_email;
      key = parsed.private_key;
    } catch {
      return null;
    }
  } else {
    email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
    key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  }

  if (!email || !key) return null;
  const private_key = key.replace(/\\n/g, "\n");
  if (!private_key.includes("BEGIN PRIVATE KEY")) return null;
  return { client_email: email, private_key };
}

export function getGscProperty(): string | null {
  const p = process.env.GSC_PROPERTY?.trim();
  return p ? p : null;
}

/** True when both credentials and property are present (says nothing about validity). */
export function isGscConfigured(): boolean {
  return Boolean(parseCredentials() && getGscProperty());
}

let cachedAuth: GoogleAuth | null = null;
function getAuth(): GoogleAuth {
  if (cachedAuth) return cachedAuth;
  const credentials = parseCredentials();
  if (!credentials) {
    throw new GscError(
      "GSC_NOT_CONFIGURED",
      "Search Console credentials are not configured on the server.",
      503
    );
  }
  cachedAuth = new GoogleAuth({ credentials, scopes: [SCOPE] });
  return cachedAuth;
}

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQuery {
  startDate: string;
  endDate: string;
  dimensions: Array<"date" | "query" | "page" | "device" | "country">;
  /** Hard cap on total rows we are willing to pull across pages. */
  maxRows: number;
}

export interface GscQueryResult {
  rows: GscRow[];
  /** True if we stopped at maxRows while Google still had more rows. */
  truncated: boolean;
  attempts: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mapHttpError(status: number | undefined): GscError {
  if (status === 401) {
    return new GscError("GSC_AUTH_FAILED", "Google rejected the service-account credentials.", 502);
  }
  if (status === 403) {
    return new GscError(
      "GSC_FORBIDDEN",
      "The service account does not have access to this Search Console property. Add its email as a user in Search Console.",
      502
    );
  }
  if (status === 400 || status === 404) {
    return new GscError(
      "GSC_BAD_REQUEST",
      "Search Console rejected the request. Check GSC_PROPERTY and the date range.",
      502
    );
  }
  if (status === 429) {
    return new GscError("GSC_QUOTA_EXCEEDED", "Search Console API quota exceeded. Try again later.", 429);
  }
  return new GscError("GSC_UPSTREAM_ERROR", "Search Console is temporarily unavailable.", 502);
}

function isRetryable(status: number | undefined): boolean {
  return status === undefined || status === 429 || (status >= 500 && status <= 504);
}

async function postWithRetry(
  url: string,
  body: Record<string, unknown>,
  counter: { attempts: number }
): Promise<{ rows?: GscRow[] }> {
  const auth = getAuth();
  const client = await auth.getClient();
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    counter.attempts++;
    try {
      const res = await client.request<{ rows?: GscRow[] }>({
        url,
        method: "POST",
        data: body,
        timeout: REQUEST_TIMEOUT_MS,
      });
      return res.data ?? {};
    } catch (err) {
      lastStatus = (err as { response?: { status?: number }; status?: number }).response?.status
        ?? (err as { status?: number }).status;
      if (!isRetryable(lastStatus) || attempt === MAX_ATTEMPTS) break;
      // Exponential backoff with jitter: ~1s, 2s, 4s.
      await sleep(1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250));
    }
  }
  throw mapHttpError(lastStatus);
}

/**
 * Runs a Search Analytics query and pages through results (type=web,
 * dataState=final) up to `maxRows`.
 */
export async function querySearchAnalytics(q: GscQuery): Promise<GscQueryResult> {
  const property = getGscProperty();
  if (!property) {
    throw new GscError("GSC_NOT_CONFIGURED", "GSC_PROPERTY is not configured on the server.", 503);
  }
  const url = `${API_BASE}/${encodeURIComponent(property)}/searchAnalytics/query`;
  const counter = { attempts: 0 };
  const rows: GscRow[] = [];
  let truncated = false;

  while (rows.length < q.maxRows) {
    const rowLimit = Math.min(ROW_LIMIT_PER_REQUEST, q.maxRows - rows.length);
    const data = await postWithRetry(
      url,
      {
        startDate: q.startDate,
        endDate: q.endDate,
        dimensions: q.dimensions,
        type: "web",
        dataState: "final",
        rowLimit,
        startRow: rows.length,
      },
      counter
    );
    const page = data.rows ?? [];
    rows.push(...page);
    if (page.length < rowLimit) break; // Google has no more rows
    if (rows.length >= q.maxRows) {
      truncated = true; // full final page at the cap: more may exist
    }
  }

  return { rows, truncated, attempts: counter.attempts };
}
