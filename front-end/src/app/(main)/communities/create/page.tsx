import AddCommunityForm from "@/components/forms/AddCommunityForm";
import { Metadata, Viewport } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "Create Community",
    description:
      "Create a new community on Avocodos - The Web3 Social Platform For Aspiring Developers.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/communities/create"
    },
    openGraph: {
      title: "Create Community",
      description:
        "Create a new community on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      url: "https://avocodos.com/communities/create",
      siteName: "Avocodos",
      images: ["/api/og?page=create-community"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Create Community",
      description:
        "Create a new community on Avocodos - The Web3 Social Platform For Aspiring Developers.",
      creator: "@HarjjotSinghh",
      images: ["/api/og?page=create-community"]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Create Community",
      "Web3 Social",
      "Aptos Blockchain",
      "Cryptocurrency",
      "Blockchain Community",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Community Building",
      "Aptos Ecosystem",
      "Blockchain Social Media",
      "DeFi Community",
      "NFT Social Network",
      "Crypto Enthusiasts",
      "Web3 Networking",
      "Blockchain Education",
      "Aptos Development",
      "Decentralized Communities",
      "Crypto Group Creation",
      "Web3 User Engagement"
    ],
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

export default function CreateCommunityPage() {
  return (
    <div className="max-w-2xl pb-16 pt-5">
      <h2 className="mb-4 text-2xl font-bold">Create a New Community</h2>
      <AddCommunityForm />
    </div>
  );
}
