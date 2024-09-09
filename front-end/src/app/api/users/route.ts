import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {

    if (!prisma) return NextResponse.json({
        error: "Prisma client not initialized"
    }, {
        status: 500
    })

    const q = req.nextUrl.searchParams.get("q");

    if (q) {
        const users = await prisma.user.findMany({
            where: {
                displayName: {
                    contains: q,
                    mode: "insensitive"
                }
            }
        })
        return NextResponse.json(users);
    }

    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}