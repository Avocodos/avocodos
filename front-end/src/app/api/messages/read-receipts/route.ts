import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { user } = await validateRequest();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const messageIds = req.nextUrl.searchParams.get("messageIds")?.split(",") || [];

    if (!messageIds.length) {
        return NextResponse.json({ error: "No message IDs provided" }, { status: 400 });
    }

    try {
        const readReceipts = await prisma.messageReadReceipt.findMany({
            where: {
                messageId: { in: messageIds },
                userId: user.id,
            },
            include: {
                message: true,
            },
        });

        return NextResponse.json(readReceipts);
    } catch (error) {
        console.error("Error fetching read receipts:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}