import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home, Users } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma?.notification.count({
      where: {
        recipientId: user.id,
        read: false
      }
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count
  ]);

  return (
    <div className={cn("[&>*]:!px-2 lg:[&>*]:!px-4", className)}>
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Home"
        asChild
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Communities"
        asChild
      >
        <Link href="/communities">
          <Users />
          <span className="hidden lg:inline">Communities</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount ?? 0 }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
      {/* Profile button */}
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Profile"
        asChild
      >
        <Link href={`/users/${user.username}`}>
          <UserAvatar size={24} avatarUrl={user.avatarUrl} />
          <span className="hidden lg:inline">Profile</span>
        </Link>
      </Button>
    </div>
  );
}
