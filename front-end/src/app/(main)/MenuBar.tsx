"use client"; // Client component
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";
import PostEditorDialog from "@/components/posts/PostEditorDialog"; // Import the dialog
import { BookmarkIcon, HomeIcon, PlusCircleIcon, Users2 } from "lucide-react";

interface MenuBarProps {
  user: { username: string; avatarUrl: string };
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  className?: string;
}

export default function MenuBar({
  user,
  unreadNotificationsCount,
  unreadMessagesCount,
  className
}: MenuBarProps) {
  const [isPostEditorOpen, setPostEditorOpen] = useState(false);
  return (
    <div
      className={cn(
        "border-2 border-muted [&>*]:!px-0.5 lg:[&>*]:!px-4",
        className
      )}
    >
      <PostEditorDialog
        open={isPostEditorOpen}
        onOpenChange={setPostEditorOpen}
      />{" "}
      {/* Dialog component */}
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Home"
        asChild
      >
        <Link href="/" className="flex items-center justify-start gap-3">
          <HomeIcon size={24} />
          <span className="hidden lg:block">Home</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Communities"
        asChild
      >
        <Link
          href="/communities"
          className="flex items-center justify-start gap-3"
        >
          <Users2 size={24} />
          <span className="hidden lg:block">Communities</span>
        </Link>
      </Button>
      <NotificationsButton />
      <MessagesButton />
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Bookmarks"
        asChild
      >
        <Link
          href="/bookmarks"
          className="flex items-center justify-start gap-3"
        >
          <BookmarkIcon size={24} />
          <span className="hidden lg:block">Bookmarks</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn("flex items-center justify-start gap-3")}
        title="Create Post"
        onClick={() => setPostEditorOpen(true)}
      >
        <PlusCircleIcon size={24} />
        <span className="hidden lg:block">Create Post</span>
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
          <span className="hidden lg:block">Profile</span>
        </Link>
      </Button>
    </div>
  );
}
