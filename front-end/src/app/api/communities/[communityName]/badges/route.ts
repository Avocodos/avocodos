import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { name, color } = await req.json();
        const { communityName } = params;

        const community = await prisma?.community.findUnique({
            where: { name: communityName },
            include: { moderators: true },

        });

        if (!community) return Response.json({ error: "Community not found" }, { status: 404 });
        if (community.creatorId !== user.id && !community.moderators.some(mod => mod.id === user.id)) {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        const badge = await prisma?.communityBadge.create({
            data: { name, color, communityName: community.name }
        });

        return Response.json(badge);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const { communityName } = params;
        const badges = await prisma?.communityBadge.findMany({
            where: { communityName }
        });

        return Response.json(badges);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}