import type { Metadata } from "next";
import localFont from 'next/font/local';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const quiapoFont = localFont({
  src: './fonts/Quiapo_Free.otf',     // path to your file
  variable: '--font-custom',         // Tailwind variable name
  display: 'swap',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pagsusi",
  description: "Machine Learning Analysis of Electoral Integrity in the 2025 Philippine Senate Elections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${quiapoFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
