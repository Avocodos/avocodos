import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ReactNode } from "react";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const CACHE_DURATION = 60 * 60 * 24 * 0.5;

const interRegular = fetch(
  new URL("https://www.gl-tch.org/assets/fonts/inter/Inter-Regular.ttf")
).then((res) => res.arrayBuffer());
const interBold = fetch(
  new URL("https://www.gl-tch.org/assets/fonts/inter/Inter-Bold.ttf")
).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
  const [interRegularData, interBoldData] = await Promise.all([
    interRegular,
    interBold
  ]);
  const baseURL = req.nextUrl.origin;
  const { searchParams } = new URL(req.url);
  const communityName = searchParams.get("communityName");
  const postId = searchParams.get("postId");
  const username = searchParams.get("username");
  const rewardId = searchParams.get("rewardId");

  let imageContent;

  if (communityName) {
    const cachedCommunityKey = `og:community:${communityName}`;
    const cachedCommunity = await redis.get<string>(cachedCommunityKey);

    if (cachedCommunity) {
      return new Response(JSON.parse(JSON.stringify(cachedCommunity)), {
        headers: { "Content-Type": "image/png" }
      });
    }

    const community = await prisma?.community.findUnique({
      where: { name: communityName },
      include: { _count: { select: { members: true, posts: true } } }
    });

    if (!community) {
      return new Response("Community not found", { status: 404 });
    }

    await redis.set(cachedCommunityKey, JSON.stringify(community), {
      ex: CACHE_DURATION
    });

    imageContent = (
      <div tw="flex h-full w-full flex-col bg-[#101110] p-16 relative">
        <div
          style={{
            position: "absolute",
            inset: "1",
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            backgroundImage:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            width: "1920px",
            height: "990px",
            top: 0,
            left: -64
          }}
        />
        <img
          src={`https://avocodos.com/bg.png`}
          width={"1920"}
          height={"1080"}
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.3)"
          }}
        />
        <img
          width={850}
          height={480}
          src={`${baseURL}/icon-white.png`}
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            width: 85 * 1.5,
            height: 48 * 1.5
          }}
        />

        <div tw="flex flex-grow flex-col">
          <h1 tw="text-6xl font-bold text-[#fafafa]">{community.name}</h1>
          <p tw="mb-8 text-2xl -mt-4 text-[#fafafa]/90">
            {community.description}
          </p>
          <div tw="flex items-center text-xl text-[#fafafa]/80">
            <span tw="mr-8">
              <strong tw="mr-2 text-[#fafafa]">
                {community._count.members}
              </strong>{" "}
              members
            </span>
            <span>
              <strong tw="mr-2 text-[#fafafa]">{community._count.posts}</strong>{" "}
              posts
            </span>
          </div>
        </div>
        <div tw="flex text-xl text-[#fafafa]/90">
          {community.name} - A community on Avocodos.
        </div>
      </div>
    );
  } else if (postId) {
    const cachedPostKey = `og:post:${postId}`;
    const cachedPost = await redis.get<string>(cachedPostKey);

    if (cachedPost) {
      return new Response(JSON.parse(JSON.stringify(cachedPost)), {
        headers: { "Content-Type": "image/png" }
      });
    }

    const post = await prisma?.post.findUnique({
      where: { id: postId },
      include: { user: true }
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    await redis.set(cachedPostKey, JSON.stringify(post), {
      ex: CACHE_DURATION
    });

    imageContent = (
      <div tw="flex h-full w-full flex-col bg-[#101110] p-16 relative">
        <img
          src={`https://avocodos.com/bg.png`}
          width={"1920"}
          height={"1080"}
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.3)"
          }}
        />
        <img
          width={850}
          height={480}
          src={`${baseURL}/icon-white.png`}
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            width: 85 * 1.5,
            height: 48 * 1.5
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            backgroundImage:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            width: "1920px",
            height: "990px",
            left: -64
          }}
        />
        <div tw="mb-10 flex items-center">
          <img
            src={
              post.user.avatarUrl ??
              "https://i.ibb.co/YNn4h3N/avatar-placeholder.png"
            }
            width={84}
            height={84}
            tw="rounded-full object-cover mr-4"
          />
          <div tw="flex flex-col">
            <h2 tw="text-3xl mt-4 font-bold text-[#fafafa]">
              {post.user.displayName}
            </h2>
            <p tw="text-base -mt-3 text-[#fafafa]/90">@{post.user.username}</p>
          </div>
        </div>
        <p tw="flex-grow text-2xl text-[#fafafa]/90 max-w-[800px] -mt-6 break-words">
          {post.content}
        </p>
        <div tw="flex text-xl text-[#fafafa]/90">Post on Avocodos</div>
      </div>
    );
  } else if (username) {
    const cachedUserKey = `og:user:${username}`;
    const cachedUser = await redis.get<string>(cachedUserKey);

    if (cachedUser) {
      return new Response(JSON.parse(JSON.stringify(cachedUser)), {
        headers: { "Content-Type": "image/png" }
      });
    }

    const user = await prisma?.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      include: {
        _count: { select: { posts: true, followers: true, following: true } }
      }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    await redis.set(cachedUserKey, JSON.stringify(user), {
      ex: CACHE_DURATION
    });

    imageContent = (
      <div tw="flex h-full w-full flex-col bg-[#101110] p-16 relative">
        <img
          src={`https://avocodos.com/bg.png`}
          width={"1920"}
          height={"1080"}
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.3)"
          }}
        />
        <img
          width={850}
          height={480}
          src={`${baseURL}/icon-white.png`}
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            width: 85 * 1.5,
            height: 48 * 1.5
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            backgroundImage:
              "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
            width: "1920px",
            height: "990px",
            left: -64
          }}
        />
        <div tw="mb-8 flex items-center">
          <img
            src={
              user.avatarUrl ??
              "https://i.ibb.co/YNn4h3N/avatar-placeholder.png"
            }
            width={128}
            height={128}
            tw="rounded-full object-cover mr-9"
          />
          <div tw="flex flex-col">
            <h1 tw="mb-0 text-5xl font-bold text-[#fafafa]">
              {user.displayName}
            </h1>
            <p tw="text-3xl text-[#fafafa]/90">@{user.username}</p>
          </div>
        </div>
        <div tw="mb-8 flex text-2xl text-[#fafafa]/80">
          <span tw="mr-8">
            <strong tw="mr-2 text-[#fafafa]">{user._count.posts}</strong> posts
          </span>
          <span tw="mr-8">
            <strong tw="mr-2 text-[#fafafa]">{user._count.followers}</strong>{" "}
            followers
          </span>
          <span>
            <strong tw="mr-2 text-[#fafafa]">{user._count.following}</strong>{" "}
            following
          </span>
        </div>
        <p tw="flex-grow text-2xl text-[#fafafa]/90">
          {user.bio || "No bio set by the user currently."}
        </p>
        <div tw="flex text-xl text-[#fafafa]/90">
          {user.displayName}&apos;s profile on Avocodos.
        </div>
      </div>
    );
  } else if (rewardId) {
    const cachedRewardKey = `og:reward:${rewardId}`;
    const cachedReward = await redis.get<string>(cachedRewardKey);

    if (cachedReward) {
      return new Response(JSON.parse(JSON.stringify(cachedReward)), {
        headers: { "Content-Type": "image/png" }
      });
    }

    const reward = await prisma?.reward.findUnique({
      where: { id: rewardId },
      include: { userRewards: { include: { user: true }, take: 1 } }
    });

    if (!reward) {
      return new Response("Reward not found", { status: 404 });
    }

    await redis.set(cachedRewardKey, JSON.stringify(reward), {
      ex: CACHE_DURATION
    });

    const claimedBy = reward.userRewards[0]?.user;

    imageContent = (
      <div tw="flex h-full w-full flex-col bg-[#101110] p-16 relative">
        <img
          src={`https://avocodos.com/bg.png`}
          width={"1920"}
          height={"1080"}
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.3)"
          }}
        />
        <img
          width={850}
          height={480}
          src={`${baseURL}/icon-white.png`}
          style={{
            position: "absolute",
            top: 64,
            right: 64,
            width: 85 * 1.5,
            height: 48 * 1.5
          }}
        />

        <div tw="mb-8 flex items-center">
          <div
            style={{
              position: "absolute",
              inset: "0",
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
              backgroundImage:
                "linear-gradient(to bottom, transparent 50%, rgba(59, 240, 25, 0.5) 100%)",
              width: "1920px",
              height: "990px",
              left: -64
            }}
          />
          <img
            src={`${baseURL}/auth.jpg`}
            width={128}
            height={128}
            style={{
              objectFit: "cover",
              borderRadius: "16px",
              marginRight: "32px"
            }}
          />
          <div tw="flex flex-grow flex-col">
            <h1 tw="mb-0 text-5xl font-bold text-[#fafafa]">{reward.name}</h1>
            <p tw="text-2xl text-[#fafafa]/90">{reward.description}</p>
          </div>
        </div>
        {claimedBy && (
          <div tw="mt-8 flex flex-col items-start justify-start">
            <p tw="mr-4 text-2xl text-[#fafafa]/90">Claimed by:</p>
            <img
              src={
                claimedBy.avatarUrl ??
                "https://i.ibb.co/YNn4h3N/avatar-placeholder.png"
              }
              width={128}
              height={128}
              tw="rounded-full object-cover mr-4"
            />
            <div tw="flex flex-col">
              <p tw="text-2xl font-bold text-[#fafafa]">
                <strong>{claimedBy.displayName}</strong>
              </p>
              <p tw="text-xl -mt-4 text-[#fafafa]/90">@{claimedBy.username}</p>
            </div>
          </div>
        )}
        <div tw="mt-auto flex text-xl text-[#fafafa]/90">
          NFT rewarded by Avocodos on the Aptos network.
        </div>
      </div>
    );
  } else {
    return new Response("Missing required parameter", { status: 400 });
  }

  return new ImageResponse(imageContent, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: interRegularData,
        style: "normal",
        weight: 400
      },
      {
        name: "Inter",
        data: interBoldData,
        style: "normal",
        weight: 700
      }
    ]
  });
}
