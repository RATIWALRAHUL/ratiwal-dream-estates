import "server-only";
import type { FetchResult, Fetcher } from "./tech-scanner";

/**
 * The ONLY network boundary for the technical scanner.
 *
 * SSRF / load controls:
 *  - The caller supplies a base URL derived from siteConfig (never from a request).
 *  - Every request (and every redirect hop, because redirects are handled manually
 *    by the engine and each hop comes back through here) must be http(s), carry no
 *    credentials, use the default port, and target the allow-listed host or its
 *    bare/www twin. Anything else returns BLOCKED_HOST without a network call.
 *  - IP-literal and localhost hosts are refused unless the base URL itself is one
 *    (only possible in tests, never from the API route).
 *  - 8 s timeout, 2 MB body cap, GET/HEAD only, identifiable User-Agent, no cookies.
 *  - `redirect: "manual"`, so the fetch layer never silently follows to another host.
 */

const TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const IP_LITERAL = /^(\d{1,3}\.){3}\d{1,3}$|^\[.*\]$/;

export function buildAllowedHosts(baseUrl: string): Set<string> {
  const host = new URL(baseUrl).host;
  const hosts = new Set<string>([host]);
  hosts.add(host.startsWith("www.") ? host.slice(4) : `www.${host}`);
  return hosts;
}

export function createAllowListedFetcher(baseUrl: string, userAgent: string): Fetcher {
  const allowed = buildAllowedHosts(baseUrl);
  const baseHost = new URL(baseUrl).hostname;
  const baseIsLocal = baseHost === "localhost" || IP_LITERAL.test(baseHost);

  return async (rawUrl, { method, readBody }): Promise<FetchResult> => {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return { status: 0, headers: {}, error: "BLOCKED_HOST" };
    }
    const local = url.hostname === "localhost" || IP_LITERAL.test(url.hostname);
    if (
      !/^https?:$/.test(url.protocol) ||
      url.username ||
      url.password ||
      !allowed.has(url.host) ||
      (local && !baseIsLocal)
    ) {
      return { status: 0, headers: {}, error: "BLOCKED_HOST" };
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: "manual",
        signal: ctrl.signal,
        cache: "no-store",
        headers: { "User-Agent": userAgent, Accept: "text/html,application/xml,text/plain,*/*;q=0.5" },
      });
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k.toLowerCase()] = v;
      });
      const out: FetchResult = { status: res.status, headers, location: headers["location"] };

      if (readBody && method === "GET" && res.status >= 200 && res.status < 300 && res.body) {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > MAX_BODY_BYTES) {
            await reader.cancel();
            return { ...out, error: "TOO_LARGE" };
          }
          chunks.push(value);
        }
        out.body = Buffer.concat(chunks).toString("utf8");
      } else {
        await res.body?.cancel();
      }
      return out;
    } catch (e) {
      const aborted = (e as { name?: string }).name === "AbortError";
      return { status: 0, headers: {}, error: aborted ? "TIMEOUT" : "NETWORK" };
    } finally {
      clearTimeout(timer);
    }
  };
}
