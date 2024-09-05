import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import Spinner from "@/components/Spinner";
import { Metadata, ResolvingMetadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, ReactNode, Suspense } from "react";

interface PageProps {
  params: { postId: string };
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma?.post.findUnique({
    where: {
      id: postId
    },
    include: getPostDataInclude(loggedInUserId)
  });

  if (!post) notFound();

  return post;
});

export async function generateStaticParams(): Promise<
  {
    postId: string;
  }[]
> {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const posts = await prisma?.post.findMany({
      select: { id: true }
    });

    if (posts) {
      return posts.map((post) => ({
        postId: post.id
      }));
    }

    // Wait before retrying
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return []; // Return empty if all retries fail
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await prisma?.post.findUnique({
    where: { id: params.postId },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });

  if (!post) return {};

  const previousImages = (await parent).openGraph?.images || [];

  const description = `${post.content.slice(0, 150)}... | ${post._count.likes} likes, ${post._count.comments} comments.`;

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/posts/${post.id}`
    },
    openGraph: {
      title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
      description,
      url: `https://avocodos.com/posts/${post.id}`,
      siteName: "Avocodos",
      images: [
        post.user.avatarUrl || `/api/og?postId=${post.id}`,
        ...previousImages
      ],
      locale: "en_US",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
      description,
      creator: "@HarjjotSinghh",
      images: [post.user.avatarUrl || `/api/og?postId=${post.id}`]
    },
    category: "Web3 Social Platform",
    keywords: [
      post.user.displayName,
      post.user.username,
      "Avocodos",
      "Web3 Post",
      "Blockchain Social",
      "Crypto Content",
      "NFT Discussion",
      "Digital Assets",
      "Decentralized Social",
      "DeFi Post",
      "Crypto Social Network",
      "Web3 Content",
      "Blockchain Discussion",
      "Crypto Community Post",
      "NFT Social",
      "Digital Identity Post",
      "Web3 User Content",
      "Blockchain User Post",
      "Crypto Social Engagement",
      "Decentralized Content",
      "Web3 Social Media Post",
      "Blockchain Social Platform Content",
      "Crypto Influencer Post",
      "Web3 Community Discussion",
      "Blockchain Identity Post",
      "Crypto Profile Content",
      "Web3 Account Post",
      "Blockchain Account Content",
      "Decentralized Identity Post",
      "Crypto Social Graph Content",
      "Web3 Social Graph Post",
      "Blockchain Social Graph Content",
      "Crypto Networking Post",
      "Web3 Networking Content",
      "Blockchain Networking Post",
      "Decentralized Social Network Content",
      "Crypto Social Platform Post",
      "Web3 Social Platform Content",
      "Blockchain Social Media Post",
      "Crypto User Profile Content",
      "Web3 User Profile Post",
      "Blockchain User Profile Content",
      "Decentralized User Profile Post",
      "Crypto Social Identity Content",
      "Web3 Social Identity Post",
      "Blockchain Social Identity Content",
      "Decentralized Social Identity Post",
      "Crypto Community Engagement",
      "Web3 Community Interaction",
      "Blockchain Community Discussion",
      "NFT Conversation",
      "Digital Asset Dialogue",
      "DeFi Discussion",
      "Crypto Market Talk",
      "Web3 Technology Debate",
      "Blockchain Innovation Chat",
      "Cryptocurrency Trends",
      "NFT Market Insights",
      "Web3 Development News",
      "Blockchain Use Cases",
      "Crypto Adoption Stories",
      "Decentralized Finance Updates",
      "NFT Artist Spotlight",
      "Crypto Regulation Discussion",
      "Web3 Gaming Conversation",
      "Blockchain Environmental Impact",
      "Crypto Education Post",
      "NFT Collecting Strategies",
      "Web3 Privacy Concerns",
      "Blockchain Scalability Solutions",
      "Crypto Mining Debate",
      "Decentralized Autonomous Organizations",
      "NFT Royalties Discussion",
      "Web3 Interoperability",
      "Blockchain Governance Models",
      "Crypto Wallet Security",
      "NFT Utility Beyond Art",
      "Web3 Social Impact",
      "Blockchain in Supply Chain",
      "Crypto Economic Models",
      "Decentralized Identity Solutions",
      "NFT Fractionalization",
      "Web3 User Experience",
      "Blockchain Energy Consumption",
      "Crypto Mass Adoption Challenges",
      "NFT in Gaming",
      "Web3 Infrastructure",
      "Blockchain in Healthcare",
      "Crypto Lending Platforms",
      "Decentralized Storage Solutions",
      "NFT Marketplaces Comparison",
      "Web3 Job Opportunities",
      "Blockchain Voting Systems",
      "Crypto Portfolio Strategies",
      "NFT Environmental Concerns",
      "Web3 Data Ownership",
      "Blockchain in Real Estate",
      "Crypto Tax Implications",
      "Decentralized Exchange Pros and Cons",
      "NFT Authentication Methods",
      "Web3 Browser Extensions",
      "Blockchain in Education",
      "Crypto Staking Rewards",
      "NFT Curation and Discovery"
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

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, user.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post
          canModerate={user.id === post.user.id}
          posterIsTheCreator={false}
          post={post}
        />
      </div>
      <div className="sticky top-[5.4em] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Spinner />}>
          <UserInfoSidebar user={post.user as unknown as UserData} />
        </Suspense>
      </div>
    </main>
  );
}

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold capitalize">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-foreground/80">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-foreground/80">
          {user.bio}
        </div>
      </Linkify>
      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.id
            )
          }}
        />
      )}
    </div>
  );
}
