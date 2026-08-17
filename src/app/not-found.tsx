import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

export default function RootNotFound() {
  return (
    <section className="py-24 text-center flex-grow flex items-center" aria-labelledby="notfound-title">
      <Container>
        <h1 className="text-display text-primary-dark font-bold mb-2">404</h1>
        <h2 id="notfound-title" className="text-h2 text-primary-dark font-heading font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-body text-text-muted max-w-md mx-auto mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="primary" className="focus-visible:outline">
            Go to Homepage
          </Button>
        </Link>
      </Container>
    </section>
  );
}
