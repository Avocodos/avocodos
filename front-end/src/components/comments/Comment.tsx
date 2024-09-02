import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";
import { UserData } from "@/lib/types";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip
          user={{ ...comment.user, isFollowedByUser: false } as UserData}
        >
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip
            user={
              {
                ...comment.user,
                isFollowedByUser: false,
                avatarUrl: comment.user.avatarUrl ?? "",
                bio: comment.user.bio ?? "" // Add this line
              } as UserData
            }
          >
            <Link
              href={`/users/${comment.user.username}`}
              className="font-medium"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-foreground/80">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
      {comment.user.id === user.id && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
