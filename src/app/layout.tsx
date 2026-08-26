import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { getMetadata } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = getMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${jakarta.variable} ${mono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-white text-text-main flex flex-col font-body antialiased selection:bg-[#087fc3] selection:text-white">
        {children}
      </body>
    </html>
  );
}
