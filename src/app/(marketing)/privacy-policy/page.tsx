import React from "react";
import { getMetadata } from "@/lib/seo";
import { privacyPolicyData } from "@/data/legal/privacyPolicyData";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = getMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Ratiwal Dream Estates protects your personal information, manages property inquiries, handles WhatsApp communications, and maintains strict confidentiality standards.",
  slug: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPageLayout data={privacyPolicyData} />;
}
