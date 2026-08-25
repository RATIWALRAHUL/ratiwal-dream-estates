"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { TeamInviteModal } from "@/components/dashboard/team/TeamInviteModal";

export function TeamInviteButton({ userRole }: { userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Invite Member</span>
      </button>

      <TeamInviteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
