import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Handle GET requests
export async function GET(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const communityName = req.nextUrl.searchParams.get('communityName');
        const cacheKey = communityName
            ? `community:${communityName}:${user.id}`
            : `communities:all:${user.id}`;

        // Try to get results from Redis cache
        const cachedResults = await redis.get<string>(cacheKey);
        if (cachedResults) {
            try {
                return NextResponse.json(JSON.parse(JSON.stringify(cachedResults)));
            } catch (e) {
                console.error("Failed to parse cachedResults:", e);
            }
        }

        let data;
        if (communityName) {
            // Fetch a specific community by name
            const community = await prisma?.community.findUnique({
                where: { name: decodeURI(communityName) },
                include: {
                    members: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                    posts: {
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                            _count: { select: { comments: true, likes: true } }
                        }
                    },
                    _count: { select: { members: true, posts: true } },
                    badges: true,
                    moderators: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                    roles: true,
                    creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                },
            });

            if (!community) {
                return NextResponse.json({ error: "Community not found" }, { status: 404 });
            }

            data = community;
        } else {
            // Fetch all communities
            const communities = await prisma?.community.findMany({
                orderBy: { members: { _count: 'desc' } },
                include: {
                    _count: { select: { members: true, posts: true } }
                },
            });

            data = communities;
        }

        // Cache the results in Redis
        await redis.set(cacheKey, JSON.stringify(data), { ex: 300 }); // Cache for 5 minutes

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Handle POST requests
export async function POST(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, isPrivate } = await req.json();

        const community = await prisma?.community.create({
            data: {
                name,
                description,
                isPrivate,
                creatorId: user.id,
                members: {
                    connect: {
                        id: user.id
                    }
                }
            },
        });

        return NextResponse.json(community);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}