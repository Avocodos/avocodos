import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function PUT(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    const user = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    const postId = params.postId;

    try {
        const post = await prisma?.post.findUnique({
            where: { id: postId },
            select: { userId: true },
            cacheStrategy: { ttl: 60 },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.userId !== user.user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedPost = await prisma?.post.update({
            where: { id: postId },
            data: { content },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}