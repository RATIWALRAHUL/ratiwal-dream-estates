import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AdvisorAvailability } from "@/models/AdvisorAvailability";
import { AvailabilityManager } from "@/components/dashboard/site-visits/AvailabilityManager";

export const metadata: Metadata = {
  title: "Availability Rules | Ratiwal Dream Estates Dashboard",
  description: "Configure operating hours, booking notice, buffers, and blackout dates.",
};

export default async function AvailabilityPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();

  const advisorId = session.user.role === "EDITOR" ? session.user.id : "GLOBAL_DEFAULT";

  let avail = await AdvisorAvailability.findOne({ advisorId }).lean();
  if (!avail) {
    const created = await AdvisorAvailability.create({
      advisorId,
      advisorName: session.user.role === "EDITOR" ? session.user.name : "Property Advisory Desk",
      advisorEmail: session.user.role === "EDITOR" ? session.user.email : "advisory@ratiwal.com",
      timezone: "Asia/Kolkata",
    });
    avail = created.toObject();
  }

  const canEdit = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" || session.user.role === "EDITOR";

  return (
    <AvailabilityManager
      advisorId={advisorId}
      advisorName={avail.advisorName}
      weeklySchedule={avail.weeklySchedule || []}
      defaultVisitDurationMinutes={avail.defaultVisitDurationMinutes || 60}
      bufferBeforeMinutes={avail.bufferBeforeMinutes ?? 15}
      bufferAfterMinutes={avail.bufferAfterMinutes ?? 15}
      minBookingNoticeHours={avail.minBookingNoticeHours || 4}
      maxAdvanceBookingDays={avail.maxAdvanceBookingDays || 30}
      exceptions={(avail.exceptions || []).map((e) => ({
        id: e._id?.toString() || Math.random().toString(),
        date: e.date,
        type: e.type,
        reason: e.reason,
        startLocalTime: e.startLocalTime,
        endLocalTime: e.endLocalTime,
      }))}
      canEdit={canEdit}
    />
  );
}
