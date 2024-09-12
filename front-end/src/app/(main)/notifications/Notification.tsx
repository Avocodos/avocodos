import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Gift, Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface NotificationProps {
  notification: NotificationData;
  onVisible: () => void;
}

export default function Notification({
  notification,
  onVisible
}: NotificationProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [onVisible]);

  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} started following you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notification.issuer.username}`
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`
    },
    LIKE: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 text-primary" />,
      href: `/posts/${notification.postId}`
    },
    REWARD_PROGRESS: {
      message: notification.message ?? "",
      icon: <Gift className="size-7 text-primary" />,
      href: `/users/${notification.recipient.username}?showRewards=true`
    },
    MENTION: {
      message: notification.message ?? "",
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/messages`
    }
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <Link href={href} className="block">
      <article
        ref={ref}
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold capitalize">
              {notification.issuer.displayName}
            </span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-foreground/80">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
