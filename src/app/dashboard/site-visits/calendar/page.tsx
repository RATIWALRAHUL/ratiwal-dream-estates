import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSiteVisitsForCalendar } from "@/lib/services/site-visit.service";
import { SiteVisitCalendarView } from "@/components/dashboard/site-visits/SiteVisitCalendarView";
import { ArrowLeft, ListFilter } from "lucide-react";

export const metadata: Metadata = {
  title: "Advisor Calendar | Ratiwal Dream Estates Dashboard",
  description: "Schedule, day, week, and agenda view for site visits and consultations.",
};

interface CalendarPageProps {
  searchParams: Promise<{
    date?: string;
    advisorId?: string;
    propertyId?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const params = await searchParams;
  const initialDateStr = params.date || new Date().toISOString().split("T")[0];

  // Fetch 45-day window around initialDate
  const centerDate = new Date(initialDateStr);
  const startWindow = new Date(centerDate);
  startWindow.setDate(startWindow.getDate() - 15);
  const endWindow = new Date(centerDate);
  endWindow.setDate(endWindow.getDate() + 30);

  const events = await getSiteVisitsForCalendar(
    startWindow.toISOString().split("T")[0],
    endWindow.toISOString().split("T")[0],
    session.user.role,
    session.user.id,
    params.advisorId,
    params.propertyId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/site-visits"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Operations Agenda
          </Link>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Advisor Schedule & Calendar
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Visual day and week scheduling calendar for plot inspections.
          </p>
        </div>

        <Link
          href="/dashboard/site-visits"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-xs"
        >
          <ListFilter className="w-4 h-4 text-[#087fc3]" />
          Switch to Agenda List
        </Link>
      </div>

      {/* Calendar Component */}
      <SiteVisitCalendarView events={events} initialDate={initialDateStr} />
    </div>
  );
}
