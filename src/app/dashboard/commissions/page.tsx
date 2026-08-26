import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CommissionAccrual } from "@/models/CommissionAccrual";
import { CommissionPlan } from "@/models/CommissionPlan";
import { StaffCommissionsView } from "@/components/dashboard/commissions/StaffCommissionsView";

export const dynamic = "force-dynamic";

export default async function DashboardCommissionsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await connectToDatabase();

  const rawAccruals = await CommissionAccrual.find()
    .populate("partnerId", "displayName partnerCode")
    .populate("bookingId", "bookingNumber")
    .sort({ createdAt: -1 })
    .lean();

  const rawPlans = await CommissionPlan.find().lean();

  const accruals = rawAccruals.map((a: any) => ({
    ...a,
    _id: a._id.toString(),
    partnerId: a.partnerId ? { ...a.partnerId, _id: a.partnerId._id.toString() } : null,
    bookingId: a.bookingId ? { ...a.bookingId, _id: a.bookingId._id.toString() } : null,
    createdAt: a.createdAt.toISOString(),
  }));

  const plans = rawPlans.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
  }));

  return <StaffCommissionsView accruals={accruals} plans={plans} />;
}
