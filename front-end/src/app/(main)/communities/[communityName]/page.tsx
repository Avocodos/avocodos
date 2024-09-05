import { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CommunityPage from "./CommunityPage";

interface PageProps {
  params: { communityName: string };
}

export async function generateStaticParams(): Promise<
  {
    communityName: string;
  }[]
> {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const communities = await prisma?.community.findMany({
        select: { name: true }
      });

      if (!communities) return [];

      return communities.map((community) => ({
        communityName: community.name
      }));
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) return []; // Rethrow after max retries
      await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
    }
  }
  return [];
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const community = await prisma?.community.findUnique({
    where: { name: params.communityName },
    include: {
      _count: {
        select: {
          members: true,
          posts: true
        }
      }
    }
  });

  if (!community) return {};

  const previousImages = (await parent).openGraph?.images || [];

  const description = `Join the ${community.name} community on Avocodos. ${community.description || ""} Members: ${community._count.members}, Posts: ${community._count.posts}`;

  return {
    title: `${community.name} Community`,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/communities/${community.name}`
    },
    openGraph: {
      title: `${community.name} Community`,
      description,
      url: `https://avocodos.com/communities/${community.name}`,
      siteName: "Avocodos",
      images: [`/api/og?communityName=${community.name}`, ...previousImages],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${community.name} Community`,
      description,
      creator: "@HarjjotSinghh",
      images: [`/api/og?communityName=${community.name}`]
    },
    category: "Web3 Social Platform",
    keywords: [
      community.name,
      "Avocodos",
      "Web3 Community",
      "Blockchain Social",
      "Crypto Discussion",
      "Aptos Ecosystem",
      "Decentralized Community",
      "DeFi Forum",
      "Aptos Network",
      "Web3 Social Platform",
      "Blockchain Discussion",
      "Crypto Community",
      "Aptos Development",
      "Digital Asset Community",
      "Web3 User Group",
      "Blockchain Enthusiasts",
      "Crypto Social Network",
      "Aptos Blockchain",
      "Decentralized Social",
      "Web3 Networking",
      "Blockchain Technology",
      "Crypto Education",
      "Aptos Smart Contracts",
      "NFT Community",
      "Web3 Innovation",
      "Blockchain Governance",
      "Crypto Market Analysis",
      "Aptos DApps",
      "Decentralized Finance",
      "Web3 Infrastructure"
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

export default async function Page({ params: { communityName } }: PageProps) {
  const community = await prisma?.community.findUnique({
    where: { name: communityName },
    include: {
      members: true,
      posts: {
        include: {
          user: true,
          _count: {
            select: { comments: true, likes: true }
          }
        }
      },
      _count: {
        select: { members: true, posts: true }
      },
      badges: true,
      moderators: true,
      roles: true,
      creator: true
    }
  });

  if (!community) notFound();

  return <CommunityPage communityName={communityName} />;
}
