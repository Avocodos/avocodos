import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { User } from "@prisma/client";




// Initialize Redis client
const redis = Redis.fromEnv();

const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { user: currentUser } = await validateRequest();
    const username = decodeURI(params.username);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique cache key
    const cacheKey = `user:${username}`;

    // Try to get results from Redis cache
    const cachedUser = await redis.get<string>(cacheKey);
    if (cachedUser) {
      try {
        const userData = JSON.parse(JSON.stringify(cachedUser));
        userData.isFollowedByUser = await checkFollowStatus(currentUser.id, userData.id);
        return NextResponse.json(userData);
      } catch (e) {
        console.error("Failed to parse cachedUser:", e);
        console.log("Fetching fresh data due to cache parsing error");
      }
    }

    if (!prisma) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Fetch data from the database
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        followers: {
          where: { followerId: currentUser.id },
          select: { followerId: true },
        },
        following: {
          where: { followingId: currentUser.id },
          select: { followingId: true },
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        assets: {
          select: {
            id: true,
            url: true,
          },
        },
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
            assets: true,
            sessions: true,
            communityRoles: true,
            assignedRoles: true,
            joinedCommunities: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = {
      ...user,
      isFollowedByUser: await checkFollowStatus(currentUser.id, user.id),
    };

    // Cache the user data
    await redis.set(cacheKey, JSON.stringify(userData), { ex: CACHE_TTL });

    return NextResponse.json(userData as User);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  if (!followerId) return false;

  const follow = await prisma?.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  return !!follow;
}