"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { HTTPError } from "ky";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query,
            ...(pageParam ? { cursor: pageParam } : {})
          }
        })
        .json<PostsPage>()
        .catch((err: HTTPError) => {
          if (err.response.status === 404) {
            return { posts: [], nextCursor: null };
          }
          throw err;
        }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-foreground/80">
        No posts found for this query.
      </p>
    );
  }

  if (status === "error") {
    if (error instanceof HTTPError && error.response.status === 404) {
      return (
        <p className="text-center text-foreground/80">
          No results found for this query.
        </p>
      );
    }
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          canModerate={false}
          posterIsTheCreator={false}
        />
      ))}
      {isFetchingNextPage && <Spinner />}
    </InfiniteScrollContainer>
  );
}
