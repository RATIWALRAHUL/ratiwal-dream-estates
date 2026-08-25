import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";
import { DealService } from "@/lib/services/deal.service";
import { DealWorkspace } from "@/components/dashboard/deals/DealWorkspace";

export const dynamic = "force-dynamic";

interface DealDetailPageProps {
  params: Promise<{
    dealId: string;
  }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const { dealId } = await params;

  const dealData = await DealService.getDealById(dealId);
  if (!dealData || !dealData.deal) {
    notFound();
  }

  // Sanitize lean mongoose doc for client component boundary
  const sanitizedData = JSON.parse(JSON.stringify(dealData));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/deals" className="text-xs font-bold text-slate-500 hover:text-slate-900">
          ← Back to Deals
        </Link>
      </div>

      <DealWorkspace dealData={sanitizedData} userRole={session.user.role} />
    </div>
  );
}
