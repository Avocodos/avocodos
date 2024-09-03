import { FollowingInfo } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    const userId = params.userId;
    const followingInfo: number | null | undefined = await prisma?.follow.count({
        where: {
            followerId: userId
        }
    });
    return NextResponse.json({ followingCount: followingInfo ?? 0 } as FollowingInfo);
}