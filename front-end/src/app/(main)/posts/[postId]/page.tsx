import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import Spinner from "@/components/Spinner";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, ReactNode, Suspense } from "react";

interface PageProps {
  params: { postId: string };
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma?.post.findUnique({
    where: {
      id: postId
    },
    include: getPostDataInclude(loggedInUserId),
    cacheStrategy: { ttl: 60 }
  });

  if (!post) notFound();

  return post;
});

export async function generateStaticParams() {
  const posts = await prisma?.post.findMany({
    select: { id: true }
  });

  if (!posts) return [];

  return posts.map((post) => ({
    postId: post.id
  }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await prisma?.post.findUnique({
    where: { id: params.postId },
    include: {
      user: {
        select: {
          displayName: true,
          username: true
        }
      }
    }
  });

  if (!post) return {};

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
    description: post.content.slice(0, 200),
    openGraph: {
      images: [`/api/og?postId=${post.id}`, ...previousImages]
    }
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, user.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post
          canModerate={user.id === post.user.id}
          posterIsTheCreator={false}
          post={post}
        />
      </div>
      <div className="sticky top-[5.4em] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Spinner />}>
          <UserInfoSidebar user={post.user as unknown as UserData} />
        </Suspense>
      </div>
    </main>
  );
}

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold capitalize">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-foreground/80">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-foreground/80">
          {user.bio}
        </div>
      </Linkify>
      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.id
            )
          }}
        />
      )}
    </div>
  );
}
