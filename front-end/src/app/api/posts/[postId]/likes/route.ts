import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { updateRewardProgress } from "@/lib/updateRewardProgress";

export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma?.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      cacheStrategy: { ttl: 60 },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma?.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        communityName: true,
        community: {
          select: {
            id: true,
          }
        }
      },
      cacheStrategy: { ttl: 60 },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma?.$transaction([
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
        create: {
          userId: loggedInUser.id,
          postId,
          communityName: post.communityName,
        },
        update: {},
      }),
      ...(loggedInUser.id !== post.userId
        ? [
          prisma.notification.create({
            data: {
              issuerId: loggedInUser.id,
              recipientId: post.userId,
              postId,
              type: "LIKE",
            },
          }),
        ]
        : []),
    ]);

    // Update reward progress
    await updateRewardProgress(loggedInUser.id, "LIKES");
    if (post.communityName) {
      await updateRewardProgress(loggedInUser.id, "COMMUNITY_LIKES");
    }

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma?.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        communityName: true,
      },
      cacheStrategy: { ttl: 60 },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma?.$transaction([
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    // Update reward progress (decrease by 1)
    await updateRewardProgress(loggedInUser.id, "LIKES", -1);
    if (post.communityName) {
      await updateRewardProgress(loggedInUser.id, "COMMUNITY_LIKES", -1);
    }

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

