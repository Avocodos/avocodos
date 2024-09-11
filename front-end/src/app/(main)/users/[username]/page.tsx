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
import {
  formatDatePretty,
  formatNumber,
  getKandMString,
  getMostProminentColorFromImage,
  rgbToHex
} from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound, useSearchParams } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import PostsCount from "@/components/posts/PostsCount";
import { User } from "lucia";
import { Clock } from "lucide-react";
import RewardsButton from "@/components/RewardsButton";
import FollowingCount from "@/components/FollowingCount";
import UserBanner from "@/components/UserBanner";

interface PageProps {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams(): Promise<
  {
    username: string;
  }[]
> {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const users = await prisma?.user.findMany({
        select: { username: true }
      });

      if (!users) return [];

      return users.map((user) => ({
        username: user.username
      }));
    } catch (error) {
      if (attempt === maxRetries - 1) return []; // Rethrow if last attempt
      await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
    }
  }
  return [];
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma?.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive"
      }
    },
    select: getUserDataSelect(loggedInUserId)
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
        `/api/og?username=${user.username}`,
        user.avatarUrl ?? `/api/og?username=${user.username}`,
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
      images: [
        `/api/og?username=${user.username}`,
        user.avatarUrl ?? `/api/og?username=${user.username}`
      ]
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
      icon: [{ url: "/favicon.ico" }, { url: "/icon.svg" }],
      apple: [{ url: "/apple-touch-icon.png" }],
      other: [
        {
          url: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          url: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
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

export default async function Page({
  params: { username },
  searchParams
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  const showRewards = searchParams.showRewards === "true";

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
      <div className="w-full min-w-0 space-y-8">
        <UserProfile
          user={user as unknown as UserData}
          loggedInUserId={loggedInUser.id}
          showRewards={showRewards}
        />
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
  showRewards: boolean;
}

async function UserProfile({
  user,
  loggedInUserId,
  showRewards
}: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: getKandMString(user._count.followers),
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId
    )
  };
  const color = await getMostProminentColorFromImage(
    user.avatarUrl ?? "https://avocodos.com/avatar-placeholder.png"
  );
  return (
    <div className="flex h-fit w-full flex-col gap-5 rounded-2xl border-2 border-muted bg-card shadow-sm">
      <div className="">
        <UserBanner className="rounded-t-2xl" user={user} bannerColor={color} />
        <UserAvatar
          avatarUrl={user.avatarUrl}
          size={152}
          className="-mt-[14%] ml-6 mr-auto select-none rounded-full border-8 border-card"
        />
      </div>
      <div className="p-6 pt-0">
        <div className="flex w-full flex-wrap gap-4 sm:flex-nowrap">
          <div className="me-auto w-full space-y-4">
            <div className="w-full">
              <div className="inline-flex w-full flex-col items-start justify-between text-primary-1000 dark:text-primary-0 md:flex-row">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h5>{user.displayName}</h5>
                    <p className="text-sm font-normal opacity-80">
                      @{user.username}
                    </p>
                  </div>
                  {user.bio && (
                    <>
                      <Linkify>
                        <p className="overflow-hidden whitespace-pre-line break-words text-sm font-normal">
                          {user.bio}
                        </p>
                      </Linkify>
                    </>
                  )}
                  <p className="mb-2 flex items-center gap-0.5 text-sm font-normal">
                    <Clock className="size-4" />
                    <span className="text-foreground/80">
                      Member since {formatDatePretty(user.createdAt)}
                    </span>
                  </p>
                  {user.id === loggedInUserId && (
                    <EditProfileButton user={user} className="mb-2" />
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {user.id !== loggedInUserId && (
                    <FollowButton
                      userId={user.id}
                      initialState={followerInfo}
                    />
                  )}
                  <RewardsButton
                    loggedInUserId={loggedInUserId}
                    user={user}
                    showRewards={showRewards}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 xs:grid-cols-3">
              <PostsCount count={user._count.posts} />
              <FollowerCount userId={user.id} initialState={followerInfo} />
              <FollowingCount
                userId={user.id}
                initialState={{
                  followingCount: getKandMString(user.following.length)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
