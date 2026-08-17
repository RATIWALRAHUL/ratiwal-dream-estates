"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Root Layout Render failure:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-text-main flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading font-semibold text-2xl text-primary-dark mb-4">
          Critical System Error
        </h2>
        <p className="text-sm text-text-muted max-w-sm mb-8 leading-relaxed">
          A critical failure occurred in the core application layout. We apologize for the inconvenience.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3.5 bg-primary-blue text-white rounded font-medium hover:bg-primary-dark transition-colors focus-visible:outline"
        >
          Reset Application
        </button>
      </body>
    </html>
  );
}
