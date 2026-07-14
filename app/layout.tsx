import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mauricegadgetshub.com"),
  title: {
    default: "Maurice Gadgets Hub | Genuine Tech & Electronics in Ikeja, Lagos",
    template: "%s | Maurice Gadgets Hub",
  },
  description: "Shop 100% genuine iPhones, Samsung smartphones, PlayStation consoles, and premium accessories in Ikeja, Lagos. Secure local payment options and fast delivery across Nigeria.",
  keywords: [
    "buy iphone lagos",
    "genuine phones ikeja",
    "playstation console lagos",
    "earbuds price nigeria",
    "original charging accessories",
    "best tech store lagos",
    "maurice gadgets hub",
    "authorized reseller nigeria"
  ],
  authors: [{ name: "Maurice Gadgets Hub", url: "https://mauricegadgetshub.com" }],
  creator: "Maurice Gadgets Hub",
  publisher: "Maurice Gadgets Hub",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://mauricegadgetshub.com",
    title: "Maurice Gadgets Hub | Genuine Tech & Electronics in Lagos",
    description: "Shop 100% genuine iPhones, Samsung, PlayStation, and audio gear in Lagos. Fast courier delivery and official store warranty.",
    siteName: "Maurice Gadgets Hub",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Maurice Gadgets Hub Logo",
      }
    ],
  },
  twitter: {
    card: "summary",
    title: "Maurice Gadgets Hub | Genuine Tech & Electronics",
    description: "Shop authentic iPhones, Samsung, PlayStation, and premium accessories in Lagos.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
