import React from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import { getUserDataSelect } from "@/lib/types";
import RewardsGrid from "@/components/RewardsGrid";
import { Stars } from "lucide-react";

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const user = await prisma?.user.findFirst({
    where: { username: params.username }
  });

  if (!user) return {};

  return {
    title: `${user.displayName}'s Rewards`,
    description: `Check out ${user.displayName}'s rewards on Avocodos!`,
    openGraph: {
      images: [`/api/og?username=${user.username}&type=rewards`]
    }
  };
}

export default async function UserRewardsPage({
  params: { username }
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
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
    where: { userId: user.id },
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
