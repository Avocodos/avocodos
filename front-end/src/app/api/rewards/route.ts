import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getUserRewards } from "@/lib/rewards";
import { AUTHORIZED_INSTRUCTORS } from "@/lib/constants";

const redis = Redis.fromEnv();
const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Generate a unique cache key
        const cacheKey = `rewards:${user.id}`;

        // Try to get results from Redis cache
        const cachedRewards = await redis.get<string>(cacheKey);
        if (cachedRewards) {
            return NextResponse.json(JSON.parse(JSON.stringify(cachedRewards)));
        }

        const rewards = await prisma?.reward.findMany({
            where: {
                NOT: {
                    description: "Welcome to Avocodos"
                }
            }
        });

        // Cache the rewards in Redis
        await redis.set(cacheKey, JSON.stringify(rewards), { ex: CACHE_TTL });

        return NextResponse.json(JSON.parse(JSON.stringify(rewards)));
    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!AUTHORIZED_INSTRUCTORS.includes(user.id)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, requirement, requirementType, imageUrl } = await req.json();

        const reward = await prisma?.reward.create({
            data: {
                name,
                description,
                requirement,
                requirementType,
                imageUrl
            }
        });

        return NextResponse.json(reward);
    } catch (error) {
        console.error('Error creating reward:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}