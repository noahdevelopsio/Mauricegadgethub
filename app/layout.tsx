import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Maurice Gadgets Hub",
  description: "Apple-inspired minimalist e-commerce platform for premium consumer gadgets in Ikeja, Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-canvas text-ink min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
