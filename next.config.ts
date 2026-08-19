import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/rera",
        destination: "/disclaimer",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/properties",
        permanent: true,
      },
      {
        source: "/plots",
        destination: "/properties",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
