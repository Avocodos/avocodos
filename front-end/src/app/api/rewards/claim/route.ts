import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getUserRewards } from "@/lib/updateRewardProgress";

const redis = Redis.fromEnv();
const CACHE_TTL = 120; // 120 seconds
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 2 seconds

async function retryValidateRequest(retries = 4): Promise<any> {
    const result = await validateRequest();
    if (!result.user && retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryValidateRequest(retries + 1);
    }
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const { user } = await retryValidateRequest(MAX_RETRIES);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!prisma) {
            return NextResponse.json({ error: "Internal server error. Could not connect to the database." }, { status: 500 });
        }

        const { rewardId } = await req.json();

        if (!rewardId) {
            return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
        }

        const cacheKey = `claim:${user.id}:${rewardId}`;

        // Check cache first
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            return NextResponse.json(JSON.parse(JSON.stringify(cachedResult)));
        }

        // Fetch the reward details directly from the `reward` table
        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        // Get the user's current progress for all rewards
        const userProgress = await getUserRewards(user.id);

        // Check if the user has met the requirement for this specific reward
        if (userProgress[reward.requirementType] < reward.requirement) {
            return NextResponse.json({ error: "Reward requirements not met" }, { status: 400 });
        }

        // Check if the reward has already been claimed
        const existingUserReward = await prisma.userReward.findUnique({
            where: {
                userId_rewardId: {
                    userId: user.id,
                    rewardId: rewardId,
                },
            },
        });

        if (existingUserReward?.claimed) {
            return NextResponse.json({ error: "Reward already claimed" }, { status: 400 });
        }

        // Claim the reward
        const updatedUserReward = await prisma.userReward.upsert({
            where: {
                userId_rewardId: {
                    userId: user.id,
                    rewardId: rewardId,
                },
            },
            update: {
                claimed: true,
                progress: userProgress[reward.requirementType],
            },
            create: {
                userId: user.id,
                rewardId: rewardId,
                claimed: true,
                progress: userProgress[reward.requirementType],
            },
        });

        const result = {
            message: "Reward claimed successfully",
            userReward: updatedUserReward,
            success: true,
        };

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error claiming reward:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
