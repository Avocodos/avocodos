import prisma from "./prisma";
import { SYSTEM_USER_ID } from "./constants";

export async function createNotification(userId: string, rewardId: string, rewardName: string, percentage: number) {
    if (!prisma) {
        throw new Error("Internal server error. Prisma client not found.");
    }

    const message = percentage === 100
        ? `Congratulations! You can now claim your "${rewardName}" reward from your profile!`
        : `You are almost there! You have ${Math.round(percentage)}% completed the "${rewardName}" reward!`;

    await prisma.notification.create({
        data: {
            type: "REWARD_PROGRESS",
            recipientId: userId,
            issuerId: SYSTEM_USER_ID,
            message: message,
            metadata: {
                rewardId: rewardId,
                percentage: percentage,
            },
            imageUrl: "https://avocodos.com/auth.webp",
        },
    });
}