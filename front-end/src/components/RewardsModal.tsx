"use client";
import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import kyInstance from "@/lib/ky";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Reward,
  RewardRequirementType,
  User,
  UserReward
} from "@prisma/client";
import { CheckCircle, Loader2, Percent, Stars } from "lucide-react";
import RewardsSkeleton from "./skeletons/RewardsSkeleton";
import { Badge } from "@/components/ui/badge";
import SpinningImageDialog from "./SpinningImageDialog";
import { UserData } from "@/lib/types";
import Confetti from "react-confetti";

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
}

export default function RewardsModal({
  isOpen,
  onClose,
  user
}: RewardsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchUser = async (): Promise<User> => {
    const data = await kyInstance
      .get(`/api/users/username/${user.username}`)
      .json<User>();
    return data;
  };

  const fetchRewards = async (): Promise<Record<string, Reward[]>> => {
    const data = await kyInstance.get("/api/rewards").json<Reward[]>();
    const res = data.reduce(
      (acc, reward) => {
        if (!acc[reward.requirementType]) {
          acc[reward.requirementType] = [];
        }
        acc[reward.requirementType].push(reward);
        return acc;
      },
      {} as Record<string, Reward[]>
    );
    return res;
  };

  const fetchUserClaimedRewards = async (): Promise<UserReward[]> => {
    const data = await kyInstance
      .get(`/api/rewards/claimed/${user.id}`)
      .json<UserReward[]>();
    return data;
  };

  const fetchUserRewards = async (): Promise<
    Record<RewardRequirementType, number>
  > => {
    const data = await kyInstance
      .get(`/api/rewards/user/${user.id}`)
      .json<Record<RewardRequirementType, number>>();
    return data;
  };

  const {
    data: rewardsByCategory,
    isLoading,
    error
  } = useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
    enabled: isOpen,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const {
    data: userRewards,
    isLoading: isUserRewardsLoading,
    error: userRewardsError
  } = useQuery({
    queryKey: ["userRewards", user.id],
    queryFn: fetchUserRewards,
    enabled: isOpen
  });

  const { data: userData } = useQuery({
    queryKey: ["userData", user.id],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${user.username}`).json<User>(),
    enabled: isOpen
  });

  const { data: userClaimedRewards } = useQuery({
    queryKey: ["userClaimedRewards", user.id],
    queryFn: fetchUserClaimedRewards,
    enabled: isOpen
  });

  const claimRewardMutation = useMutation({
    mutationFn: (rewardId: string) => {
      console.log("rewardId", rewardId);
      console.log("user.id", user.id);
      return kyInstance
        .post("/api/rewards/claim", { json: { rewardId, userId: user.id } })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRewards", user.id] });
      queryClient.invalidateQueries({
        queryKey: ["userClaimedRewards", user.id]
      });
      toast({
        title: "Success",
        description: "Reward claimed successfully!"
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    },
    onError: (error: any) => {
      console.error("Error claiming reward:", error);
      let errorMessage = "Failed to claim reward. Please try again.";
      if (error.response) {
        // If the error has a response, try to get the error message from it
        errorMessage = error.response.data?.error || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ["userRewards", user.id] });
      queryClient.invalidateQueries({
        queryKey: ["userClaimedRewards", user.id]
      });
    }
  }, [isOpen, queryClient, user.id]);

  const capitalizeWords = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Calculate the number of rewards owned by checking if the progress is 100% for each reward
  const numberOfRewardsOwned = Object.values(rewardsByCategory || {}).reduce(
    (total, rewards) => {
      return (
        total +
        rewards.filter((reward: Reward) => {
          const progress = userRewards?.[reward.requirementType] || 0;
          return progress >= reward.requirement;
        }).length
      );
    },
    0
  );
  // must include all the rewards in the rewardsByCategory object
  const numberOfRewards = Object.values(rewardsByCategory || {}).reduce(
    (total, rewards) => {
      return total + rewards.length;
    },
    0
  );

  if (error)
    return (
      <p className="text-center text-destructive">Error loading rewards</p>
    );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth - 20}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={50}
          style={{ zIndex: 2000 }}
        />
      )}
      <DialogContent className="min-w-[90dvw] p-8 lg:min-w-[60dvw]">
        <ScrollArea className="h-[400px] lg:h-[600px]">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-3">
                  <Stars className="size-7" /> Rewards Progress{" "}
                  {/* <span className="text-lg font-semibold text-foreground/80">
                    (@{user.username})
                  </span> */}
                </h3>
                {!isUserRewardsLoading && (
                  <Badge
                    className="mr-2 inline-flex items-center gap-2 text-sm"
                    variant={"light"}
                  >
                    <Percent className="size-3.5" />
                    {numberOfRewardsOwned} / {numberOfRewards} Rewards Owned (
                    {Math.round((numberOfRewardsOwned / numberOfRewards) * 100)}
                    %)
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-8 space-y-8">
            {(isLoading || isUserRewardsLoading) && <RewardsSkeleton />}
            {!isLoading &&
              !isUserRewardsLoading &&
              rewardsByCategory &&
              userRewards &&
              Object.entries(rewardsByCategory || {})
                .sort(([a], [b]) => {
                  const order = [
                    "POSTS",
                    "LIKES",
                    "COMMENTS",
                    "FOLLOWS",
                    "COMMUNITY_JOINS",
                    "COMMUNITY_POSTS",
                    "COMMUNITY_LIKES",
                    "COMMUNITY_COMMENTS",
                    "ENROLLMENTS",
                    "REVIEWS"
                  ];
                  return (
                    order.indexOf(a.toUpperCase()) -
                    order.indexOf(b.toUpperCase())
                  );
                })
                .map(([category, rewards]) => (
                  <div key={category}>
                    <h4 className="mb-4">{capitalizeWords(category)}</h4>
                    <div className="grid gap-8">
                      {rewards
                        .sort((a, b) => a.requirement - b.requirement)
                        .map((reward: any) => {
                          const progress =
                            userRewards?.[
                              reward.requirementType as RewardRequirementType
                            ] || 0;
                          const percentage = Math.min(
                            (progress / reward.requirement) * 100,
                            100
                          );
                          const isClaimed = userClaimedRewards?.some(
                            (claimedReward) =>
                              claimedReward.rewardId === reward.id
                          );
                          return (
                            <div
                              key={reward.id}
                              className="flex cursor-pointer flex-col items-start gap-4 sm:flex-row"
                              onClick={() => setSelectedReward(reward)}
                            >
                              <div className="relative size-24 cursor-pointer md:size-16">
                                <div className="relative h-full w-full overflow-hidden rounded-full">
                                  {/* Colored image (bottom layer) */}
                                  <Image
                                    draggable={false}
                                    src="/auth.webp"
                                    alt={reward.name}
                                    layout="fill"
                                    className="select-none object-cover"
                                  />
                                  {/* Grayscale image with mask (top layer) */}
                                  <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{
                                      clipPath: `inset(0 0 ${percentage}% 0)`,
                                      transition: "clip-path 0.3s ease-in-out"
                                    }}
                                  >
                                    <Image
                                      draggable={false}
                                      src="/auth.webp"
                                      alt={reward.name}
                                      layout="fill"
                                      className="select-none object-cover grayscale"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="w-full flex-1">
                                <h5 className="font-semibold">
                                  {reward.name.replace("_", " ")}
                                </h5>
                                <p className="text-sm text-foreground/80">
                                  {reward.description}
                                </p>
                                {percentage < 100 ? (
                                  <>
                                    <Progress
                                      value={percentage}
                                      className="mt-2"
                                    />
                                    <p className="mt-1 text-sm">
                                      {progress} / {reward.requirement}{" "}
                                      completed (
                                      {Math.round(
                                        (progress / reward.requirement) * 100
                                      )}
                                      %){" "}
                                      {Math.round(
                                        (progress / reward.requirement) * 100
                                      ) > 75 &&
                                        !isClaimed && (
                                          <span className="text-primary/80">
                                            - You&apos;re almost there!
                                          </span>
                                        )}
                                    </p>
                                  </>
                                ) : null}
                              </div>
                              {percentage === 100 && (
                                <>
                                  {!isClaimed ? (
                                    <Button
                                      onClick={() =>
                                        claimRewardMutation.mutate(reward.id)
                                      }
                                      className="inline-flex w-full max-w-[180px] items-center gap-2 rounded-full"
                                      disabled={claimRewardMutation.isPending}
                                    >
                                      {claimRewardMutation.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <Stars className="size-4" />
                                      )}
                                      {claimRewardMutation.isPending
                                        ? "Claiming..."
                                        : "Claim Reward"}
                                    </Button>
                                  ) : (
                                    <Badge
                                      variant={"light"}
                                      className="inline-flex items-center gap-2 text-sm text-primary/80"
                                    >
                                      <CheckCircle className="size-3.5" />
                                      Reward claimed successfully
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </DialogContent>
      {selectedReward && (
        <SpinningImageDialog
          isOpen={!!selectedReward === true}
          onClose={() => setSelectedReward(null)}
          imageUrl="/auth.webp"
          rewardName={selectedReward.name}
          username={userData?.username ?? ""}
          reward={selectedReward}
          progress={
            userRewards?.[
              selectedReward.requirementType as RewardRequirementType
            ] || 0
          }
          owned={
            userClaimedRewards?.some(
              (claimedReward) => claimedReward.rewardId === selectedReward.id
            ) ?? false
          }
        />
      )}
    </Dialog>
  );
}
