import { LogoLoader } from "@/components/ui/LogoLoader";

/**
 * Private, per-request routes keep the branded loader that the (removed) root
 * loading.tsx used to provide. Public marketing pages deliberately have no loading
 * boundary so their prerendered HTML contains the real content in document order.
 */
export default function Loading() {
  return <LogoLoader variant="page" text="Loading Ratiwal Dream Estates..." />;
}
