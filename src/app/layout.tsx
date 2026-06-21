import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { AppHeader, AppFooter } from "@/features/shared";

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
    default: "Chordlet",
    template: "%s | Chordlet",
  },
  description: "Chordletは、コード譜を直感的に作成・編集して公開・共有できる無料サービスです。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Chordlet",
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
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <AuthProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <AppFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
