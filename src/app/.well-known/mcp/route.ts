import { GET as getMcpJson } from "../mcp.json/route";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return getMcpJson();
}
