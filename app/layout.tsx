import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tradeet.app"),
  title: {
    default: "TradeET — #1 Trading Journal in Ethiopia | Trade Smarter",
    template: "%s | TradeET — Trading Journal Ethiopia",
  },
  description: "TradeET is Ethiopia's #1 trading journal platform. Track your trades, analyze performance with ETB currency support, and improve your trading psychology. Built specifically for Ethiopian forex, crypto, and stock traders.",
  keywords: [
    "trading in ethiopia",
    "trade et",
    "trading journal",
    "forex trading ethiopia",
    "crypto trading ethiopia",
    "ethiopian traders",
    "trading journal app",
    "trade tracking ethiopia",
    "forex journal",
    "trading analytics",
    "trading psychology",
    "ETB trading",
    "ethiopian birr trading",
    "day trading ethiopia",
    "trading performance tracker",
  ],
  authors: [{ name: "TradeET" }],
  creator: "TradeET",
  publisher: "TradeET",
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
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: "https://tradeet.app",
    siteName: "TradeET",
    title: "TradeET — Ethiopia's #1 Trading Journal Platform",
    description: "Track, analyze, and improve your trades with Ethiopia's premier trading journal. Multi-currency support including ETB.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TradeET - Trading Journal for Ethiopian Traders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeET — Ethiopia's #1 Trading Journal",
    description: "Track, analyze, and improve your trades. Built for Ethiopian traders with ETB support.",
    images: ["/og-image.png"],
    creator: "@tradeet",
  },
  alternates: {
    canonical: "https://tradeet.app",
  },
  category: "Finance",
  classification: "Trading Journal, Financial Tools",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TradeET",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description: "Ethiopia's premier trading journal platform for forex, crypto, and stock traders. Track trades, analyze performance with ETB currency support.",
  url: "https://tradeet.app",
  image: "https://tradeet.app/og-image.png",
  author: {
    "@type": "Organization",
    name: "TradeET",
    url: "https://tradeet.app",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ETB",
    description: "Free plan available with up to 50 trades",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "50",
  },
  featureList: [
    "Equity Curve Analytics",
    "Daily P&L Breakdown",
    "Trade Calendar",
    "Psychology Tags",
    "Trader Performance Score",
    "ETB Currency Converter",
  ],
  areaServed: {
    "@type": "Country",
    name: "Ethiopia",
  },
  inLanguage: ["en", "am"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ET" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
