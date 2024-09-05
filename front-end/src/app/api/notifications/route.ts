import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude, NotificationsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function retry<T>(fn: () => Promise<T>, retries = 3, interval = 5000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, interval));
      return retry(fn, retries - 1, interval);
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  return retry(async () => {
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
        return Response.json(JSON.parse(JSON.stringify(cachedResults)));
      }

      if (!prisma) {
        return Response.json({ error: "Internal server error" }, { status: 500 });
      }

      const notifications = await retry(() => prisma!.notification.findMany({
        where: {
          recipientId: user.id,
        },
        include: notificationsInclude,
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      }));

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
  });
}

// Add a new route to mark notifications as read
export async function PUT(req: NextRequest) {
  return retry(async () => {
    try {
      const { user } = await validateRequest();

      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { notificationIds } = await req.json();

      if (!prisma) {
        return Response.json({ error: "Internal server error" }, { status: 500 });
      }

      await retry(() => prisma!.notification.updateMany({
        where: {
          id: { in: notificationIds },
          recipientId: user.id,
        },
        data: {
          read: true,
        },
      }));

      // Invalidate the user's notification cache
      const cachePattern = `notifications:${user.id}:*`;
      const keys = await retry(() => redis.keys(cachePattern));
      if (keys.length > 0) {
        for (const key of keys) {
          await retry(() => redis.del(key));
        }
      }

      return new Response(null, { status: 204 });
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
