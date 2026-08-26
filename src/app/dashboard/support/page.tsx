import React, { Suspense } from "react";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requireAdminSession } from "@/lib/auth/guard";
import { CustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { StaffSupportDeskView } from "@/components/dashboard/support/StaffSupportDeskView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Support Desk | Admin Dashboard",
  description: "Manage customer portal inquiries, support tickets, and replies.",
};

export default async function StaffSupportDeskPage() {
  await requireAdminSession();
  await connectToDatabase();

  const tickets = await CustomerSupportRequest.find()
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="p-6">
      <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading support desk...</div>}>
        <StaffSupportDeskView tickets={tickets} />
      </Suspense>
    </div>
  );
}
