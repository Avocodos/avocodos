"use client";
import React, { ReactNode, useEffect, useState } from "react";
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
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction
} from "@tanstack/react-query";
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
import { AVOCODOS_WELCOME_REWARD_ID } from "@/lib/constants";
import { motion } from "framer-motion";
import { validateRequest } from "@/auth";
import { User as LuciaUser } from "lucia";

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
  loggedInUserId: string;
  defaultOpen?: boolean;
}

interface ExtendedUserReward extends UserReward {
  reward: Reward;
}

export default function RewardsModal({
  isOpen,
  onClose,
  user,
  loggedInUserId,
  defaultOpen = false
}: RewardsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchRewards = async (): Promise<
    Record<string, ExtendedUserReward[]>
  > => {
    const data = await kyInstance
      .get(`/api/rewards/user/${user.id}`)
      .json<ExtendedUserReward[]>();

    const res = data.reduce(
      (acc, reward) => {
        if (!acc[reward.reward.requirementType]) {
          acc[reward.reward.requirementType] = [];
        }
        acc[reward.reward.requirementType].push(reward);
        return acc;
      },
      {} as Record<string, ExtendedUserReward[]>
    );

    return res;
  };

  const fetchUserClaimedRewards: QueryFunction<
    UserReward[],
    any
  > = async (): Promise<UserReward[]> => {
    const data = await kyInstance
      .get(`/api/rewards/claimed/${user.id}`)
      .json<UserReward[]>();
    return data;
  };

  const fetchUserRewardsCount = async (): Promise<
    Record<RewardRequirementType, number>
  > => {
    const data = await kyInstance
      .get(`/api/rewards/user/${user.id}/count`)
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
    enabled: isOpen || defaultOpen,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const {
    data: userRewardsCount,
    isLoading: isUserRewardsLoading,
    error: userRewardsError
  } = useQuery({
    queryKey: ["userRewardsCount", user.id],
    queryFn: fetchUserRewardsCount,
    enabled: isOpen || defaultOpen
  });

  const { data: userData } = useQuery({
    queryKey: ["userData", user.id],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${user.username}`).json<User>(),
    enabled: isOpen || defaultOpen
  });

  const { data: userClaimedRewards } = useQuery({
    queryKey: ["userClaimedRewards", user.id],
    queryFn: fetchUserClaimedRewards,
    enabled: isOpen || defaultOpen
  });

  const claimRewardMutation = useMutation({
    mutationFn: (rewardId: string) => {
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
        rewards.filter((reward: ExtendedUserReward) => {
          const progress =
            userRewardsCount?.[reward.reward.requirementType] || 0;
          return progress >= reward.reward.requirement;
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
      <p className="text-center text-destructive">Error loading rewards...</p>
    );

  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={onClose}>
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Confetti
            width={window.innerWidth - 20}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={50}
            style={{ zIndex: 2000 }}
          />
        </motion.div>
      )}
      <DialogContent
        disableCloseButton={defaultOpen}
        className="h-[80dvh] min-w-[90dvw] bg-background p-8 focus-visible:!border-0 focus-visible:!outline-none focus-visible:!ring-0 lg:min-w-[60dvw]"
      >
        <ScrollArea className="relative h-full">
          <DialogHeader className="sticky top-0 z-10 bg-background/90 pb-8 backdrop-blur-sm">
            <DialogTitle asChild>
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-3">
                  <Stars className="size-7" /> NFTs Progress{" "}
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
                    {numberOfRewardsOwned + 1} / {numberOfRewards} Rewards Owned
                    (
                    {Math.round(
                      ((numberOfRewardsOwned + 1) / numberOfRewards) * 100
                    )}
                    %)
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {(isLoading || isUserRewardsLoading) && <RewardsSkeleton />}
            {!isLoading &&
              !isUserRewardsLoading &&
              rewardsByCategory &&
              userRewardsCount &&
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
                    "REVIEWS",
                    "OTHER"
                  ];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([category, rewards]) => (
                  <div key={category}>
                    <h4 className="mb-4">{capitalizeWords(category)}</h4>
                    <div className="grid gap-8">
                      {rewards
                        .sort(
                          (a, b) => a.reward.requirement - b.reward.requirement
                        )
                        .map((userReward: ExtendedUserReward) => {
                          const progress =
                            userRewardsCount?.[
                              userReward.reward
                                .requirementType as RewardRequirementType
                            ] || 0;

                          const percentage = Math.min(
                            Math.floor(
                              (progress / userReward.reward.requirement) * 100
                            ),
                            100
                          );

                          // Always show as claimed if the reward ID matches
                          const isClaimed =
                            userReward.reward.id ===
                              AVOCODOS_WELCOME_REWARD_ID ||
                            userClaimedRewards?.some(
                              (claimedReward) =>
                                claimedReward.rewardId === userReward.reward.id
                            );

                          // Update the grayscale condition
                          const grayscaleClass = isClaimed
                            ? ""
                            : userReward.reward.id ===
                                AVOCODOS_WELCOME_REWARD_ID
                              ? ""
                              : "grayscale";

                          return (
                            <div
                              key={userReward.reward.id}
                              className="flex cursor-pointer flex-col items-start gap-4 sm:flex-row"
                              onClick={() =>
                                setSelectedReward(userReward.reward)
                              }
                            >
                              <div className="relative size-36 cursor-pointer md:size-28">
                                <div className="relative h-full w-full overflow-hidden rounded-full">
                                  {/* Colored image (bottom layer) */}
                                  <img
                                    draggable={false}
                                    src={
                                      userReward.reward.imageUrl ?? "/auth.webp"
                                    }
                                    alt={
                                      "Avocodos Reward - " +
                                      userReward.reward.name
                                    }
                                    className={`select-none object-cover ${grayscaleClass}`}
                                  />
                                  {/* Grayscale image with mask (top layer) */}
                                  <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{
                                      clipPath: isClaimed
                                        ? "inset(0 0 0 0)"
                                        : userReward.reward.id ===
                                            AVOCODOS_WELCOME_REWARD_ID
                                          ? `inset(0 0 ${percentage}% 0)`
                                          : `inset(0 0 0 0)`,
                                      transition: "clip-path 0.3s ease-in-out"
                                    }}
                                  >
                                    <img
                                      draggable={false}
                                      src={
                                        userReward.reward.imageUrl ??
                                        "/auth.webp"
                                      }
                                      alt={
                                        "Avocodos Reward - " +
                                        userReward.reward.name
                                      }
                                      className={`size-full select-none object-cover ${grayscaleClass}`}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`flex w-full flex-1 gap-2 ${isClaimed ? "flex-col md:flex-row" : "flex-col"} justify-between`}
                              >
                                <div className="w-fit">
                                  <h5 className="w-fit font-semibold">
                                    {userReward.reward.name.replace("_", " ")}
                                  </h5>
                                  <p className="w-fit text-sm text-foreground/80">
                                    {userReward.reward.description}
                                  </p>
                                </div>
                                {isClaimed ? null : (
                                  <>
                                    {percentage < 100 ? (
                                      <div>
                                        <Progress
                                          value={percentage}
                                          className="mt-2 flex-1"
                                        />
                                        <p className="mt-1 text-sm">
                                          {progress} /{" "}
                                          {userReward.reward.requirement}{" "}
                                          completed (
                                          {Math.round(
                                            (progress /
                                              userReward.reward.requirement) *
                                              100
                                          )}
                                          %){" "}
                                          {Math.round(
                                            (progress /
                                              userReward.reward.requirement) *
                                              100
                                          ) > 85 && (
                                            <span className="text-primary/80">
                                              - You&apos;re almost there!
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    ) : null}
                                  </>
                                )}
                              </div>
                              {percentage >= 100 &&
                                !isClaimed &&
                                loggedInUserId !== userReward.userId && (
                                  <Badge variant={"light"}>
                                    Owned but not claimed yet.
                                  </Badge>
                                )}
                              {percentage >= 100 &&
                                isClaimed &&
                                userReward.reward.id !==
                                  AVOCODOS_WELCOME_REWARD_ID && (
                                  <Badge
                                    variant={"light"}
                                    className="inline-flex h-fit w-fit items-center gap-2 text-xs text-primary/80"
                                  >
                                    <CheckCircle className="size-3" />
                                    Reward claimed successfully
                                  </Badge>
                                )}
                              {userReward.reward.id ===
                                AVOCODOS_WELCOME_REWARD_ID && (
                                <Badge
                                  variant={"light"}
                                  className="inline-flex h-fit w-fit items-center gap-2 text-xs text-primary/80"
                                >
                                  <CheckCircle className="size-3" />
                                  Reward claimed successfully
                                </Badge>
                              )}
                              {percentage >= 100 &&
                                !isClaimed &&
                                loggedInUserId === userReward.userId && (
                                  <Button
                                    onClick={() =>
                                      claimRewardMutation.mutate(
                                        userReward.reward.id
                                      )
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
                                      ? "Claiming Reward..."
                                      : "Claim Reward"}
                                  </Button>
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
          imageUrl={selectedReward.imageUrl ?? "/auth.webp"}
          rewardName={selectedReward.name}
          username={userData?.username ?? ""}
          reward={selectedReward}
          progress={
            userRewardsCount?.[
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
