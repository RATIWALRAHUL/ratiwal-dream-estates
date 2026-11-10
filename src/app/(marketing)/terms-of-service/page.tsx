import React from "react";
import { getMetadata } from "@/lib/seo";
import { termsOfServiceData } from "@/data/legal/termsOfServiceData";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = getMetadata({
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Ratiwal Dream Estates website, including property inquiries, consultation services and corridor intelligence tools.",
  slug: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return <LegalPageLayout data={termsOfServiceData} />;
}
