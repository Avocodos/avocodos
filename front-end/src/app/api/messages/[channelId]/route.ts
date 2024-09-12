import { validateRequest } from "../../../../auth";
import prisma from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 20; // Number of messages to return per request

export async function GET(req: NextRequest, { params }: { params: { channelId: string } }) {
    const { user } = await validateRequest();

    if (!prisma) return NextResponse.json({ error: "Prisma client not initialized" }, { status: 500 });

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelId } = params;
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined; // Get cursor from query params

    try {
        const messages = await prisma.message.findMany({
            where: {
                channelId: channelId,
                // id: cursor ? { lt: cursor } : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                        bannerUrl: true,
                        email: true,
                        createdAt: true,
                        reactions: true,
                        channels: true,
                        messages: true,
                    },
                },
                reactions: {
                    select: {
                        reaction: true,
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                                bio: true,
                                bannerUrl: true,
                                email: true,
                                createdAt: true,
                            }
                        },
                        userId: true,
                        message: {
                            select: {
                                id: true,
                                content: true,
                                createdAt: true,
                                channelId: true,
                            }
                        }
                    }
                },
                attachments: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                        media: {
                            select: {
                                id: true,
                                url: true,
                                type: true,
                            }
                        },
                        messageId: true,
                        mediaId: true,
                        channelId: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc", // Order by createdAt descending to get the latest messages first
            },
            // take: PAGE_SIZE,
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}