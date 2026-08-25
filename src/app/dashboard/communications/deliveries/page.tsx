import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/lib/services/communication.service";
import { DeliveryFilterToolbar } from "@/components/dashboard/communications/DeliveryFilterToolbar";
import { DeliveryTable } from "@/components/dashboard/communications/DeliveryTable";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Delivery Audit Logs | Ratiwal Dream Estates Dashboard",
  description: "Granular audit trail of transactional email and WhatsApp delivery states.",
};

interface DeliveriesPageProps {
  searchParams: Promise<{
    channel?: string;
    status?: string;
    eventType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function DeliveriesPage({ searchParams }: DeliveriesPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;

  const filters = {
    channel: params.channel,
    status: params.status,
    eventType: params.eventType,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ? parseInt(params.page, 10) : 1,
    perPage: 25,
  };

  const deliveries = await CommunicationService.getDeliveries(filters);

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
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Delivery History & Audit Trail
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Real-time delivery status, attempt counts, and provider response tracking.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Suspense>
        <DeliveryFilterToolbar />
      </Suspense>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-[#647581]">
        <span>
          <strong className="text-[#071a28]">{deliveries.totalCount}</strong> delivery records found
        </span>
      </div>

      {/* Table */}
      <DeliveryTable
        items={deliveries.items}
        totalCount={deliveries.totalCount}
        page={deliveries.page}
        perPage={deliveries.perPage}
        totalPages={deliveries.totalPages}
      />
    </div>
  );
}
