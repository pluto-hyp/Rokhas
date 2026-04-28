import type { Metadata } from "next";
import { EB_Garamond, Inter, Geist } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { cn } from "@/lib/utils";

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: "--font-serif",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn(ebGaramond.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased selection:bg-[#1E3A8A] selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}