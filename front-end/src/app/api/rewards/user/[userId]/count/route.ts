import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RewardRequirementType } from "@prisma/client";
import { getUserRewardCounts } from "@/lib/updateRewardProgress";

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

        if (!prisma) {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        // Fetch all counts in a single query
        const userCounts = await getUserRewardCounts(userId);

        return NextResponse.json(userCounts);
    } catch (error) {
        console.error('Error fetching user reward counts:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}