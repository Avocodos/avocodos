import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { updateRewardProgress } from "@/lib/updateRewardProgress";
import { handleUserAction } from "@/lib/eventHandler";

async function retryOperation(operation: () => Promise<any>, retries: number, interval: number) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, interval));
      } else {
        throw error; // Rethrow the error after all retries
      }
    }
  }
}

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

    if (!prisma) {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    const post = await retryOperation(() => prisma!.post.findUnique({ // Use non-null assertion
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
    }), 3, 5000); // Retry 3 times with 5 seconds interval

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
    await retryOperation(() => updateRewardProgress(loggedInUser.id, "LIKES"), 3, 5000);

    await retryOperation(() => handleUserAction(loggedInUser.id, "LIKES"), 3, 5000);

    if (post.communityName) {
      await retryOperation(() => updateRewardProgress(loggedInUser.id, "COMMUNITY_LIKES"), 3, 5000);
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

    if (!prisma) {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    const post = await retryOperation(() => prisma!.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        communityName: true,
      },
    }), 3, 5000); // Retry 3 times with 5 seconds interval

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
    await retryOperation(() => updateRewardProgress(loggedInUser.id, "LIKES", -1), 3, 5000);
    if (post.communityName) {
      await retryOperation(() => updateRewardProgress(loggedInUser.id, "COMMUNITY_LIKES", -1), 3, 5000);
    }

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

