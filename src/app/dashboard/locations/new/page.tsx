import "server-only";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/guard";
import { NewLocationForm } from "@/components/dashboard/locations/NewLocationForm";

export const dynamic = "force-dynamic";

export default async function NewLocationPage() {
  await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header with Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#647581] mb-2">
          <Link href="/dashboard/locations" className="hover:text-[#087fc3] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Locations</span>
          </Link>
          <span>/</span>
          <span className="text-[#071a28] font-medium">New Growth Corridor</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#071a28] text-white shadow-xs">
            <Compass className="w-6 h-6 text-[#42b7e8]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#071a28] font-normal tracking-tight">
              Create Location Corridor
            </h1>
            <p className="text-xs sm:text-sm text-[#647581] mt-0.5 font-body">
              Initialize a new strategic land market draft with automated slugification and territorial diligence.
            </p>
          </div>
        </div>
      </div>

      {/* Draft Form Component */}
      <NewLocationForm />
    </div>
  );
}
