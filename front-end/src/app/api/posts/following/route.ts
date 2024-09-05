import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { Redis } from "@upstash/redis";
import { Post } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();
const CACHE_TTL = 60 * 5; // 5 minutes
const PAGE_SIZE = 10;

async function retryRequest(req: NextRequest, retries: number = 3, interval: number = 1000): Promise<NextResponse> {
  if (retries <= 0) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  try {
    return NextResponse.json(await fetch(req));
  } catch (error) {
    console.error(`Retry attempt failed: ${error}`);
    await new Promise(resolve => setTimeout(resolve, interval));
    return retryRequest(req, retries - 1, interval);
  }
}


export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `following_posts:${user.id}:${cursor || 'initial'}`;
    const cachedResults = await redis.get<string>(cacheKey);

    if (cachedResults) {
      try {
        return NextResponse.json(JSON.parse(JSON.stringify(cachedResults)));
      } catch (e) {
        console.error("Failed to parse cachedResults:", e);
        console.log("Fetching fresh data due to cache parsing error");
      }
    }

    const followedUserIds = await redis.get<string[]>(`followed_users:${user.id}`);
    let userIds: string[];
    if (!prisma) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    if (!followedUserIds) {
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      });
      userIds = [...new Set(follows.map(f => f.followingId))];
      await redis.set(`followed_users:${user.id}`, JSON.stringify(userIds), { ex: 60 }); // Cache for 1 hour
    } else {
      userIds = followedUserIds;
    }

    // Clear the cache if the userIds array contains only duplicate values
    if (userIds.every(id => id === userIds[0])) {
      console.log("Detected duplicate userIds, clearing cache");
      await redis.del(`followed_users:${user.id}`);
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      });
      userIds = [...new Set(follows.map(f => f.followingId))];
      await redis.set(`followed_users:${user.id}`, JSON.stringify(userIds), { ex: 3600 }); // Cache for 1 hour
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: userIds },
        NOT: {
          userId: user.id
        },
        communityName: null,
        id: cursor ? { lt: cursor } : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      include: getPostDataInclude(user.id),
    });

    const nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE].id : null;
    const data: PostsPage = {
      posts: posts.slice(0, PAGE_SIZE),
      nextCursor,
    };

    // Only cache if there are posts
    if (posts.length > 0) {
      await redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
