import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/auth';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const redis = Redis.fromEnv();
const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cacheKey = `user:${user.username}:joined_communities`;

        // Try to get results from Redis cache
        const cachedResults = await redis.get<string>(cacheKey) as string;

        if (cachedResults) {
            try {
                return NextResponse.json(JSON.parse(JSON.stringify(cachedResults)));
            } catch (e) {
                console.error("Failed to parse cachedResults in /api/communities/joined:", e);
                // Instead of returning an error, we'll proceed to fetch fresh data
                console.log("Fetching fresh data due to cache parsing error");
            }
        }

        // Fetch data from the database
        const joinedCommunities = await prisma?.community.findMany({
            where: {
                members: {
                    some: {
                        username: user.username,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { members: true, posts: true },
                },
            },
        });

        // Cache the results in Redis
        console.log("Stringified data:", JSON.stringify(joinedCommunities));
        await redis.set(cacheKey, JSON.stringify(joinedCommunities), { ex: CACHE_TTL });

        return NextResponse.json(joinedCommunities);
    } catch (error) {
        console.error('Error fetching joined communities:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}