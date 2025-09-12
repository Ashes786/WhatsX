import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhatsX - Messaging Automation Prototype",
  description: "Create templates, manage users, and safely prepare bulk sends with smart duplicate handling.",
  keywords: ["WhatsX", "Messaging", "Automation", "WhatsApp", "Prototype"],
  authors: [{ name: "WhatsX Team" }],
  openGraph: {
    title: "WhatsX - Messaging Automation Prototype",
    description: "Create templates, manage users, and safely prepare bulk sends with smart duplicate handling.",
    url: "https://chat.z.ai",
    siteName: "WhatsX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsX - Messaging Automation Prototype",
    description: "Create templates, manage users, and safely prepare bulk sends with smart duplicate handling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProviderWrapper>
          {children}
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
