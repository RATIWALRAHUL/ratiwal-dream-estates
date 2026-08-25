/**
 * ImageKit URL Transformation and Optimization Utilities
 */

export interface ImageKitTransformationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  cropMode?: "maintain_ratio" | "force" | "at_least" | "at_max";
  focus?: "auto" | "center" | "top" | "custom";
  blur?: number;
  radius?: number | "max";
  grayscale?: boolean;
}

/**
 * Checks whether a given URL is hosted on ImageKit.
 */
export function isImageKitUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("ik.imagekit.io");
}

/**
 * Builds an ImageKit transformation string based on options.
 * Example: "tr:w-800,h-500,q-85,f-auto,fo-auto"
 */
export function buildTransformationString(options: ImageKitTransformationOptions): string {
  const parts: string[] = [];

  if (options.width) parts.push(`w-${options.width}`);
  if (options.height) parts.push(`h-${options.height}`);
  if (options.quality) parts.push(`q-${options.quality}`);
  if (options.format) parts.push(`f-${options.format}`);
  else parts.push("f-auto"); // Always auto-format to webp/avif for optimal performance

  if (options.focus) parts.push(`fo-${options.focus}`);
  if (options.blur) parts.push(`bl-${options.blur}`);
  if (options.radius) parts.push(`r-${options.radius}`);
  if (options.grayscale) parts.push("e-grayscale");

  if (parts.length === 0) return "";
  return `tr:${parts.join(",")}`;
}

/**
 * Applies ImageKit transformations to a URL.
 * If the URL is not hosted on ImageKit, returns the original URL.
 */
export function getImageKitUrl(
  url: string,
  options: ImageKitTransformationOptions = {}
): string {
  if (!url) return "";
  if (!isImageKitUrl(url)) return url;

  const trString = buildTransformationString(options);
  if (!trString) return url;

  // If URL already contains a transformation parameter (tr:...)
  if (url.includes("/tr:")) {
    return url.replace(/\/tr:[^/]+/, `/${trString}`);
  }

  // Insert transformation after endpoint domain
  // e.g. https://ik.imagekit.io/ratiwaldream/properties/hero.jpg -> https://ik.imagekit.io/ratiwaldream/tr:w-800/properties/hero.jpg
  const endpointMatch = url.match(/^(https?:\/\/ik\.imagekit\.io\/[^/]+)(\/.*)$/);
  if (endpointMatch) {
    const [, base, path] = endpointMatch;
    return `${base}/${trString}${path}`;
  }

  // Fallback: append as query parameter
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${trString}`;
}

/**
 * Generates an ultra-lightweight progressive blur placeholder for Next.js Image components.
 */
export function getBlurPlaceholderUrl(url: string): string {
  if (!isImageKitUrl(url)) return url;
  return getImageKitUrl(url, {
    width: 40,
    quality: 20,
    blur: 30,
    format: "webp",
  });
}
