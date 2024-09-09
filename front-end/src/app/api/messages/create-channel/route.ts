import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();
    const { recipientId } = await req.json();

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!prisma) return Response.json({ error: "Prisma client not initialized" }, { status: 500 });

    // Check if recipientId exists
    const recipientExists = await prisma.user.findUnique({
        where: { id: recipientId },
    });

    if (!recipientExists) {
        return Response.json({ error: "Recipient not found" }, { status: 404 });
    }

    if (!prisma) return Response.json({ error: "Prisma client not initialized" }, { status: 500 });

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await prisma.channel.create({
        data: {
            type: "DIRECT",
            members: {
                connect: [{ id: user.id }, { id: recipientId }],
            },
        },
    });

    return Response.json(channel);
}