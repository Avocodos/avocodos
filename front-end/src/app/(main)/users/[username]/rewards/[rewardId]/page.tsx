import React from "react";
import { Metadata, ResolvingMetadata, Viewport } from "next";
import prisma from "@/lib/prisma";
import SpinningImageDialog from "@/components/SpinningImageDialog";
import { notFound } from "next/navigation";
import kyInstance from "@/lib/ky";
import { User } from "@prisma/client";
import { headers } from "next/headers";
import { validateRequest } from "@/auth";
import { UserData } from "@/lib/types";
import { SearchParamsOption } from "ky";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { username: string; rewardId: string };
}

async function getReward(username: string, rewardId: string) {
  const reward = await prisma?.userReward.findFirst({
    where: {
      id: rewardId
    },
    include: {
      user: true
    }
  });

  console.log("reward", reward);
  console.log("username", username);
  console.log("reward.user.username", reward?.user.username);
  console.log("reward.user", reward?.user);

  if (!reward || reward.user.username !== username) {
    console.log("here");
    notFound();
  }

  const reward_ = await prisma?.reward.findFirst({
    where: { id: reward.rewardId }
  });

  return { ...reward, reward: reward_ };
}

export async function generateMetadata(
  { params: { username, rewardId } }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const reward = await getReward(username, rewardId);
  const previousImages = (await parent).openGraph?.images || [];
  const description = `${reward.user.displayName} earned the ${reward.reward?.name} reward on Avocodos. ${reward.reward?.description || ""}`;

  return {
    title: `${reward.reward?.name} - ${reward.user.displayName}'s Reward`,

    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/users/${username}/rewards/${rewardId}`
    },
    openGraph: {
      title: `${reward.reward?.name} - ${reward.user.displayName}'s Reward`,

      description,
      url: `https://avocodos.com/users/${username}/rewards/${rewardId}`,
      siteName: "Avocodos",
      images: [`/api/og?rewardId=${rewardId}`, ...previousImages],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${reward.reward?.name} - ${reward.user.displayName}'s Reward`,

      description,
      creator: "@HarjjotSinghh",
      images: [`/api/og?rewardId=${rewardId}`]
    },
    category: "Web3 Social Platform",
    keywords: [
      reward.reward?.name ?? "",
      reward.user.displayName,
      "Avocodos",
      "Web3 Rewards",
      "Blockchain Achievements",
      "Crypto Rewards",
      "Aptos Ecosystem",
      "Decentralized Social Network",
      "Web3 Gamification",
      "Blockchain Incentives",
      "Crypto Social Platform",
      "Web3 User Engagement",
      "Blockchain Social Media",
      "DeFi Rewards",
      "NFT Achievements",
      "Web3 User Recognition",
      "Blockchain Community Rewards",
      "Crypto Loyalty Program",
      "Aptos Network Rewards",
      "Decentralized Identity Achievements"
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

const getUserIdFromUsername = async (username: string) => {
  const userData = await prisma?.user.findFirst({
    where: {
      username: username
    }
  });
  if (!userData) {
    notFound();
  }
  return userData.id;
};

export default async function RewardPage({ params }: PageProps) {
  const userId = await getUserIdFromUsername(params.username);
  const userReward = await prisma?.userReward.findFirst({
    where: {
      rewardId: params.rewardId,
      userId: userId
    },
    include: {
      reward: true
    }
  });
  if (!userReward) {
    return <p>Reward not found</p>;
  }

  return (
    <div className="flex h-fit w-full flex-col items-start justify-start gap-6">
      <Link href={`/users/${params.username}/rewards`}>
        <Button
          className="inline-flex w-fit items-center gap-2"
          variant="default"
          size="sm"
        >
          <ArrowLeft className="size-4" />
          Back to all rewards
        </Button>
      </Link>
      <SpinningImageDialog
        isOpen={true}
        // onClose={() => {}}
        imageUrl={"/auth.webp"}
        rewardName={userReward.reward.name}
        owned={userReward.progress >= userReward.reward.requirement}
        reward={userReward.reward}
        progress={userReward.progress}
        username={params.username}
        type="page"
      />
    </div>
  );
}
