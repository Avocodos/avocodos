import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CommunityPage from "./CommunityPage";
import { Community } from "@prisma/client";

interface PageProps {
  params: { communityName: string };
}

export async function generateStaticParams() {
  const communities = await prisma?.community.findMany({
    select: { name: true }
  });

  if (!communities) return [];

  return communities.map((community) => ({
    communityName: community.name
  }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const community = await prisma?.community.findUnique({
    where: { name: params.communityName },
    select: {
      name: true,
      description: true
    }
  });

  if (!community) return {};

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${community.name} Community`,
    description:
      community.description || `Community page for ${community.name}`,
    openGraph: {
      images: [`/api/og?communityName=${community.name}`, ...previousImages]
    }
  };
}

export default async function Page({ params: { communityName } }: PageProps) {
  const community = await prisma?.community.findUnique({
    where: { name: communityName },
    include: {
      members: true,
      posts: {
        include: {
          user: true,
          _count: {
            select: { comments: true, likes: true }
          }
        }
      },
      _count: {
        select: { members: true, posts: true }
      },
      badges: true,
      moderators: true,
      roles: true,
      creator: true
    }
  });

  if (!community) notFound();

  return <CommunityPage communityName={communityName} />;
}
