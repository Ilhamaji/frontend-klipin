import type { Metadata, Viewport } from "next";
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

// Explicit mobile viewport: without width=device-width phones render at a
// wide virtual viewport and scale everything down, which made the auth pages
// look tiny and shifted the logo out of view.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

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
