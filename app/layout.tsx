import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["italic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Urban Heat Island Intelligence — Bengaluru Municipal Corporation",
  description:
    "Decision engine for hyper-local heat vulnerability assessment, causal attribution, and intervention planning.",
};

export const viewport: Viewport = {
  themeColor: "#EDE6D3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} ${newsreader.variable} bg-bone`}
    >
      <body className="font-mono antialiased bg-bone text-ink min-h-screen">
        <div className="paper-grain" />
        {/* Registration marks */}
        <span
          className="fixed top-2 left-2 text-[8px] font-mono text-graphite pointer-events-none z-50"
          aria-hidden="true"
        >
          +
        </span>
        <span
          className="fixed top-2 right-2 text-[8px] font-mono text-graphite pointer-events-none z-50"
          aria-hidden="true"
        >
          +
        </span>
        <span
          className="fixed bottom-2 left-2 text-[8px] font-mono text-graphite pointer-events-none z-50"
          aria-hidden="true"
        >
          +
        </span>
        <span
          className="fixed bottom-2 right-2 text-[8px] font-mono text-graphite pointer-events-none z-50"
          aria-hidden="true"
        >
          +
        </span>
        {children}
        {/* Analytics removed — using Cloudflare Pages native analytics instead */}
      </body>
    </html>
  );
}
