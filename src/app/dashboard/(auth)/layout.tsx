import React from "react";
import { DashboardAuthLayout } from "@/components/dashboard/auth/DashboardAuthLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administrator Sign In | Ratiwal Control Center",
  description: "Secure administrative access to Ratiwal Dream Estates platform operations, inventory, and legal vault.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthLayout>{children}</DashboardAuthLayout>;
}
