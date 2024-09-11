import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getPostDataInclude } from "@/lib/types";

export async function GET(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const { communityName } = params;
        const posts = await prisma?.post.findMany({
            where: { communityName },
            include: getPostDataInclude(user.id),
            orderBy: { createdAt: "desc" },

        });


        return Response.json({
            posts: posts,
        });

    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { communityName: string } }
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { content, badgeId } = await req.json();
        const { communityName } = params;

        const community = await prisma?.community.findUnique({
            where: { name: decodeURI(communityName) },
            include: { members: true },
        });

        if (!community) return Response.json({ error: "Community not found" }, { status: 404 });
        if (!community.members.some(member => member.id === user.id)) {
            return Response.json({ error: "You must be a member to post" }, { status: 403 });
        }

        const post = await prisma?.post.create({
            data: {
                content,
                userId: user.id,
                communityName,
                badgeId,
            },
            include: getPostDataInclude(user.id),
        });

        return Response.json(post);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const { postId } = await req.json();
        const post = await prisma?.post.findUnique({
            where: { id: postId },
            include: { community: { include: { moderators: true } } },
        });

        if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

        if (post.userId !== user.id &&
            post.community?.creatorId !== user.id &&
            !post.community?.moderators.some(mod => mod.id === user.id)) {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma?.post.delete({ where: { id: postId } });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
) {
    try {
        const { user } = await validateRequest();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const { content, postId } = await req.json();

        const post = await prisma?.post.findUnique({
            where: { id: postId },
        });

        if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
        if (post.userId !== user.id) return Response.json({ error: "Unauthorized" }, { status: 403 });

        const updatedPost = await prisma?.post.update({
            where: { id: postId },
            data: { content },
            include: { user: true, community: true }
        });

        return Response.json(updatedPost);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}