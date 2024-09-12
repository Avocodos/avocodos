import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { channelId: string } }
) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { channelId } = params;

        if (!prisma) {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        // Update MessageReadReceipts for unread messages in the channel
        await prisma.messageReadReceipt.updateMany({
            where: {
                channelId: channelId,
                userId: user.id,
                read: false,
            },
            data: {
                readAt: new Date(),
                read: true,
            },
        });

        await prisma.message.updateMany({
            where: {
                channelId: channelId,
                messageReadReceipts: {
                    none: {
                        userId: user.id,
                        read: true
                    }
                }
            },
            data: {
                read: true
            }
        });

        const channel = await prisma.channel.update({
            where: {
                id: channelId
            },
            data: {
                messageReadReceipt: {
                    updateMany: {
                        where: {
                            userId: user.id,
                            read: false
                        },
                        data: {
                            readAt: new Date(),
                            read: true
                        }
                    }
                }
            }
        })
        // Count the number of messages marked as read
        const markedAsReadCount = await prisma.messageReadReceipt.count({
            where: {
                channelId: channelId,
                userId: user.id,
                read: true,
                readAt: {
                    gte: new Date(Date.now() - 5000) // Messages marked as read in the last 5 seconds
                }
            }
        });

        // Update the unread count for the user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                unreadMessageCount: {
                    decrement: markedAsReadCount
                }
            }
        });

        return NextResponse.json({ message: 'Messages marked as read', count: markedAsReadCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}