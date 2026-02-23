import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { AppHeader } from "@/features/shared";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: {
    default: "Chord Maker",
    template: "%s | Chord Maker",
  },
  description: "コード譜を作成・共有するプラットフォーム",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Chord Maker",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppHeader />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
