import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {

    if (!prisma) return NextResponse.json({ error: "Prisma client not initialized" }, { status: 500 });

    const { username } = params;

    const channels = await prisma.channel.findMany({
        where: {
            members: {
                some: {
                    username: username
                },
            },
        },
        select: {
            id: true,
            name: true,
            members: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    bannerUrl: true,
                    bio: true,
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                            posts: true,
                        }
                    }
                }
            },
            type: true,
            messages: {
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    type: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                        }
                    }
                }
            }
        }
    });

    return NextResponse.json({ channels });
}