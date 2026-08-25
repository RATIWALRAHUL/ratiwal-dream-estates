import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CommunicationService } from "@/lib/services/communication.service";
import { TemplateViewer } from "@/components/dashboard/communications/TemplateViewer";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Template Management | Ratiwal Dream Estates Dashboard",
  description: "Inspect approved email and WhatsApp template specifications and parameters.",
};

export default async function TemplatesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const templates = await CommunicationService.getTemplates();

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
            Transactional Template Directory
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Standardized brand templates for inquiries, site-visit confirmations, and automated reminders.
          </p>
        </div>
      </div>

      {/* Viewer Component */}
      <TemplateViewer templates={templates} />
    </div>
  );
}
