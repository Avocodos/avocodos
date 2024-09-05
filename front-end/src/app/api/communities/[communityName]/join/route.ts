import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { updateRewardProgress } from "@/lib/updateRewardProgress";
import { NextRequest } from "next/server";

async function handleCommunityAction(
    req: NextRequest,
    { params }: { params: { communityName: string } },
    action: 'join' | 'leave'
) {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!prisma) return Response.json({ error: "Internal server error" }, { status: 500 });
    const { communityName } = params;
    const community = await prisma.community.findUnique({
        where: { name: communityName },
        include: { members: true },
    });

    if (!community) return Response.json({ error: "Community not found" }, { status: 404 });

    if (action === 'join') {
        if (community.isPrivate) {
            return Response.json({ error: "This is a private community" }, { status: 403 });
        }

        const existingMember = await prisma.communityMember.findUnique({
            where: { userId_communityName: { userId: user.id, communityName } },
        });

        if (existingMember) {
            return Response.json({ error: "User is already a member" }, { status: 400 });
        }
    } else if (action === 'leave') {
        if (community.creatorId === user.id) {
            return Response.json({ error: "Creator cannot leave the community" }, { status: 403 });
        }
    }

    const updatedCommunity = await prisma.community.update({
        where: { name: communityName },
        data: {
            members: { [action === 'join' ? 'connect' : 'disconnect']: { id: user.id } },
            CommunityMember: action === 'join'
                ? { create: { userId: user.id, communityName } }
                : { delete: { userId_communityName: { userId: user.id, communityName } } }
        },
        include: { members: true }
    });

    if (action === 'leave') {
        await prisma.communityModerator.deleteMany({
            where: { userId: user.id, communityName }
        });
    }

    await updateRewardProgress(user.id, "COMMUNITY_JOINS", action === 'join' ? 1 : -1);

    return Response.json({
        message: `Successfully ${action === 'join' ? 'joined' : 'left'} the community`,
        community: updatedCommunity
    });
}

export async function POST(req: NextRequest, context: { params: { communityName: string } }) {
    try {
        return await handleCommunityAction(req, context, 'join');
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { communityName: string } }) {
    try {
        return await handleCommunityAction(req, context, 'leave');
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}