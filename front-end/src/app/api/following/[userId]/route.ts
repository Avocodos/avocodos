import { FollowingInfo } from "@/lib/types";
import { getKandMString } from "@/lib/utils";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function retryFunction(fun: () => Promise<any>, retries: number = 3, delay: number = 1000) {
    try {
        return await fun();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFunction(fun, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    const userId = params.userId;
    const followingInfo: number | null | undefined = await retryFunction(async () => {
        return await prisma?.follow.count({
            where: {
                followerId: userId
            }
        });
    });
    console.log(followingInfo);
    return NextResponse.json({ followingCount: getKandMString(followingInfo ?? 0) } as FollowingInfo);
}