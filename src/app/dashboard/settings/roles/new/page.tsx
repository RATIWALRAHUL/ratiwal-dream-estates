import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { CustomRoleBuilder } from "../CustomRoleBuilder";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Custom Role | Ratiwal Dream Estates",
  description: "Define a tailored role with granular permission assignments.",
};

export default async function NewCustomRolePage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/dashboard/settings/roles"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] font-bold mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Roles & Permissions</span>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
              Custom RBAC
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#071a28]">Create New Custom Role</h1>
          <p className="text-xs text-[#647581] mt-1">
            Define a custom business role, select granted module actions, and validate functional dependencies.
          </p>
        </div>
      </div>

      <CustomRoleBuilder />
    </div>
  );
}
