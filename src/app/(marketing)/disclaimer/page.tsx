import React from "react";
import { getMetadata } from "@/lib/seo";
import { disclaimerData } from "@/data/legal/disclaimerData";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata = getMetadata({
  title: "RERA & Legal Disclaimer",
  description:
    "Statutory real estate disclaimer, RERA compliance disclosure, title diligence advisory, and dynamic pricing disclosures for Ratiwal Dream Estates.",
  slug: "/disclaimer",
});

export default function DisclaimerPage() {
  return <LegalPageLayout data={disclaimerData} />;
}
