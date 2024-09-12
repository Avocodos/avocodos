"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { useEffect, useState } from "react";
import Notification from "./Notification";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export default function Notifications() {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>(
    []
  );
  useNotificationSocket();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const queryClient = useQueryClient();

  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationIds: string[]) =>
      kyInstance.patch("/api/notifications/mark-as-read", {
        json: { notificationIds }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"]
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    }
  });

  useEffect(() => {
    if (visibleNotifications.length > 0) {
      markAsRead(visibleNotifications);
    }
  }, [visibleNotifications, markAsRead]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <p className="text-center text-foreground/80">
        You don&apos;t have any notifications yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading notifications.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onVisible={() =>
            setVisibleNotifications((prev) => [...prev, notification.id])
          }
        />
      ))}
      {isFetchingNextPage && <Spinner />}
    </InfiniteScrollContainer>
  );
}
