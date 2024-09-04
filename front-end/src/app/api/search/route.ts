import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";




const redis = Redis.fromEnv();

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a cache key based on the search query and cursor
    const cacheKey = `search:${q}:${cursor}:${user.id}`;

    // Try to get results from Redis cache
    const cachedResults = await redis.get<string>(cacheKey);
    if (cachedResults) {
      return Response.json(JSON.parse(JSON.stringify(cachedResults)));
    }

    const searchQuery = q.split(" ").join(" & ");

    const posts = await prisma?.post.findMany({
      where: {
        OR: [
          { content: { search: searchQuery } },
          { user: { displayName: { search: searchQuery } } },
          { user: { username: { search: searchQuery } } },
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "No posts found." }, { status: 404 })
    }

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    // Cache the results in Redis for 1 minute
    await redis.set(cacheKey, JSON.stringify(data), { ex: 60, nx: true });

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
