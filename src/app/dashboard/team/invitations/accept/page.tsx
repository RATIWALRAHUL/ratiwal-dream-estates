import { Suspense } from "react";
import { AcceptInvitationClient } from "./AcceptInvitationClient";

export const metadata = {
  title: "Accept Team Invitation | Ratiwal Dream Estates",
  description: "Accept your official team invitation and activate your account.",
};

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
          <div className="h-48 w-80 bg-white rounded-3xl animate-pulse" />
        </div>
      }
    >
      <AcceptInvitationClient />
    </Suspense>
  );
}
