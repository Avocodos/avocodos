import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Initialize Redis client
const redis = Redis.fromEnv();

const CACHE_TTL = 60 * 5; // 5 minutes
const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique cache key
    const cacheKey = `for-you:${user.id}:${cursor || 'initial'}`;

    // Try to get results from Redis cache
    const cachedResults = await redis.get<string>(cacheKey);
    if (cachedResults) {
      try {
        return NextResponse.json(JSON.parse(cachedResults));
      } catch (e) {
        console.error("Failed to parse cachedResults:", e);
        console.log("Fetching fresh data due to cache parsing error");
      }
    }

    if (!prisma) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Fetch data from the database
    const posts = await prisma.post.findMany({
      where: {
        communityName: null,
        id: cursor ? { lt: cursor } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
      include: {
        ...getPostDataInclude(user.id),
        user: {
          include: {
            _count: {
              select: {
                posts: true,
                followers: true,
              },
            },
          },
        },
      },
    });

    // Instead of returning a 404, we'll return an empty array of posts
    const nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE].id : null;
    const postsForResponse = posts.slice(0, PAGE_SIZE);

    const data: PostsPage = {
      posts: postsForResponse as any,
      nextCursor,
    };

    // Only cache if there are posts
    if (posts.length > 0) {
      await redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching for-you posts:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}