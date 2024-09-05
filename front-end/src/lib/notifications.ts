import prisma from "./prisma";
import { SYSTEM_USER_ID } from "./constants";

export async function createNotification(userId: string, rewardId: string, rewardName: string, percentage: number) {
    if (!prisma) {
        throw new Error("Internal server error. Prisma client not found.");
    }

    // Check if the notification already exists
    const existingNotification = await prisma.notification.findFirst({
        where: {
            recipientId: userId,
            type: "REWARD_PROGRESS",
            rewardId: rewardId,
            message: {
                in: [
                    `You are almost there! You have ${Math.round(percentage)}% completed the "${rewardName}" reward!`,
                    `Congratulations! You can now claim your "${rewardName}" reward from your profile!`
                ]
            },
        },
    });

    if (existingNotification) {
        return;
    }

    const message = percentage === 100
        ? `Congratulations! You can now claim your "${rewardName}" reward from your profile!`
        : `You are almost there! You have ${Math.round(percentage)}% completed the "${rewardName}" reward!`;

    await prisma.notification.create({
        data: {
            type: "REWARD_PROGRESS",
            recipientId: userId,
            issuerId: SYSTEM_USER_ID,
            rewardId: rewardId,
            message: message,
            metadata: {
                // rewardId: rewardId, // Uncomment if defined in the schema
            },
            imageUrl: "https://avocodos.com/auth.webp",
        },
    });
}