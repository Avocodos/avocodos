import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest, res: NextResponse) {
    const { channelId } = await req.json();

    if (!prisma) return NextResponse.json({ error: "Prisma client not initialized" }, { status: 500 });

    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
    });

    return NextResponse.json({ channel });
}