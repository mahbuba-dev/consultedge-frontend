import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import QueryProviders from "../providers/QueryProvider";
import LenisProvider from "../providers/LenisProvider";
import ScrollToTop from "@/components/modules/shared/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConsultEdge — Expert Consultation Marketplace",
  description:
    "Connect with verified experts and get guidance that gives you a real advantage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-360 flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            <QueryProviders>{children}</QueryProviders>
            <ScrollToTop />
          </LenisProvider>
          <Toaster richColors />
        </ThemeProvider>
        </div>
      </body>
    </html>
  );
}