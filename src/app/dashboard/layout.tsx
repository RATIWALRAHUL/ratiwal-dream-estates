import "server-only";
import { getAdminSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Ratiwal Dream Estates",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If user has a valid active admin session, wrap with the full DashboardShell
  if (session && session.user.isActive) {
    return <DashboardShell user={session.user}>{children}</DashboardShell>;
  }

  // For unauthenticated flows (e.g. /dashboard/login, /dashboard/forgot-password, etc.),
  // render children directly so that the split-screen DashboardAuthLayout is displayed
  return <>{children}</>;
}
