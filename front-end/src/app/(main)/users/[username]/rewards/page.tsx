import React from "react";
import { Metadata, Viewport } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import { getUserDataSelect } from "@/lib/types";
import RewardsGrid from "@/components/RewardsGrid";
import { Stars } from "lucide-react";
import Link from "next/link";
import { RewardRequirementType } from "@prisma/client";

interface PageProps {
  params: { username: string };
}

export async function generateStaticParams(): Promise<{ username: string }[]> {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  const usernames: string[] = []; // Array to hold valid usernames

  try {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const users = await prisma?.user.findMany({
        select: { username: true }
      });

      if (users) {
        usernames.push(...users.map((user) => user.username));
        break; // Exit loop if users are found
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }

  return usernames.map((username) => ({ username })); // Return usernames for static generation
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const user = await prisma?.user.findFirst({
    where: { username: params.username },
    select: {
      displayName: true,
      username: true,
      avatarUrl: true,
      _count: {
        select: {
          userRewards: true
        }
      }
    }
  });

  if (!user) return {};

  const description = `Explore ${user.displayName}'s rewards on Avocodos. Discover the achievements and milestones they've unlocked in their Web3 journey.`;

  return {
    title: `${user.displayName}'s Rewards`,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/users/${user.username}/rewards`
    },
    openGraph: {
      title: `${user.displayName}'s Rewards`,
      description,
      url: `https://avocodos.com/users/${user.username}/rewards`,
      siteName: "Avocodos",
      images: [
        user.avatarUrl || `/api/og?username=${user.username}&type=rewards`
      ],
      locale: "en_US",
      type: "profile"
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.displayName}'s Rewards`,
      description,
      creator: "@HarjjotSinghh",
      images: [
        user.avatarUrl || `/api/og?username=${user.username}&type=rewards`
      ]
    },
    category: "Web3 Social Platform",
    keywords: [
      user.displayName,
      user.username,
      "Avocodos",
      "Web3 Rewards",
      "Blockchain Achievements",
      "Crypto Milestones",
      "NFT Rewards",
      "Digital Assets",
      "Web3 Social Platform",
      "Blockchain Social Network",
      "Crypto Community",
      "User Achievements",
      "Web3 Gamification",
      "Blockchain Incentives",
      "Crypto Rewards System",
      "Digital Collectibles",
      "Web3 User Profile",
      "Blockchain User Rewards",
      "Crypto Social Achievements",
      "NFT Collection",
      "Web3 User Engagement",
      "Blockchain Social Rewards",
      "Crypto User Milestones",
      "Digital Badges",
      "Web3 Loyalty Program",
      "Blockchain User Recognition",
      "Crypto Social Incentives",
      "NFT Achievements",
      "Web3 User Progress",
      "Blockchain Social Gamification",
      "Crypto Community Rewards",
      "Digital Trophies",
      "Web3 User Accomplishments",
      "Blockchain Social Milestones",
      "Crypto Profile Achievements",
      "NFT Milestones",
      "Web3 Social Recognition",
      "Blockchain User Accomplishments",
      "Crypto Reward Tokens",
      "Digital Achievement Showcase",
      "Web3 Community Engagement",
      "Blockchain Social Incentives",
      "Crypto User Achievements",
      "NFT Reward System",
      "Web3 User Incentives",
      "Blockchain Community Rewards",
      "Crypto Social Gamification",
      "Digital Reward Tokens",
      "Web3 Achievement Unlocks",
      "Blockchain User Progress",
      "Crypto Milestone Tracking",
      "NFT Social Rewards",
      "Web3 User Recognition",
      "Blockchain Achievement System",
      "Crypto Community Milestones",
      "Digital Social Incentives",
      "Web3 Reward Ecosystem",
      "Blockchain User Engagement",
      "Crypto Achievement Badges",
      "NFT Progress Tracking",
      "Web3 Social Milestones",
      "Blockchain Reward Tokens",
      "Crypto User Recognition",
      "Digital Achievement Tokens",
      "Web3 Community Milestones",
      "Blockchain Social Progress",
      "Crypto Engagement Rewards",
      "NFT Achievement System",
      "Web3 User Milestones",
      "Blockchain Community Achievements",
      "Crypto Social Recognition",
      "Digital Reward Ecosystem",
      "Web3 Achievement Tracking",
      "Blockchain User Incentives",
      "Crypto Progress Badges",
      "NFT Community Rewards",
      "Web3 Social Achievements",
      "Blockchain Milestone System",
      "Crypto User Engagement",
      "Digital Social Rewards",
      "Web3 Reward Tokens",
      "Blockchain Achievement Tracking",
      "Crypto Community Recognition",
      "NFT User Milestones",
      "Web3 Social Progress",
      "Blockchain Engagement Rewards",
      "Crypto Achievement System",
      "Digital User Incentives",
      "Web3 Community Recognition",
      "Blockchain Social Achievements",
      "Crypto Milestone Rewards",
      "NFT Progress System",
      "Web3 User Engagement Tracking",
      "Blockchain Reward Ecosystem",
      "Crypto Social Milestones",
      "Digital Achievement Recognition",
      "Web3 Progress Badges",
      "Blockchain Community Milestones",
      "Crypto User Incentives",
      "NFT Social Achievements",
      "Web3 Milestone Tracking",
      "Blockchain Social Recognition",
      "Crypto Engagement System",
      "Digital Reward Badges",
      "Web3 Achievement Ecosystem",
      "Blockchain User Milestones",
      "Crypto Community Engagement",
      "NFT User Recognition",
      "Web3 Social Incentives",
      "Blockchain Progress Tracking",
      "Crypto Achievement Tokens",
      "Digital Milestone System"
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

export default async function UserRewardsPage({
  params: { username }
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page. Please{" "}
        <Link className="underline" href="/login">
          login
        </Link>{" "}
        to view this page.
      </p>
    );
  }

  const user = await prisma?.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive"
      }
    },
    select: getUserDataSelect(loggedInUser.id)
  });

  if (!user) notFound();

  const userRewards = await prisma?.userReward.findMany({
    where: { userId: user.id, claimed: true },
    include: { reward: true }
  });

  return (
    <main className="mx-auto max-w-7xl">
      <h3 className="mb-6 inline-flex items-center gap-3">
        <Stars className="size-7" />@{user.displayName}&apos;s Rewards
      </h3>
      <RewardsGrid userRewards={userRewards ?? []} username={user.username} />
    </main>
  );
}
