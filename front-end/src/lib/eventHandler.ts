import prisma from "./prisma";
import { RewardRequirementType } from "@prisma/client";
import { getUserRewardCounts } from "./updateRewardProgress";
import { createNotification } from "./notifications"; // Assuming you have a notification function

export async function handleUserAction(userId: string, actionType: RewardRequirementType) {
    if (!prisma) {
        throw new Error("Internal server error. Prisma client not found.");
    }

    const userRewardCounts = await getUserRewardCounts(userId);
    const rewards = await prisma.reward.findMany();

    for (const reward of rewards) {
        const progress = userRewardCounts?.[reward.requirementType] || 0;
        const percentage = (progress / reward.requirement) * 100;

        const userReward = await prisma.userReward.findUnique({
            where: {
                userId_rewardId: {
                    userId: userId,
                    rewardId: reward.id,
                },
            },
        });

        if (!userReward || !userReward.claimed) {
            if (percentage >= 100) {
                await createNotification(userId, reward.id, reward.name, 100);
            } else if (percentage >= 75) {
                await createNotification(userId, reward.id, reward.name, percentage);
            }
        }

        // Update user reward progress
        await prisma.userReward.upsert({
            where: {
                userId_rewardId: {
                    userId: userId,
                    rewardId: reward.id,
                },
            },
            update: {
                progress: progress,
            },
            create: {
                userId: userId,
                rewardId: reward.id,
                progress: progress,
            },
        });
    }
}