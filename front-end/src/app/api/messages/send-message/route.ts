import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Media } from "@prisma/client";
import io from "@/lib/socketio";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, channelId, attachments } = await req.json();

    if (!prisma) return NextResponse.json({ error: "Prisma client not initialized" }, { status: 500 });

    if (!content || !channelId) {
        return NextResponse.json({ error: "Content and channelId are required" }, { status: 400 });
    }
    try {

        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: { members: true }
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        if (!channel.members.some(member => member.id === user.id)) {
            return NextResponse.json({ error: "User is not a member of this channel" }, { status: 403 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                userId: user.id,
                channelId,
                type: "TEXT",
                attachments: {
                    createMany: {
                        data: attachments.map((attachment: Media & { mediaId: string }) => ({
                            type: attachment.type.includes("image") ? "IMAGE" : "VIDEO",
                            url: attachment.url,
                            channelId: channelId,
                            mediaId: attachment.mediaId ?? randomUUID().toString()
                        }))
                    }
                }
            }
        });

        for (const member of channel.members) {
            const messageReadReceipt = await prisma.messageReadReceipt.create({
                data: {
                    messageId: message.id,
                    userId: member.id,
                    channelId,
                    read: false,
                }
            });
            console.log("messageReadReceipt:", messageReadReceipt);
        }

        io.emit("new_message", message);

        return NextResponse.json(message);

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}