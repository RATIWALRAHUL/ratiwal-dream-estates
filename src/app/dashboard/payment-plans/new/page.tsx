import "server-only";
import { Booking } from "@/models/Booking";
import { PaymentPlanBuilder } from "@/components/dashboard/payments/PaymentPlanBuilder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Build Payment Plan | Admin Dashboard",
  description: "Create a milestone construction-linked payment plan for a booking.",
};

export default async function NewPaymentPlanPage() {
  const bookings = await Booking.find({ status: { $ne: "CANCELLED" } })
    .populate("propertyId", "title code")
    .select("bookingNumber finalAmountPaise propertyId status")
    .lean();

  return <PaymentPlanBuilder bookings={bookings} />;
}
