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

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const reward = await prisma?.reward.findFirst({
    where: { id: params.rewardId }
  });

  if (!reward) return {};

  return {
    title: `${reward.name} Reward`,
    description: `Check out the ${reward.name} reward on Avocodos!`,
    openGraph: {
      images: [`/api/og?rewardId=${reward.id}`]
    }
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
  console.log("userReward", userReward);
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
