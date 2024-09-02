import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const redis = Redis.fromEnv();

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a cache key based on the user and cursor
    const cacheKey = `bookmarked:${user.id}:${cursor || 'initial'}`;

    // Try to get results from Redis cache
    const cachedResults = await redis.get<string>(cacheKey);
    if (cachedResults) {
      return Response.json(JSON.parse(cachedResults));
    }

    const bookmarks = await prisma?.bookmark.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            content: true,
            userId: true,
            communityName: true,
            createdAt: true,
            communityBadgeId: true,
            badgeId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({ posts: [], nextCursor: null }, { status: 200 });
    }

    const nextCursor = bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    const data: PostsPage = {
      posts: await Promise.all(bookmarks.slice(0, pageSize).map(async (bookmark) => {
        const post = await prisma?.post.findUnique({
          where: { id: bookmark.post.id },
          include: getPostDataInclude(user.id),
        });
        return post as any; // Type assertion to bypass strict typing
      })),
      nextCursor,
    };

    // Cache the results in Redis for 5 minutes
    await redis.set(cacheKey, JSON.stringify(data), { ex: 300, nx: true });

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a new route to add a bookmark
export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json();

    const bookmark = await prisma?.bookmark.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    // Invalidate the user's bookmarked posts cache
    const cachePattern = `bookmarked:${user.id}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
      }
    }

    return Response.json(bookmark, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a new route to remove a bookmark
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json();

    await prisma?.bookmark.deleteMany({
      where: {
        userId: user.id,
        postId,
      },
    });

    // Invalidate the user's bookmarked posts cache
    const cachePattern = `bookmarked:${user.id}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
