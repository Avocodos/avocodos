"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SpinningImageDialog from "@/components/SpinningImageDialog";
import { Reward, UserReward } from "@prisma/client";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface RewardsGridProps {
  userRewards: (UserReward & { reward: Reward })[];
  username: string;
}

export default function RewardsGrid({
  userRewards,
  username
}: RewardsGridProps) {
  const [selectedReward, setSelectedReward] = React.useState<
    (UserReward & { reward: Reward }) | null
  >(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {userRewards.map((userReward) => (
          <Card
            key={userReward.id}
            className="group cursor-pointer border-2 border-muted"
            onClick={() => setSelectedReward(userReward)}
          >
            <CardHeader className="overflow-hidden rounded-t-lg p-0">
              <img
                src={userReward.reward.imageUrl ?? "/auth.webp"}
                alt={userReward.reward.name}
                width={500}
                height={500}
                className="aspect-square rounded-t-lg object-cover avocodos-transition group-hover:scale-105"
              />
            </CardHeader>
            <CardContent className="flex w-full flex-row items-start justify-between gap-4 pt-6">
              <div>
                <h5>{userReward.reward.name}</h5>
                <p className="mb-2 text-sm text-foreground/80">
                  {userReward.reward.description}
                </p>
              </div>
              <CheckCircle className="mt-2 size-7 text-primary" />
              {/* <Progress
                value={
                  (userReward.progress / userReward.reward.requirement) * 100
                }
                className="mb-2"
              />
              <p className="text-sm text-foreground/80">
                {userReward.progress} / {userReward.reward.requirement}{" "}
                completed
              </p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      {userRewards.length === 0 && (
        <p className="text-center text-foreground/80">No rewards, yet... 👀</p>
      )}
      {selectedReward && (
        <SpinningImageDialog
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          imageUrl={selectedReward.reward.imageUrl ?? "/auth.webp"}
          rewardName={selectedReward.reward.name}
          username={username}
          reward={selectedReward.reward}
          progress={selectedReward.progress}
          owned={selectedReward.claimed}
        />
      )}
    </>
  );
}
