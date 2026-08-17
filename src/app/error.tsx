"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console, secure against database logging in production
    console.error("Render boundary failure:", error);
  }, [error]);

  return (
    <section className="py-24 text-center flex-grow flex items-center" aria-labelledby="error-title">
      <Container className="max-w-md">
        <h2 id="error-title" className="text-h2 text-primary-dark font-heading font-bold mb-4">
          Something went wrong
        </h2>
        <p className="text-body text-text-muted mb-8 leading-relaxed">
          We encountered an error processing your request. Try recovering the state or return to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={reset} variant="primary" className="focus-visible:outline">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="focus-visible:outline">
              Return Home
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
