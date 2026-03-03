import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Deep Dive Into Your Trading Performance",
  description: "Advanced trading analytics including win rate, profit factor, performance score, and detailed trade statistics. Analyze your trading edge with TradeET's comprehensive analytics.",
  alternates: {
    canonical: "https://tradeet.app/analytics",
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
