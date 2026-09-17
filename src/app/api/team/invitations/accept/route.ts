import { NextRequest, NextResponse } from "next/server";
import { TeamInvitationService } from "@/lib/services/team-invitation.service";

import { getErrorMessage } from "@/lib/api/errors";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid invitation token." },
        { status: 400 }
      );
    }

    const { member, invitation } = await TeamInvitationService.acceptInvitation(token);

    return NextResponse.json({
      success: true,
      member: {
        id: member._id.toString(),
        memberReference: member.memberReference,
        fullName: member.fullName,
        email: member.email,
        roleKey: member.roleKey,
        dataScope: member.dataScope,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error, "Failed to process invitation acceptance.") },
      { status: 400 }
    );
  }
}
