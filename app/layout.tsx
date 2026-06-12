import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tenimtv.com"),
  title: {
    default: "TenimTV - Live Sports Streaming",
    template: "%s | TenimTV"
  },
  description: "Watch live football, cricket, and global sports fixtures in real-time. Access high-quality streaming servers, live scores, lineups, pregame form, and head-to-head stats.",
  keywords: ["live sports streaming", "cricket streams", "football streams", "live football stream", "watch cricket online", "free sports streaming", "match insights", "TenimTV"],
  authors: [{ name: "TenimTV Team" }],
  creator: "TenimTV Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tenimtv.com",
    title: "TenimTV - Live Sports Streaming",
    description: "Watch live football, cricket, and global sports fixtures in real-time. Access high-quality streaming servers, live scores, lineups, and head-to-head stats.",
    siteName: "TenimTV",
  },
  twitter: {
    card: "summary_large_image",
    title: "TenimTV - Live Sports Streaming",
    description: "Watch live football, cricket, and global sports fixtures in real-time. Access high-quality streaming servers, live scores, lineups, and head-to-head stats.",
    creator: "@tenimtv",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-emerald-500/30 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
