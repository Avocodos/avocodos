import { Asset, Community, CommunityRole, Course, Notification, Prisma } from "@prisma/client";
import { CountType } from "./utils";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bannerUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    following: {
      where: {
        followingId: loggedInUserId,
      },
      select: {
        followingId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        following: true,
        followers: true,
        assets: true,
        sessions: true,
        communityRoles: true,
        assignedRoles: true,
        joinedCommunities: true,
        moderatedCommunities: true,
        createdCommunities: true,
        bookmarks: true,
        likes: true,
        comments: true,
      },
    },
    communityRoles: true,
    assets: true,
    assignedRoles: true,
    joinedCommunities: true,
    moderatedCommunities: true,
    walletAddress: true,
    email: true,
  } satisfies Prisma.UserSelect;
}

export interface UserData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  createdAt: Date;
  followers: {
    followerId: string;
    follower: UserData;
  }[];
  following: {
    followingId: string;
    following: UserData;
  }[];
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  communityRoles: CommunityRole[];
  assets: Asset[];
  assignedRoles: CommunityRole[];
  joinedCommunities: Community[];
  moderatedCommunities: Community[];
  walletAddress: string;
  email: string;
  isFollowedByUser: boolean;
}

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    badge: true,
    community: {
      select: {
        name: true,
        id: true,
        description: true,
      },
    },
    CommunityBadge: true,
    comments: {
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: getUserDataSelect(loggedInUserId),
        }
      },
    },

  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    post: {
      select: {
        community: {
          select: {
            name: true,
          },
        },
      },
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
  recipient: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export type NotificationType = Notification["type"];

export interface FollowerInfo {
  followers: CountType;
  isFollowedByUser: boolean;
}

export interface FollowingInfo {
  followingCount: CountType;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export interface CoursesPage {
  courses: Course[];
  nextCursor: string | null;
}
