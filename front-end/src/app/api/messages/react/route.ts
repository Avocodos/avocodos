import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import io from "@/lib/socketio";

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();
    const { messageId, reaction } = await req.json();
    if (!prisma) return Response.json({ error: "Prisma client not initialized" }, { status: 500 });
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const existingReaction = await prisma.reaction.findFirst({
        where: {
            messageId,
            userId: user.id,
        },
    });

    if (existingReaction) {
        await prisma.reaction.update({
            where: {
                id: existingReaction.id,
            },
            data: {
                reaction,
            },
        });
    } else {
        await prisma.reaction.create({
            data: {
                messageId,
                userId: user.id,
                reaction,
            },
        });
    }

    // Emit event to update reactions in real-time
    io.emit("message_reacted", { messageId, userId: user.id, reaction });

    return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const { user } = await validateRequest();
    const { messageId, reaction } = await req.json();
    if (!prisma) return Response.json({ error: "Prisma client not initialized" }, { status: 500 });
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const existingReaction = await prisma.reaction.findFirst({
        where: {
            messageId,
            userId: user.id,
            reaction,
        },
    });

    if (!existingReaction) {
        return Response.json({ error: "Reaction not found" }, { status: 404 });
    }

    await prisma.reaction.delete({
        where: {
            id: existingReaction.id,
            reaction,
        },
    });
    return NextResponse.json({ success: true });
}

