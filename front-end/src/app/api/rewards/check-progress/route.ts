import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RewardRequirementType } from "@prisma/client";
import { getUserRewardCounts } from "@/lib/updateRewardProgress";
import { SYSTEM_USER_ID } from "@/lib/constants";

async function checkRewardsProgress() {
    if (!prisma) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const users = await prisma.user.findMany();

    for (const user of users) {
        const userRewardCounts = await getUserRewardCounts(user.id);
        const rewards = await prisma.reward.findMany();

        for (const reward of rewards) {
            const userReward = await prisma.userReward.findUnique({
                where: {
                    userId_rewardId: {
                        userId: user.id,
                        rewardId: reward.id,
                    },
                },
            });

            if (!userRewardCounts) {
                continue;
            }

            const progress = userRewardCounts[reward.requirementType as RewardRequirementType] || 0;
            const percentage = (progress / reward.requirement) * 100;

            if (!userReward || !userReward.claimed) {
                if (percentage >= 100) {
                    await createNotification(user.id, reward.id, reward.name, 100);
                } else if (percentage >= 75) {
                    await createNotification(user.id, reward.id, reward.name, percentage);
                }
            }

            // Update user reward progress
            await prisma.userReward.upsert({
                where: {
                    userId_rewardId: {
                        userId: user.id,
                        rewardId: reward.id,
                    },
                },
                update: {
                    progress: progress,
                },
                create: {
                    userId: user.id,
                    rewardId: reward.id,
                    progress: progress,
                },
            });
        }
    }

    return NextResponse.json({ message: "Rewards progress checked successfully" });
}

async function createNotification(userId: string, rewardId: string, rewardName: string, percentage: number) {
    if (!prisma) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const message = percentage === 100
        ? `Congratulations! You can now claim your "${rewardName}" reward from your profile!`
        : `You are almost there! You have ${Math.round(percentage)}% completed the "${rewardName}" reward!`;

    await prisma.notification.create({
        data: {
            type: "REWARD_PROGRESS",
            recipientId: userId,
            issuerId: SYSTEM_USER_ID,
            message: message,
            metadata: {
                rewardId: rewardId,
                percentage: percentage,
            },
            imageUrl: "https://avocodos.com/auth.webp",
        },
    });
}

export async function GET() {
    try {
        return await checkRewardsProgress();
    } catch (error) {
        console.error("Error checking rewards progress:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}