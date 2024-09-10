import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prisma) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const { messageIds } = await req.json();

    if (!messageIds || !Array.isArray(messageIds)) {
        return NextResponse.json({ error: "Invalid message IDs" }, { status: 400 });
    }

    try {
        await prisma.messageReadReceipt.createMany({
            data: messageIds.map((messageId) => ({
                messageId,
                userId: user.id,
            })),
            skipDuplicates: true, // Avoid duplicate entries
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}