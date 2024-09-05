import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";
import { updateRewardProgress } from "@/lib/updateRewardProgress";
import { RewardRequirementType } from "@prisma/client";
import { Comment } from "@prisma/client";
import { handleUserAction } from "@/lib/eventHandler";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv()

const retryFetch = async (fn: () => Promise<any>, retries: number, delay: number): Promise<any> => {
  return fn().catch((error) => {
    if (retries > 0) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(retryFetch(fn, retries - 1, delay)), delay);
      });
    }
    return Promise.reject(error);
  });
};

export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const cacheKey = `comments:${postId}:${cursor}`;

    const cachedComments = await redis.get<string>(cacheKey);
    if (cachedComments) {
      return Response.json(JSON.parse(JSON.stringify(cachedComments)));
    }

    const pageSize = 5;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await retryFetch(async () => await prisma?.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined,
    }), 3, 5000);

    if (!comments) {
      throw new Error("Could not fetch data from the database. Please try again later.")
    }

    await retryFetch(async () => await updateRewardProgress(user.id, RewardRequirementType.COMMENTS), 3, 5000);
    if (comments[0]?.post.community) {
      await retryFetch(async () => await updateRewardProgress(user.id, RewardRequirementType.COMMUNITY_COMMENTS), 3, 5000);
    }

    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    await redis.set(cacheKey, JSON.stringify(data), { ex: 60 * 60 * 24 });

    await retryFetch(async () => await handleUserAction(user.id, "COMMENTS"), 3, 5000);

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}