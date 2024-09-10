import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { mintNFT } from "@/lib/nft";
import { RewardRequirementType } from "@prisma/client";
import { AVOCODOS_WELCOME_REWARD_ID, BASE_URL } from "@/lib/constants";
import kyInstance from "@/lib/ky";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function retryValidateRequest(retries = 0): Promise<any> {
    const result = await validateRequest();
    if (!result.user && retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryValidateRequest(retries + 1);
    }
    return result;
}

async function getUserData(userId: string, retries = 0): Promise<any> {
    const userData = await prisma?.user.findUnique({
        where: { id: userId },
    });

    if (!userData && retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return getUserData(userId, retries + 1);
    }

    return userData;
}

export async function POST(req: NextRequest) {
    const { user } = await retryValidateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("user: ", user)

    try {
        const userData = await getUserData(user.id);

        if (!userData || !userData.walletAddress) {
            return NextResponse.json({ error: "User wallet address not found" }, { status: 400 });
        }

        const welcomeNFTData = {
            recipientAddress: userData.walletAddress,
            courseTitle: "Welcome to Avocodos",
            displayName: user.displayName,
            imageUrl: "https://utfs.io/f/c2e10a91-1d35-449d-bcbf-1f2d7b9f0e5a-2x1db.png",
            userId: user.id,
        };

        const { mintedNFT, createdAsset } = await mintNFT(welcomeNFTData);

        // Check if createdAsset is valid before creating user reward
        if (!createdAsset || !createdAsset.id) {
            return NextResponse.json({ error: "Invalid asset created" }, { status: 500 });
        }

        const reward = await prisma?.reward.findUniqueOrThrow({
            where: {
                id: AVOCODOS_WELCOME_REWARD_ID,
            }
        });

        if (!reward) {
            return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
        }

        const userReward = await prisma?.userReward.create({
            data: {
                rewardId: reward.id,
                userId: user.id,
                progress: reward.requirement,
                claimed: true,
            }
        });

        if (!userReward) {
            return NextResponse.json({ error: "Failed to create user reward" }, { status: 500 });
        }

        return NextResponse.json({ success: true, nft: mintedNFT, asset: createdAsset });
    } catch (error) {
        console.error("Error minting welcome NFT:", error);
        return NextResponse.json({ error: "Failed to mint welcome NFT" }, { status: 500 });
    }
}