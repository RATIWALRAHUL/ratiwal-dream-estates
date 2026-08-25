import "server-only";
import { requireAdminSession } from "@/lib/auth/guard";
import { getPropertyInventory } from "@/lib/services/property-editor.service";
import { InventoryManager } from "@/components/dashboard/inventory/InventoryManager";

export const dynamic = "force-dynamic";

interface PropertyInventoryPageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertyInventoryPage({
  params,
  searchParams,
}: PropertyInventoryPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { propertyId } = await params;
  const sp = await searchParams;

  const search = typeof sp.search === "string" ? sp.search : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const facing = typeof sp.facing === "string" ? sp.facing : undefined;
  const isCorner = sp.isCorner === "true" ? true : sp.isCorner === "false" ? false : undefined;
  const sortBy = typeof sp.sortBy === "string" ? (sp.sortBy as any) : "plotNumber";
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;

  const inventoryData = await getPropertyInventory({
    propertyId,
    search,
    status,
    facing,
    isCorner,
    sortBy,
    page,
    pageSize: 25,
  });

  return <InventoryManager initialData={inventoryData} userRole={session.user.role} />;
}
