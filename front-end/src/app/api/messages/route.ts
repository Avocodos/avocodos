import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const { message, sender } = await req.json();
    if (!prisma) {
        return NextResponse.json({ error: 'Prisma client not initialized' }, { status: 500 });
    }
    const newMessage = await prisma.message.create({
        data: {
            data: message as string,
            sender: sender as string,
        },
    });
    return NextResponse.json(newMessage);
}

export async function GET() {
    if (!prisma) {
        return NextResponse.json({ error: 'Prisma client not initialized' }, { status: 500 });
    }
    const messages = await prisma.message.findMany();
    return NextResponse.json(messages);
}