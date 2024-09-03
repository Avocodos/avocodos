import React from "react";
import { Metadata } from "next";
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

export async function generateStaticParams() {
  const userRewards = await prisma?.userReward.findMany({
    select: {
      user: {
        select: {
          username: true
        }
      },
      rewardId: true
    }
  });

  return (
    userRewards?.map((userReward) => ({
      username: userReward.user.username,
      rewardId: userReward.rewardId
    })) ?? []
  );
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const user = await prisma?.user.findFirst({
    where: { username: params.username },
    select: {
      displayName: true,
      username: true
    }
  });

  const reward = await prisma?.reward.findFirst({
    where: { id: params.rewardId }
  });

  if (!user || !reward) return {};

  return {
    title: `${reward.name} | ${user.displayName}'s Reward`,
    description: `Check out ${user.displayName}'s "${reward.name}" reward on Avocodos!`,
    openGraph: {
      images: [`/api/og?username=${user.username}&rewardId=${reward.id}`]
    },
    keywords: [
      reward.name,
      `${reward.name} reward`,
      `${reward.name} on Avocodos`,
      `${user.displayName} ${reward.name}`,
      `${user.displayName} ${reward.name} reward`,
      `${user.displayName} ${reward.name} on Avocodos`,
      `${user.displayName} rewards`,
      `${user.displayName} reward`,
      `${user.displayName} reward on Avocodos`,
      `${user.displayName} ${reward.name}`,
      `${user.displayName} ${reward.name} reward`,
      `${user.displayName} ${reward.name} on Avocodos`
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
  console.log("userId", userId);
  console.log("params.rewardId", params.rewardId);
  const userReward = await prisma?.userReward.findFirst({
    where: {
      rewardId: decodeURI(params.rewardId),
      userId
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
