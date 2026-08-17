import { Container } from "@/components/shared/Container";

export default function RootLoading() {
  return (
    <div className="py-24 flex items-center justify-center flex-grow" aria-live="polite" aria-busy="true">
      <Container className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-blue border-t-transparent" />
        <span className="text-sm text-text-muted mt-4 font-medium">Loading Ratiwal Dream Estates...</span>
      </Container>
    </div>
  );
}
