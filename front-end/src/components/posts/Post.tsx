"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, PostData, UserData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { CommunityRole, Media, User } from "@prisma/client";
import { Crown, Edit, ExternalLink, MessageSquare, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "../ui/use-toast";
import { Badge } from "../ui/badge";
import prisma from "@/lib/prisma";
import { HTTPError } from "ky";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import FollowerCount from "../FollowerCount";
import PostsCount from "./PostsCount";
import FollowButton from "../FollowButton";
import UserTooltip from "../UserTooltip";

interface PostProps {
  post: PostData;
  canModerate: boolean;
  posterIsTheCreator: boolean;
  communityBadge?: { name: string; color: string } | null;
}

export default function Post({
  post,
  canModerate,
  posterIsTheCreator,
  communityBadge
}: PostProps) {
  const { user } = useSession();
  const { data: userData } = useQuery({
    queryKey: ["user-data", user.username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${user.username}`).json<UserData>(),
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity
  });
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <article className="group/post space-y-3 rounded-2xl border-2 border-muted bg-card p-5 shadow-sm">
        <div className="flex justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <UserTooltip user={post.user as unknown as UserData}>
              <Link
                className="flex items-center gap-2"
                href={`/users/${post.user.username}`}
              >
                <UserAvatar avatarUrl={post.user.avatarUrl} />
                <div className="flex flex-col gap-0">
                  <Link
                    href={`/users/${post.user.username}`}
                    className="inline-flex flex-row flex-wrap items-center gap-2 font-medium"
                  >
                    {post.user.displayName}
                  </Link>
                  <Link
                    href={`/posts/${post.id}`}
                    className="block text-xs text-foreground/80"
                    suppressHydrationWarning
                  >
                    {formatRelativeDate(post.createdAt)}
                  </Link>
                </div>
              </Link>
            </UserTooltip>
            <div>
              <div className="flex flex-row flex-wrap items-center gap-2">
                {posterIsTheCreator && (
                  <Badge
                    variant={"light"}
                    className="inline-flex items-center gap-1.5 py-1"
                  >
                    <Crown className="size-3.5" />
                    Community Creator
                  </Badge>
                )}
                {userData?.communityRoles?.map((role) => (
                  <Badge
                    key={role.id}
                    variant={"secondary"}
                    className="inline-flex items-center gap-1.5 border py-1"
                    style={{ borderColor: role.color }}
                  >
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/posts/${post.id}`}>
              <Button size="icon" variant="ghost">
                <ExternalLink className="size-4 text-foreground/90" />
              </Button>
            </Link>
            {post.user.id === user.id && (
              <PostMoreButton canModerate={canModerate} post={post} />
            )}
          </div>
        </div>
        {communityBadge && (
          <React.Fragment>
            <Badge
              variant="secondary"
              className={`!mb-4 flex w-fit items-center gap-1.5 border px-3 py-1.5 text-xs`}
              style={{ borderColor: communityBadge.color }}
            >
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: communityBadge.color }}
              />
              <span>{communityBadge.name}</span>
            </Badge>
            <hr className="text-foreground/80" />
          </React.Fragment>
        )}
        <Linkify>
          <div className="whitespace-pre-line break-words">
            {post.content ?? ""}
          </div>
        </Linkify>
        {!!post.attachments.length && (
          <MediaPreviews attachments={post.attachments} />
        )}
        <hr className="text-foreground/80" />
        <div className="flex justify-between gap-5">
          <div className="flex items-center gap-5">
            <LikeButton
              postId={post.id}
              initialState={{
                likes: post._count.likes,
                isLikedByUser: post.likes.some(
                  (like) => like.userId === user.id
                )
              }}
            />
            <CommentButton
              post={post}
              onClick={() => setShowComments(!showComments)}
            />
          </div>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id
              )
            }}
          />
        </div>
        {showComments && <Comments post={post} />}
      </article>
    </>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}

interface UserTooltipProps {
  children: React.ReactNode;
  username: string;
}

function UserTooltip2({ children, username }: UserTooltipProps) {
  const { user: loggedInUser } = useSession();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>()
  });
  const isFollowedByUser = userData?.followers
    ? userData?.followers.some(
        (follower) => follower.followerId === loggedInUser.id
      )
    : false;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="w-80 p-4">
          {isLoading ? (
            <p>Loading user data...</p>
          ) : userData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar avatarUrl={userData.avatarUrl} size={48} />
                  <div>
                    <h5>{userData.displayName}</h5>
                    <p className="text-sm text-muted-foreground">
                      @{userData.username}
                    </p>
                  </div>
                </div>
                {userData.id !== loggedInUser.id && (
                  <FollowButton
                    userId={userData.id}
                    initialState={{
                      followers: userData._count.followers,
                      isFollowedByUser: userData.following.some(
                        ({ followingId }) => followingId === userData.id
                      )
                    }}
                  />
                )}
              </div>
              {userData.bio && (
                <Linkify>
                  <div className="line-clamp-6 whitespace-pre-line text-pretty break-words text-base text-foreground/80">
                    {userData.bio}
                  </div>
                </Linkify>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <FollowerCount
                  userId={userData.id}
                  initialState={{
                    followers: userData._count.followers,
                    isFollowedByUser: isFollowedByUser!
                  }}
                />
                <PostsCount count={userData._count.posts} />
              </div>
            </div>
          ) : (
            <p>User not found</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
