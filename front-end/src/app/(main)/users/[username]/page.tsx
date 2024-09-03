import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import {
  FollowerInfo,
  FollowingInfo,
  getUserDataSelect,
  UserData
} from "@/lib/types";
import { formatDatePretty, formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import PostsCount from "@/components/PostsCount";
import { User } from "lucia";
import { Clock } from "lucide-react";
import RewardsButton from "@/components/RewardsButton";
import FollowingCount from "@/components/FollowingCount";

interface PageProps {
  params: { username: string };
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  const users = await prisma?.user.findMany({
    select: { username: true }
  });

  if (!users) return [];

  return users.map((user) => ({
    username: user.username
  }));
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma?.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive"
      }
    },
    select: getUserDataSelect(loggedInUserId),
    cacheStrategy: { ttl: 60 }
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const user = await prisma?.user.findFirst({
    where: {
      username: {
        equals: params.username,
        mode: "insensitive"
      }
    },
    select: {
      displayName: true,
      username: true,
      bio: true,
      avatarUrl: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true
        }
      }
    }
  });

  if (!user) return {};

  const previousImages = (await parent).openGraph?.images || [];

  const description = `Check out ${user.displayName}'s profile on Avocodos. ${user.bio || ""} Followers: ${user._count.followers}, Following: ${user._count.following}, Posts: ${user._count.posts}`;

  return {
    title: `${user.displayName} (@${user.username})`,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/users/${user.username}`
    },
    openGraph: {
      title: `${user.displayName} (@${user.username})`,
      description,
      url: `https://avocodos.com/users/${user.username}`,
      siteName: "Avocodos",
      images: [
        user.avatarUrl || `/api/og?username=${user.username}`,
        ...previousImages
      ],
      locale: "en_US",
      type: "profile"
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.displayName} (@${user.username})`,
      description,
      creator: "@HarjjotSinghh",
      images: [user.avatarUrl || `/api/og?username=${user.username}`]
    },
    category: "Web3 Social Platform",
    keywords: [
      user.displayName,
      user.username,
      "Avocodos",
      "Web3",
      "Social Media",
      "Blockchain",
      "Cryptocurrency",
      "NFT",
      "Digital Assets",
      "Decentralized",
      "DeFi",
      "Crypto Social",
      "Blockchain Social",
      "User Profile",
      "Social Network",
      "Web3 Profile",
      "Crypto Influencer",
      "Blockchain Community",
      "Digital Identity",
      "Crypto Enthusiast",
      "Web3 User",
      "Blockchain User",
      "Crypto Social Network",
      "Decentralized Social",
      "Web3 Social Media",
      "Blockchain Social Platform",
      "Crypto Content Creator",
      "Web3 Influencer",
      "Blockchain Influencer",
      "Crypto Community Member",
      "Web3 Community",
      "Blockchain Identity",
      "Crypto Profile",
      "Web3 Account",
      "Blockchain Account",
      "Decentralized Identity",
      "Crypto Social Graph",
      "Web3 Social Graph",
      "Blockchain Social Graph",
      "Crypto Networking",
      "Web3 Networking",
      "Blockchain Networking",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Social Platform",
      "Blockchain Social Media",
      "Crypto User Profile",
      "Web3 User Profile",
      "Blockchain User Profile",
      "Decentralized User Profile",
      "Crypto Social Identity",
      "Web3 Social Identity",
      "Blockchain Social Identity",
      "Decentralized Social Identity"
      // Add more relevant keywords here...
    ],
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    applicationName: "Avocodos",
    referrer: "origin-when-cross-origin",
    appLinks: {
      web: {
        url: "https://avocodos.com",
        should_fallback: true
      }
    },
    icons: {
      icon: [{ url: "/favicon.ico" }, { url: "/icon.png" }],
      apple: [{ url: "/apple-icon.png" }],
      other: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    }
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

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const user = await getUser(decodeURI(username), loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile
          user={user as unknown as UserData}
          loggedInUserId={loggedInUser.id}
        />
        <div className="rounded-2xl border-2 border-muted bg-card p-5 shadow-sm">
          <h4 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h4>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId
    )
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl border-2 border-muted bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex w-full flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto w-full space-y-3">
          <div className="w-full">
            <h5 className="inline-flex w-full items-start justify-between">
              <div className="flex flex-col gap-2">
                {user.displayName}
                <p className="-mt-1.5 text-sm font-normal text-foreground/80">
                  @{user.username}
                </p>
                <p className="-mt-1.5 flex items-center gap-0.5 text-xs font-normal text-foreground/80">
                  <Clock className="size-3" /> Member since{" "}
                  {formatDatePretty(user.createdAt)}
                </p>
              </div>
              {user.id === loggedInUserId ? (
                <div className="grid grid-cols-1 gap-2">
                  <EditProfileButton user={user} />
                  <RewardsButton user={user} />
                </div>
              ) : (
                <FollowButton userId={user.id} initialState={followerInfo} />
              )}
            </h5>

            {user.bio && (
              <>
                <hr className="my-2 h-[1.5px] w-full bg-foreground/30" />
                <Linkify>
                  <div className="overflow-hidden whitespace-pre-line break-words">
                    {user.bio}
                  </div>
                </Linkify>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <PostsCount count={user._count.posts} />
            <FollowerCount userId={user.id} initialState={followerInfo} />
            <FollowingCount
              userId={user.id}
              initialState={{
                followingCount: user.following.length
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
