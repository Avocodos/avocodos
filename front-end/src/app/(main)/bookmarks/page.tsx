import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata, Viewport } from "next";
import Bookmarks from "./Bookmarks";
import { Bookmark } from "lucide-react";

export function generateMetadata(): Metadata {
  return {
    title: "Bookmarks",
    description:
      "Access your saved content on Avocodos - The Web3 Social Platform For Aspiring Developers.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/bookmarks"
    },
    openGraph: {
      title: "Bookmarks",
      description:
        "Access your saved content on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      url: "https://avocodos.com/bookmarks",
      siteName: "Avocodos",
      images: ["/api/og?page=bookmarks"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Bookmarks",
      description:
        "Access your saved content on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      creator: "@HarjjotSinghh",
      images: ["/api/og?page=bookmarks"]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Bookmarks",
      "Saved Content",
      "Web3 Social",
      "Aptos Blockchain",
      "Cryptocurrency",
      "Blockchain Community",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Content Curation",
      "Aptos Ecosystem",
      "Blockchain Social Media",
      "DeFi Community",
      "NFT Social Network",
      "Crypto Enthusiasts",
      "Web3 Networking",
      "Blockchain Education",
      "Aptos Development",
      "Decentralized Bookmarks",
      "Crypto Content Saving",
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
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2">
            <Bookmark className="size-8" /> Bookmarks
          </h3>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </main>
  );
}
