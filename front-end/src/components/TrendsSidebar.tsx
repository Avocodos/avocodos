import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { ChartNoAxesCombined, Loader2, Rss } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";
import Spinner from "./Spinner";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[6.5em] ml-3 hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Spinner />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;

  const usersToFollow = await prisma?.user.findMany({
    where: {
      NOT: {
        id: user.id
      },
      followers: {
        none: {
          followerId: user.id
        }
      }
    },
    select: getUserDataSelect(user.id),
    take: 5,
    cacheStrategy: { ttl: 60 }
  });

  return (
    <div className="space-y-5 rounded-2xl border-2 border-muted bg-card p-5 shadow-sm">
      <div className="inline-flex flex-row items-center gap-2 text-xl font-bold capitalize">
        {" "}
        <Rss className="size-5" />
        Who to follow
      </div>
      {usersToFollow?.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user as unknown as UserData}>
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
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id
              )
            }}
          />
        </div>
      ))}
      {usersToFollow?.length === 0 && (
        <div className="text-left text-sm text-foreground/80">
          No users to follow... I guess you have followed every single user who
          has ever signed up on Avocodos! 🤯
        </div>
      )}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    if (!prisma) {
      throw new Error("Ran into an error");
    }
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
        `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count)
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60
  }
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl border-2 border-muted bg-card p-5 shadow-sm">
      <div className="inline-flex flex-row items-center gap-2 text-xl font-bold capitalize">
        {" "}
        <ChartNoAxesCombined className="size-5" />
        Trending topics
      </div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link
            key={title}
            href={`/hashtag/${title}`}
            className="group block rounded-lg px-4 py-2 avocodos-transition hover:bg-primary/5"
          >
            <p
              className="line-clamp-1 break-all font-semibold avocodos-transition group-hover:text-primary"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-foreground/80">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
      {trendingTopics.length === 0 && (
        <div className="text-center text-foreground/80">
          No trending topics... yet! 🤔👀
        </div>
      )}
    </div>
  );
}
