import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Rokhas",
  description: "Digital Administration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${ebGaramond.variable}`}>
        <body className="font-sans antialiased selection:bg-[#B11E47] selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}