import type { Metadata } from "next";
import { EB_Garamond, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: "--font-serif",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Rokhas",
  description: "Digital Administration Platform",
  icons: {
    icon: [{ url: "/rokhas.svg", type: "image/svg+xml" }],
    shortcut: "/rokhas.svg",
    apple: "/rokhas.svg",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={cn(ebGaramond.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased selection:bg-[#1E3A8A] selection:text-white">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
