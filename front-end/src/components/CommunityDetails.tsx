"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import { Community, Post } from "@prisma/client";
import Link from "next/link";
import CommunityPageSkeleton from "./skeletons/CommunityPageSkeleton";

// Update the CommunityWithMembers type
type CommunityWithMembersAndPosts = Community & {
  members: { id: string }[];
  description: string;
  _count: { members: number; posts: number };
  posts: (Post & { user: { username: string } })[];
};

export default function CommunityDetails({
  communityName
}: {
  communityName: string;
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const {
    data: community,
    isLoading,
    error
  } = useQuery<CommunityWithMembersAndPosts>({
    queryKey: ["community", communityName],
    queryFn: () =>
      kyInstance
        .get(`/api/communities/?communityName=${communityName}`)
        .json<CommunityWithMembersAndPosts>()
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
    }
  });

  if (isLoading) return <CommunityPageSkeleton />;
  if (error) return <div>Error loading community</div>;

  if (!community) return null;

  const isMember =
    community.members?.some((member) => member.id === user.id) ?? false;

  return (
    <div>
      <h1>{community.name}</h1>
      <p>{community.description}</p>
      <p>Members: {community._count.members}</p>
      <p>Posts: {community._count.posts}</p>
      {isMember ? (
        <Button onClick={() => leaveMutation.mutate()}>Leave Community</Button>
      ) : (
        <Button onClick={() => joinMutation.mutate()}>Join Community</Button>
      )}
      <h2>Posts</h2>
      <ul>
        {community.posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              <h3>{post.content.substring(0, 50)}...</h3>
            </Link>
            <p>Posted by: {post.user.username}</p>
            <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
