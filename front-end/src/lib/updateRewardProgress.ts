import prisma from "./prisma";
import { RewardRequirementType } from "@prisma/client";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function updateRewardProgress(userId: string, type: RewardRequirementType, count: number = 1) {
    if (!prisma) {
        console.error("Prisma client is not initialized.");
        return;
    }

    const cacheKey = `user:${userId}:rewards`;

    // Invalidate the cache
    await redis.del(cacheKey);

    // Proceed with the database update
    const rewards = await prisma.reward.findMany({
        where: { requirementType: type },
        include: { userRewards: { where: { userId } } },
    });

    for (const reward of rewards) {
        const userReward = reward.userRewards[0];
        if (!userReward) {
            await prisma.userReward.create({
                data: {
                    userId,
                    rewardId: reward.id,
                    progress: count,
                },
            });
        } else if (!userReward.claimed) {
            await prisma.userReward.update({
                where: { id: userReward.id },
                data: { progress: userReward.progress + count },
            });
        }
    }
}

export async function getUserRewards(userId: string) {
    const cacheKey = `user:${userId}:rewards`;

    // Try to get cached rewards
    const cachedRewards = await redis.get(cacheKey);

    if (cachedRewards) {
        return JSON.parse(JSON.stringify(cachedRewards));
    }
    if (!prisma) {
        console.error("Prisma client is not initialized.");
        return;
    }
    // If not cached, fetch from database
    const rewards = await prisma.userReward.findMany({
        where: { userId, reward: { isNot: { id: undefined } } },
        include: { reward: true },
    });

    // Cache the rewards for 5 minutes
    await redis.set(cacheKey, JSON.stringify(rewards), { ex: 300 });

    return rewards;
}

export async function initializeUserRewards(userId: string) {
    if (!prisma) {
        console.error("Prisma client is not initialized.");
        return;
    }

    // Fetch all rewards
    const rewards = await prisma.reward.findMany();

    // Fetch existing user rewards and counts in a single query
    const result: any = await prisma.$queryRaw`
        SELECT
            (SELECT COUNT(*) FROM "posts" WHERE "userId" = ${userId}) AS postCount,
            (SELECT COUNT(*) FROM "comments" WHERE "userId" = ${userId}) AS commentCount,
            (SELECT COUNT(*) FROM "likes" WHERE "userId" = ${userId}) AS likeCount,
            (SELECT COUNT(*) FROM "follows" WHERE "followerId" = ${userId}) AS followCount,
            (SELECT COUNT(*) FROM "enrollments" WHERE "userId" = ${userId}) AS enrollmentCount,
            (SELECT COUNT(*) FROM "reviews" WHERE "userId" = ${userId}) AS reviewCount,
            (SELECT COUNT(*) FROM "community_members" WHERE "userId" = ${userId}) AS communityJoinCount,
            (SELECT COUNT(*) FROM "posts" WHERE "userId" = ${userId} AND "communityName" IS NOT NULL) AS communityPostCount,
            (SELECT COUNT(*) FROM "comments" WHERE "userId" = ${userId} AND "postId" IN (SELECT id FROM "posts" WHERE "communityName" IS NOT NULL)) AS communityCommentCount,
            (SELECT COUNT(*) FROM "likes" WHERE "userId" = ${userId} AND "postId" IN (SELECT id FROM "posts" WHERE "communityName" IS NOT NULL)) AS communityLikeCount;
    `;

    const rewardCounts = {
        [RewardRequirementType.POSTS]: result[0].postCount,
        [RewardRequirementType.COMMENTS]: result[0].commentCount,
        [RewardRequirementType.LIKES]: result[0].likeCount,
        [RewardRequirementType.FOLLOWS]: result[0].followCount,
        [RewardRequirementType.ENROLLMENTS]: result[0].enrollmentCount,
        [RewardRequirementType.REVIEWS]: result[0].reviewCount,
        [RewardRequirementType.COMMUNITY_JOINS]: result[0].communityJoinCount,
        [RewardRequirementType.COMMUNITY_POSTS]: result[0].communityPostCount,
        [RewardRequirementType.COMMUNITY_COMMENTS]: result[0].communityCommentCount,
        [RewardRequirementType.COMMUNITY_LIKES]: result[0].communityLikeCount,
    };

    // Create new user rewards in a single transaction
    await prisma.$transaction(
        rewards
            .filter((reward: any) => !reward.userRewards.some((ur: any) => ur.userId === userId))
            .map((reward: any) =>
                prisma!.userReward.create({
                    data: {
                        userId,
                        rewardId: reward.id,
                        progress: rewardCounts[reward.requirementType as RewardRequirementType] || 0,
                    },
                })
            )
    );
}

export async function getUserRewardCounts(userId: string) {
    try {
        console.log("getUserRewardCounts called with userId:", userId);
        if (!prisma) {
            console.error("Prisma client is not initialized.");
            return;
        }

        const result: any = await prisma.$queryRaw`
            SELECT
                (SELECT COUNT(*)::int FROM posts WHERE "userId" = ${userId}) AS "postCount",
                (SELECT COUNT(*)::int FROM comments WHERE "userId" = ${userId}) AS "commentCount",
                (SELECT COUNT(*)::int FROM likes WHERE "userId" = ${userId}) AS "likeCount",
                (SELECT COUNT(*)::int FROM follows WHERE "followerId" = ${userId}) AS "followCount",
                (SELECT COUNT(*)::int FROM enrollments WHERE "userId" = ${userId}) AS "enrollmentCount",
                (SELECT COUNT(*)::int FROM reviews WHERE "userId" = ${userId}) AS "reviewCount",
                (SELECT COUNT(*)::int FROM "community_members" WHERE "userId" = ${userId}) AS "communityJoinCount",
                (SELECT COUNT(*)::int FROM posts WHERE "userId" = ${userId} AND "communityName" IS NOT NULL) AS "communityPostCount",
                (SELECT COUNT(*)::int FROM comments WHERE "userId" = ${userId} AND "postId" IN (SELECT id FROM posts WHERE "communityName" IS NOT NULL)) AS "communityCommentCount",
                (SELECT COUNT(*)::int FROM likes WHERE "userId" = ${userId} AND "postId" IN (SELECT id FROM posts WHERE "communityName" IS NOT NULL)) AS "communityLikeCount"
        `;

        const rewardCounts: Record<RewardRequirementType, number> = {
            [RewardRequirementType.POSTS]: Number(result[0].postCount),
            [RewardRequirementType.COMMENTS]: Number(result[0].commentCount),
            [RewardRequirementType.LIKES]: Number(result[0].likeCount),
            [RewardRequirementType.FOLLOWS]: Number(result[0].followCount),
            [RewardRequirementType.ENROLLMENTS]: Number(result[0].enrollmentCount),
            [RewardRequirementType.REVIEWS]: Number(result[0].reviewCount),
            [RewardRequirementType.COMMUNITY_JOINS]: Number(result[0].communityJoinCount),
            [RewardRequirementType.COMMUNITY_POSTS]: Number(result[0].communityPostCount),
            [RewardRequirementType.COMMUNITY_COMMENTS]: Number(result[0].communityCommentCount),
            [RewardRequirementType.COMMUNITY_LIKES]: Number(result[0].communityLikeCount),
        };

        return rewardCounts;
    } catch (error) {
        console.error("Error in getUserRewardCounts:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
