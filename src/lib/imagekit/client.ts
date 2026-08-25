import "server-only";
import ImageKit from "imagekit";
import { getServerEnv } from "@/lib/env";

let imageKitInstance: ImageKit | null = null;

/**
 * Returns the singleton server-side ImageKit client instance.
 */
export function getImageKitClient(): ImageKit {
  if (imageKitInstance) {
    return imageKitInstance;
  }

  const env = getServerEnv();

  imageKitInstance = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });

  return imageKitInstance;
}

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/**
 * Generates temporary client authentication parameters for secure browser uploads.
 */
export function getImageKitAuthParams(): ImageKitAuthParams {
  const ik = getImageKitClient();
  const env = getServerEnv();
  const auth = ik.getAuthenticationParameters();

  return {
    ...auth,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  };
}
