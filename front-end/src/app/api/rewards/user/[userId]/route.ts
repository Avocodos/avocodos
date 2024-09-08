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

        if (!prisma) {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        // Fetch all counts in a single query
        const userRewards = await prisma.userReward.findMany({
            where: {
                userId: userId,
                NOT: {
                    reward: {
                        description: "Welcome to Avocodos"
                    }
                }
            },
            select: {
                id: true,
                claimed: true,
                reward: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        requirementType: true,
                        imageUrl: true,
                        requirement: true,
                        _count: {
                            select: {
                                userRewards: true
                            }
                        }
                    }
                },
                progress: true,
                rewardId: true,
                userId: true,
            }
        });
        return NextResponse.json(userRewards);
    } catch (error) {
        console.error('Error fetching user reward counts:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}