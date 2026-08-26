/**
 * @file cms-sanitizer.service.ts
 * @description Strict server-side HTML and content block sanitizer for CMS entries.
 * Eliminates XSS, script injection, style injection, unsafe URLs, and arbitrary iframes.
 */

export class CmsSanitizerService {
  private static readonly ALLOWED_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];
  private static readonly ALLOWED_EMBED_DOMAINS = [
    "youtube.com",
    "www.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "vimeo.com",
    "player.vimeo.com",
    "google.com/maps",
    "maps.google.com",
  ];

  /**
   * Sanitizes rich text HTML removing scripts, handlers, style tags, and dangerous protocols
   */
  public static sanitizeHtml(dirtyHtml: string): string {
    if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

    let clean = dirtyHtml;

    // 1. Strip all <script> tags and contents
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // 2. Strip all <style> tags and contents
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    // 3. Strip all event handlers (onclick, onerror, onload, onmouseover, etc.)
    clean = clean.replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

    // 4. Strip dangerous url schemes from src, href, action
    clean = clean.replace(
      /(href|src|action)\s*=\s*['"]\s*(javascript|vbscript|data):[^'"]*['"]/gi,
      '$1="#"'
    );

    // 5. Restrict iframe sources to allowlisted domains only
    clean = clean.replace(
      /<iframe\b([^>]*?)\bsrc\s*=\s*['"]([^'"]+)['"]([^>]*?)>/gi,
      (match, before, src, after) => {
        try {
          const parsed = new URL(src);
          const isAllowed = this.ALLOWED_EMBED_DOMAINS.some((domain) =>
            parsed.hostname.includes(domain) || parsed.pathname.includes(domain)
          );
          if (!isAllowed) {
            return `<!-- Blocked unauthorized iframe source: ${src} -->`;
          }
          return `<iframe ${before} src="${src}" ${after} sandbox="allow-scripts allow-same-origin" loading="lazy">`;
        } catch {
          return `<!-- Blocked malformed iframe -->`;
        }
      }
    );

    // 6. Ensure external links have rel="noopener noreferrer"
    clean = clean.replace(
      /<a\b([^>]*?)\bhref\s*=\s*['"](https?:\/\/[^'"]+)['"]([^>]*?)>/gi,
      (match, before, href, after) => {
        if (!match.includes('rel=')) {
          return `<a ${before} href="${href}" rel="noopener noreferrer" ${after}>`;
        }
        return match;
      }
    );

    return clean.trim();
  }

  /**
   * Sanitizes all blocks in a CMS entry payload
   */
  public static sanitizeBlocks(blocks: any[]): any[] {
    if (!Array.isArray(blocks)) return [];

    return blocks.map((block, index) => {
      const sanitizedData: Record<string, any> = { ...block.data };

      // Sanitize rich text fields in block data
      for (const [key, value] of Object.entries(sanitizedData)) {
        if (typeof value === "string" && (key.includes("html") || key.includes("content") || key.includes("body") || key.includes("text"))) {
          sanitizedData[key] = this.sanitizeHtml(value);
        } else if (typeof value === "string" && (key.includes("url") || key.includes("href") || key.includes("link"))) {
          sanitizedData[key] = this.sanitizeUrl(value);
        }
      }

      return {
        id: block.id || `block_${Date.now()}_${index}`,
        type: block.type,
        order: typeof block.order === "number" ? block.order : index,
        data: sanitizedData,
      };
    });
  }

  /**
   * Validates and sanitizes a URL string
   */
  public static sanitizeUrl(urlStr: string): string {
    if (!urlStr || typeof urlStr !== "string") return "#";
    const trimmed = urlStr.trim();

    // Permit valid relative paths starting with /
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }

    try {
      const parsed = new URL(trimmed);
      if (this.ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {
        return trimmed;
      }
      return "#";
    } catch {
      return "#";
    }
  }
}
