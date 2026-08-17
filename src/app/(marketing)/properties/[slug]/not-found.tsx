import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

export default function PropertyNotFound() {
  return (
    <section className="py-24 text-center" aria-labelledby="notfound-title">
      <Container>
        <h2 id="notfound-title" className="text-h2 text-primary-dark font-heading font-bold mb-4">
          Property Not Found
        </h2>
        <p className="text-body text-text-muted max-w-md mx-auto mb-8">
          The property plot you requested is either unavailable, has been sold out, or does not exist.
        </p>
        <Link href="/properties">
          <Button variant="primary" className="focus-visible:outline">
            Browse All Plots
          </Button>
        </Link>
      </Container>
    </section>
  );
}
