import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const { messageId, reaction, userId } = await req.json();
    if (!prisma) {
        return NextResponse.json({ error: 'Prisma client not initialized' }, { status: 500 });
    }
    const newReaction = await prisma.messageReaction.create({
        data: {
            messageId: messageId as string,
            reaction: reaction as string,
            userId: userId as string,
        },
    });
    return NextResponse.json(newReaction);
}
