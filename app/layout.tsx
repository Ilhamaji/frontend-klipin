import type { Metadata } from "next";
import { Geist, Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klipin (Demo) - The Research System",
  description: "AI-powered academic research and summary tool.",
  icons: {
    icon: [
      { url: "/klipin.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/klipin.png",
    apple: "/klipin.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${hanken.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-on-background font-inter font-[family-name:var(--font-inter)]">
          {children}
      </body>
    </html>
  );
}
