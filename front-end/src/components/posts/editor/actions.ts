"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";
import { handleUserAction } from "@/lib/eventHandler";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  communityName: string | null;
  badgeId: string | null;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds, communityName, badgeId } = createPostSchema.parse(input);

  // Check if the community exists if communityName is provided
  let validatedCommunityName: string | null = null;
  if (communityName) {
    const community = await prisma?.community.findUnique({
      where: { name: communityName },
    });
    if (!community) {
      throw new Error(`Community "${communityName}" does not exist`);
    }
    validatedCommunityName = community.name;
  }

  const newPost = await prisma?.post.create({
    data: {
      content,
      userId: user.id,
      communityName: validatedCommunityName,
      badgeId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  await handleUserAction(user.id, "POSTS");

  return newPost;
}
