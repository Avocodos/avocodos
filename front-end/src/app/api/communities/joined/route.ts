import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/auth';


export async function GET(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch data from the database
        const joinedCommunities = await prisma?.community.findMany({
            where: {
                members: {
                    some: {
                        username: user.username,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { members: true, posts: true },
                },
            },
        });

        return NextResponse.json(joinedCommunities);
    } catch (error) {
        console.error('Error fetching joined communities:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}