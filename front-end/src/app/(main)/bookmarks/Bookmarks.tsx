"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { Metadata, Viewport } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Bookmarks",
    description:
      "Get all your bookmarks in one place. All posts you have bookmarked will be displayed here.",
    openGraph: {
      images: [
        {
          url: "/api/og?page=bookmarks",
          width: 1200,
          height: 630
        }
      ]
    },
    keywords: [
      "bookmarks",
      "bookmarked posts",
      "bookmarks page",
      "bookmarks on avocados",
      "web3 bookmarks",
      "aptos bookmarks"
    ]
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#2fbe13" },
      { media: "(prefers-color-scheme: dark)", color: "#3bf019" }
    ]
  };
}

export default function Bookmarks() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["post-feed", "bookmarks"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/bookmarked",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-foreground/80">
        You don&apos;t have any bookmarks yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading bookmarks.
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
