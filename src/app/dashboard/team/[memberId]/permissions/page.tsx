import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamMember } from "@/models/TeamMember";
import { Role } from "@/models/Role";
import { PermissionService } from "@/lib/services/permission.service";
import { MemberPermissionsEditor } from "./MemberPermissionsEditor";
import { ArrowLeft } from "lucide-react";

interface MemberPermissionsPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export const metadata = {
  title: "Member Permissions | Ratiwal Dream Estates",
  description: "Configure granular permissions and data scopes for team member.",
};

export default async function MemberPermissionsPage({ params }: MemberPermissionsPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { memberId } = await params;
  await connectToDatabase();

  const member = await TeamMember.findById(memberId).lean();
  if (!member) {
    notFound();
  }

  await PermissionService.seedSystemRoles(session.user.id);
  const [effectivePermissions, rolesList] = await Promise.all([
    PermissionService.getPermissionsForRole(member.roleKey),
    Role.find({ isActive: true }).lean(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link & Header */}
      <div>
        <Link
          href={`/dashboard/team/${memberId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] font-bold mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Member Profile</span>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#087fc3] bg-[#087fc3]/10 px-2.5 py-0.5 rounded-full">
              Access Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#071a28]">
            Permissions: {member.fullName}
          </h1>
          <p className="text-xs text-[#647581] mt-0.5">
            Configure assigned role, regional/property data boundaries, and inspect active permission gates.
          </p>
        </div>
      </div>

      <MemberPermissionsEditor
        member={JSON.parse(JSON.stringify(member))}
        effectivePermissions={effectivePermissions}
        rolesList={JSON.parse(JSON.stringify(rolesList))}
        userRole={session.user.role}
      />
    </div>
  );
}
