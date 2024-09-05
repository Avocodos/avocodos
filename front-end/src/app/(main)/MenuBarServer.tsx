import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import MenuBar from "./MenuBar"; // Import the client component

export default async function MenuBarServer({
  className
}: {
  className?: string;
}) {
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
    <MenuBar
      className={className}
      user={{
        username: user.username,
        avatarUrl: user.avatarUrl ?? ""
      }}
      unreadNotificationsCount={unreadNotificationsCount ?? 0}
      unreadMessagesCount={unreadMessagesCount ?? 0}
    />
  );
}
