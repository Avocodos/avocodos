import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata, Viewport } from "next";
import SearchResults from "./SearchResults";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: { q: string };
}

export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  const title = q ? `Search results for "${q}"` : "Search";
  const description = q
    ? `Explore search results for "${q}" on Avocodos - The Web3 Social Platform For Aspiring Developers.`
    : "Search for users, communities, and content on Avocodos - The Web3 Social Platform For Aspiring Developers.";

  return {
    title,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/search"
    },
    openGraph: {
      title,
      description,
      url: "https://avocodos.com/search",
      siteName: "Avocodos",
      images: [`/api/og?page=search${q ? `&q=${encodeURIComponent(q)}` : ""}`],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@HarjjotSinghh",
      images: [`/api/og?page=search${q ? `&q=${encodeURIComponent(q)}` : ""}`]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Search",
      "Web3 Social",
      "Aptos Blockchain",
      "Cryptocurrency",
      "Blockchain Community",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Search",
      "Aptos Ecosystem",
      "Blockchain Social Media",
      "DeFi Community",
      "NFT Social Network",
      "Crypto Enthusiasts",
      "Web3 Networking",
      "Blockchain Education",
      "Aptos Development",
      "Decentralized Search",
      "Crypto Content Discovery",
      q
    ].filter(Boolean),
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
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

export default function Page({ searchParams: { q } }: PageProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-8">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h4 className="line-clamp-2 inline-flex items-center gap-3 break-all text-left">
            <Search className="size-6" />
            Search results for{" "}
            <span className="-ml-1.5 text-primary underline">{q}</span>
          </h4>
        </div>
        <SearchResults query={q} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
