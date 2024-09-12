"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationsButton() {
  const { data, isLoading, error } = useQuery<NotificationCountInfo>({
    queryKey: ["unread-notification-count"],
    queryFn: () => kyInstance.get("/api/notifications/unread-count").json(),
    refetchInterval: 60000 // Refetch every minute
  });

  if (isLoading)
    return (
      <Button variant="ghost">
        <Bell />
      </Button>
    );
  if (error)
    return (
      <Button variant="ghost">
        <Bell />
      </Button>
    );

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell />
          {!!data?.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  );
}
