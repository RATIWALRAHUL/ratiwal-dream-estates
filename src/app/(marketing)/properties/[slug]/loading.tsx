import { Container } from "@/components/shared/Container";

export default function PropertyLoading() {
  return (
    <div className="py-8 animate-pulse" aria-hidden="true">
      <Container>
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main skeleton loading */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="aspect-video w-full bg-gray-200 rounded" />
            <div className="h-32 w-full bg-gray-200 rounded" />
            <div className="h-48 w-full bg-gray-200 rounded" />
          </div>
          {/* Sidebar skeleton loading */}
          <div className="lg:col-span-1">
            <div className="h-96 w-full bg-gray-200 rounded" />
          </div>
        </div>
      </Container>
    </div>
  );
}
