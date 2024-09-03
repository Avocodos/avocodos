import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = params;

        if (user.id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const claimedRewards = await prisma?.userReward.findMany({
            where: {
                userId,
                claimed: true
            },
            include: {
                reward: true,
            },
        });

        if (!claimedRewards) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(claimedRewards);
    } catch (error) {
        console.error('Error fetching claimed rewards:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
