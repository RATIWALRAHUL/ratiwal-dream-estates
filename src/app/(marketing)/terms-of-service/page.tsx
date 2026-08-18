import React from "react";
import { getMetadata } from "@/lib/seo";
import { termsOfServiceData } from "@/data/legal/termsOfServiceData";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = getMetadata({
  title: "Terms of Service",
  description:
    "Review the terms and conditions governing your use of the Ratiwal Dream Estates real-estate advisory portal, property inquiries, consultation services, and corridor intelligence tools.",
  slug: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return <LegalPageLayout data={termsOfServiceData} />;
}
