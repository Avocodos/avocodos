import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { communityName } = params;

        const community = await prisma?.community.findUnique({
            where: { name: communityName },
            include: { members: true },
            cacheStrategy: { ttl: 60 },

        });

        if (!community) {
            return Response.json({ error: "Community not found" }, { status: 404 });
        }

        if (community.isPrivate) {
            // For private communities, you might want to implement an invitation system
            return Response.json({ error: "This is a private community" }, { status: 403 });
        }

        const updatedCommunity = await prisma?.community.update({
            where: { name: communityName },
            data: {
                members: {
                    connect: { id: user.id }
                }
            },
            include: {
                members: true
            }
        });

        return Response.json({
            message: "Successfully joined the community",
            community: updatedCommunity
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
export async function DELETE(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { communityName } = params;

        const community = await prisma?.community.findUnique({
            where: { name: communityName },
            include: { members: true },
            cacheStrategy: { ttl: 60 },

        });

        if (!community) {
            return Response.json({ error: "Community not found" }, { status: 404 });
        }

        if (community.creatorId === user.id) {
            return Response.json({ error: "Creator cannot leave the community" }, { status: 403 });
        }

        const updatedCommunity = await prisma?.community.update({
            where: { name: communityName },
            data: {
                members: {
                    disconnect: { id: user.id }
                }
            },
            include: {
                members: true
            }
        });

        return Response.json({
            message: "Successfully left the community",
            community: updatedCommunity
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}