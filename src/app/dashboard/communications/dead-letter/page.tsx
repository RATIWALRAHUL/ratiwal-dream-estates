import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/lib/services/communication.service";
import { DeadLetterTable } from "@/components/dashboard/communications/DeadLetterTable";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Dead-Letter Recovery | Ratiwal Dream Estates Dashboard",
  description: "Manage and safely retry failed transactional notifications.",
};

interface DeadLetterPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function DeadLetterPage({ searchParams }: DeadLetterPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const data = await CommunicationService.getDeadLetterItems(page, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/communications"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Communications Hub
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
              Dead-Letter Queue & Recovery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-mono font-bold">
              {data.totalCount} items
            </span>
          </div>
          <p className="text-sm text-[#647581] mt-1">
            Notifications that exceeded maximum retry attempts or encountered unrecoverable errors. Super Admins can re-queue them after resolving root causes.
          </p>
        </div>
      </div>

      {/* Table */}
      <DeadLetterTable
        items={data.items}
        totalCount={data.totalCount}
        page={data.page}
        perPage={data.perPage}
        totalPages={data.totalPages}
        userRole={session.user.role}
      />
    </div>
  );
}
