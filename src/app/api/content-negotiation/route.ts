import { NextRequest, NextResponse } from "next/server";
import { MarkdownGenerator } from "@/lib/markdown/markdown-generator";

export async function GET(req: NextRequest) {
  const targetPath = req.nextUrl.searchParams.get("path") || "/";

  let mdContent: string | null = null;

  if (targetPath === "/" || targetPath === "") {
    mdContent = await MarkdownGenerator.getHomepageMarkdown();
  } else if (targetPath === "/properties" || targetPath === "/properties/") {
    mdContent = await MarkdownGenerator.getPropertiesCatalogMarkdown();
  } else if (targetPath.startsWith("/properties/")) {
    const slug = targetPath.replace("/properties/", "").replace(/\/$/, "");
    mdContent = await MarkdownGenerator.getPropertyDetailMarkdown(slug);
  } else if (targetPath === "/locations" || targetPath === "/locations/") {
    mdContent = await MarkdownGenerator.getLocationsCatalogMarkdown();
  } else if (targetPath.startsWith("/locations/")) {
    const slug = targetPath.replace("/locations/", "").replace(/\/$/, "");
    mdContent = await MarkdownGenerator.getLocationDetailMarkdown(slug);
  } else if (targetPath === "/about" || targetPath === "/why-choose-us" || targetPath === "/investment") {
    mdContent = await MarkdownGenerator.getAboutMarkdown();
  } else if (targetPath === "/contact") {
    mdContent = await MarkdownGenerator.getContactMarkdown();
  }

  if (!mdContent) {
    return new NextResponse("# 404 Not Found\nThe requested resource does not exist or is not publicly published.", {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
      },
    });
  }

  return new NextResponse(mdContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Vary": "Accept",
    },
  });
}
