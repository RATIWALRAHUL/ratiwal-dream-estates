"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLeadAction } from "@/lib/actions/lead.actions";
import { showToast, confirmDeleteInquiry } from "@/lib/sweetalert";

interface LeadDeleteButtonProps {
  leadId: string;
  referenceNumber: string;
  fullName: string;
  role: string;
  variant?: "header" | "panel";
}

export function LeadDeleteButton({
  leadId,
  referenceNumber,
  fullName,
  role,
  variant = "header",
}: LeadDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Restrict delete trigger to ADMIN and SUPER_ADMIN
  const isAuthorized = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isAuthorized) return null;

  const handleDelete = async () => {
    const confirmed = await confirmDeleteInquiry(referenceNumber, fullName);
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const res = await deleteLeadAction(leadId);
        if (res.success) {
          showToast.success("Inquiry Deleted", res.message || `Lead ${referenceNumber} has been removed.`);
          router.push("/dashboard/leads");
        } else {
          showToast.error("Deletion Failed", res.message || "Failed to delete lead inquiry.");
        }
      } catch {
        showToast.error("Error", "An unexpected error occurred while deleting.");
      }
    });
  };

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 shadow-2xs transition-all hover:border-rose-400 disabled:opacity-50"
          title="Delete Lead Inquiry"
          aria-label="Delete Lead Inquiry"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-rose-600" />}
          <span>Delete</span>
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-600" />}
          <span>Permanently Delete Inquiry</span>
        </button>
      )}
    </>
  );
}
