"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import PostEditor from "@/components/posts/editor/PostEditor";
import CommunityRoles from "@/components/CommunityRoles";
import CommunityBadges from "@/components/CommunityBadges";
import { Community, Post as PrismaPost, User } from "@prisma/client";
import Post from "@/components/posts/Post";
import { CommunityBadge, CommunityRole } from "@prisma/client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Clock, Cog, Loader2, LogIn, LogOut, Wrench } from "lucide-react";
import CommunityPageSkeleton from "@/components/skeletons/CommunityPageSkeleton";
import prisma from "@/lib/prisma";
import { formatDate } from "date-fns";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/use-toast";
import { PostData } from "@/lib/types";

interface ExtendedPost extends PrismaPost {
  user: User & {
    followers: { followerId: string }[];
    _count: { posts: number; followers: number };
    communityRoles: CommunityRole[];
    joinedCommunities: any[]; // Add this
    moderatedCommunities: any[]; // Add this
    assignedRoles: any[]; // Add this
    assets: any[]; // Add this
    posts: {
      id: string;
      title: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      badgeId: string | null;
    }[];
  };
  likes: any[];
  bookmarks: any[];
  _count: { likes: number; comments: number };
  attachments: any[];
  badge: CommunityBadge | null;
  communityRoles: CommunityRole[];
  community: { name: string; description: string | null } | null;
  comments: any[]; // Add this line
  communityBadge: CommunityBadge | null;
  CommunityBadge: CommunityBadge | null; // Add this line
}

interface ExtendedCommunity extends Community {
  members: User[];
  moderators: User[];
}

interface CommunityPageProps {
  communityName: string;
}

export default function CommunityPage({ communityName }: CommunityPageProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isModDialogOpen, setIsModDialogOpen] = useState(false);

  const { data: communityData, isLoading: communityLoading } =
    useQuery<ExtendedCommunity>({
      queryKey: ["community", communityName],
      queryFn: () =>
        kyInstance
          .get(`/api/communities/?communityName=${communityName}`)
          .json<ExtendedCommunity>()
    });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts", communityName],
    queryFn: () =>
      kyInstance
        .get(`/api/communities/${communityName}/posts`)
        .json<{ posts: ExtendedPost[] }>()
  });

  const joinMutation = useMutation({
    mutationFn: () => kyInstance.post(`/api/communities/${communityName}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityName] });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () =>
      kyInstance.delete(`/api/communities/${communityName}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityName] });
      toast({
        title: "Success",
        description: "You have left the community."
      });
    },
    onError: (error: any) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast({
              title: "Error",
              description: "You are not authorized to leave this community.",
              variant: "destructive"
            });
            break;
          case 403:
            toast({
              title: "Error",
              description:
                "You cannot leave this community as you are the creator.",
              variant: "destructive"
            });
            break;
          case 404:
            toast({
              title: "Error",
              description: "Community not found.",
              variant: "destructive"
            });
            break;
          default:
            toast({
              title: "Error",
              description:
                "An unexpected error occurred. Please try again later.",
              variant: "destructive"
            });
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  if (communityLoading || postsLoading) return <CommunityPageSkeleton />;

  if (!communityData)
    return (
      <p className="text-left text-sm text-foreground/80">
        Community not found
      </p>
    );

  const isMember =
    communityData.members?.some((member) => member.id === user.id) ?? false;
  const isModerator =
    communityData.moderators?.some((mod) => mod.id === user.id) ?? false;
  const isCreator = communityData.creatorId === user.id;
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="mb-4 max-w-full shrink grow-0 md:max-w-[70%]">
          <h1 className="pb-2">{communityData.name}</h1>
          <p className="whitespace-pre-wrap text-sm leading-[1.6] text-foreground/80">
            {communityData.description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {isMember ? (
            <Button
              className="min-w-fit"
              onClick={() => leaveMutation.mutate()}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="-mt-0.5 mr-2 size-4" />
              )}{" "}
              {leaveMutation.isPending
                ? "Leaving Community..."
                : "Leave Community"}
            </Button>
          ) : (
            <Button
              disabled={joinMutation.isPending}
              className="min-w-fit"
              onClick={() => joinMutation.mutate()}
            >
              {joinMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogIn className="-mt-0.5 mr-2 size-4" />
              )}{" "}
              {joinMutation.isPending
                ? "Joining Community..."
                : "Join Community"}
            </Button>
          )}
          {(isModerator || isCreator) && (
            <Dialog open={isModDialogOpen} onOpenChange={setIsModDialogOpen}>
              <DialogTrigger asChild>
                <Button className="min-w-fit" variant="secondary">
                  <Wrench className="mr-2 size-4" /> Moderation Tools
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full sm:max-w-[425px] md:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="inline-flex items-center gap-3">
                    <Wrench className="size-8" /> Moderation Tools
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex flex-col gap-2">
                    <CommunityRoles communityName={communityName} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <CommunityBadges communityName={communityName} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {isMember && (
        <PostEditor
          communityName={communityName}
          placeholderText={`Share something with the ${communityData.name} community!`}
        />
      )}
      <div className="flex flex-col gap-8">
        {posts?.posts ? (
          posts.posts.length > 0 &&
          posts.posts?.map((post) => {
            return (
              <React.Fragment key={post.id}>
                <Post
                  post={post as unknown as PostData}
                  canModerate={isModerator || isCreator}
                  posterIsTheCreator={post.user.id === communityData.creatorId}
                  communityBadge={post.badge}
                />
              </React.Fragment>
            );
          })
        ) : (
          <p className="text-sm text-foreground/80">No posts found</p>
        )}
      </div>
      {/* Community was created on */}
      <div className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm text-foreground/80">
        <Clock className="size-3.5" />{" "}
        <span>
          This community was created on{" "}
          {formatDate(communityData.createdAt, "MMMM do, yyyy")}
        </span>
      </div>
    </div>
  );
}
