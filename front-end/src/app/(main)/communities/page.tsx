import React from "react";
import CommunitiesPage from "./CommunitiesPage";
import { Metadata, Viewport } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "Communities",
    description:
      "Explore and join Web3 communities on Avocodos - The Social Platform For Aspiring Developers.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/communities"
    },
    openGraph: {
      title: "Communities",
      description:
        "Explore and join Web3 communities on Avocodos - The Social Platform For Aspiring Developers.",
      url: "https://avocodos.com/communities",
      siteName: "Avocodos",
      images: ["/api/og?page=communities"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Communities",
      description:
        "Explore and join Web3 communities on Avocodos - The Social Platform For Aspiring Developers.",
      creator: "@HarjjotSinghh",
      images: ["/api/og?page=communities"]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Web3 Communities",
      "Blockchain Groups",
      "Crypto Communities",
      "Aptos Ecosystem",
      "Decentralized Social Network",
      "DeFi Communities",
      "NFT Groups",
      "Web3 Social Platform",
      "Blockchain Discussion Forums",
      "Crypto Enthusiasts Network",
      "Aptos Development Community",
      "Digital Asset Communities",
      "Web3 User Groups",
      "Blockchain Technology Forums",
      "Crypto Education Groups",
      "Aptos Smart Contract Communities",
      "Decentralized Finance Forums",
      "Web3 Innovation Hubs",
      "Blockchain Governance Groups"
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

export default function Communities() {
  return <CommunitiesPage />;
}
