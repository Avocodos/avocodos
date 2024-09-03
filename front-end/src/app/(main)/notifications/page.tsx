import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Notifications from "./Notifications";
import { Bell } from "lucide-react";
import { Viewport } from "next";

export const metadata: Metadata = {
  title: "Notifications"
};

export function generateMetadata(): Metadata {
  return {
    title: "Notifications",
    description:
      "Stay updated with your latest notifications on Avocodos - The Web3 Social Platform For Aspiring Developers.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/notifications"
    },
    openGraph: {
      title: "Notifications",
      description:
        "Stay updated with your latest notifications on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      url: "https://avocodos.com/notifications",
      siteName: "Avocodos",
      images: ["/api/og?page=notifications"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Notifications",
      description:
        "Stay updated with your latest notifications on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      creator: "@HarjjotSinghh",
      images: ["/api/og?page=notifications"]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Notifications",
      "Web3 Social",
      "Aptos Blockchain",
      "Cryptocurrency",
      "Blockchain Community",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Updates",
      "Aptos Ecosystem",
      "Blockchain Social Media",
      "DeFi Community",
      "NFT Social Network",
      "Crypto Enthusiasts",
      "Web3 Networking",
      "Blockchain Education",
      "Aptos Development",
      "Decentralized Notifications",
      "Crypto Content Updates",
      "Web3 User Engagement"
    ],
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    applicationName: "Avocodos",
    referrer: "origin-when-cross-origin",
    appLinks: {
      web: {
        url: "https://avocodos.com",
        should_fallback: true
      }
    }
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#2fbe13" },
      { media: "(prefers-color-scheme: dark)", color: "#3bf019" }
    ]
  };
}

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="group rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-3">
            <Bell className="size-6 avocodos-transition group-hover:-rotate-12" />
            Notifications
          </h3>
        </div>
        <Notifications />
      </div>
      <TrendsSidebar />
    </main>
  );
}
