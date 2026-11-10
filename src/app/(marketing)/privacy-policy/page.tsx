import React from "react";
import { getMetadata } from "@/lib/seo";
import { privacyPolicyData } from "@/data/legal/privacyPolicyData";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = getMetadata({
  title: "Privacy Policy",
  description:
    "How Ratiwal Dream Estates protects your personal information, handles property inquiries and WhatsApp communications, and keeps your data confidential.",
  slug: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPageLayout data={privacyPolicyData} />;
}
