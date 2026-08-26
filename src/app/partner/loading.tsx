import { LogoLoader } from "@/components/ui/LogoLoader";

export default function PartnerLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <LogoLoader variant="section" text="Loading Partner Portal..." />
    </div>
  );
}
