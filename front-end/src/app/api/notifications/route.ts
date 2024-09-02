import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude, NotificationsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";




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
    const cacheKey = `notifications:${user.id}:${cursor || 'initial'}`;

    // Try to get results from Redis cache
    const cachedResults = await redis.get<string>(cacheKey);
    if (cachedResults) {
      return Response.json(JSON.parse(cachedResults));
    }

    const notifications = await prisma?.notification.findMany({
      where: {
        recipientId: user.id,
      },
      include: notificationsInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ error: "No notifications found." }, { status: 404 })
    }

    const nextCursor = notifications.length > pageSize ? notifications[pageSize].id : null;

    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
    };

    // Cache the results in Redis for 1 minute
    // Notifications are likely to change frequently, so we use a shorter cache duration
    await redis.set(cacheKey, JSON.stringify(data), { ex: 60, nx: true });

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a new route to mark notifications as read
export async function PUT(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    await prisma?.notification.updateMany({
      where: {
        id: { in: notificationIds },
        recipientId: user.id,
      },
      data: {
        read: true,
      },
    });

    // Invalidate the user's notification cache
    const cachePattern = `notifications:${user.id}:*`;
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
