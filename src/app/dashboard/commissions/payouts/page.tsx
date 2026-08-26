import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CommissionPayout } from "@/models/CommissionPayout";
import { StaffPayoutsView } from "@/components/dashboard/commissions/StaffPayoutsView";

export const dynamic = "force-dynamic";

export default async function DashboardPayoutsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await connectToDatabase();

  const rawPayouts = await CommissionPayout.find()
    .populate("partnerId", "displayName partnerCode")
    .sort({ createdAt: -1 })
    .lean();

  const payouts = rawPayouts.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    partnerId: p.partnerId ? { ...p.partnerId, _id: p.partnerId._id.toString() } : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return <StaffPayoutsView payouts={payouts} />;
}
