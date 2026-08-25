import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getSiteVisitById } from "@/lib/services/site-visit.service";
import { SiteVisitDetailView } from "@/components/dashboard/site-visits/SiteVisitDetailView";
import { Types } from "mongoose";

interface SiteVisitDetailPageProps {
  params: Promise<{ visitId: string }>;
}

export async function generateMetadata({ params }: SiteVisitDetailPageProps): Promise<Metadata> {
  const { visitId } = await params;
  return {
    title: `Site Visit Details | Ratiwal Dream Estates`,
    description: `Manage property tour and consultation scheduling.`,
    robots: { index: false, follow: false },
  };
}

export default async function SiteVisitDetailPage({ params }: SiteVisitDetailPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { visitId } = await params;

  if (!Types.ObjectId.isValid(visitId)) notFound();

  const { user } = session;
  const visit = await getSiteVisitById(visitId, user.role, user.id);

  if (!visit) notFound();

  return (
    <SiteVisitDetailView
      visit={visit}
      role={user.role}
      userId={user.id}
    />
  );
}
