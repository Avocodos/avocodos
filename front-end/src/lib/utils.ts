import { type ClassValue, clsx } from "clsx";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";
import prisma from "@/lib/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "do MMMM");
    } else {
      return formatDate(from, "do MMMM, yyyy");
    }
  }
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const USDToINR = (price: number) => {
  return price * 83.93;
};

export function formatDatePretty(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getDayWithSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return `${day}th`;
    }
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  return `${getDayWithSuffix(day)} ${month} ${year}`;
}


export async function isCommunityModerator(userId: string, communityName: string): Promise<boolean> {
  const community = await prisma?.community.findUnique({
    where: { name: communityName },
    include: { moderators: true },
    cacheStrategy: { ttl: 60 },

  });

  return community?.creatorId === userId || community?.moderators.some(mod => mod.id === userId) || false;
}

export async function isCommunityMember(userId: string, communityName: string): Promise<boolean> {
  const membership = await prisma?.community.findFirst({
    where: {
      name: communityName,
      members: {
        some: { id: userId },
      },
    },
    cacheStrategy: { ttl: 60 },
  });

  return !!membership;
}

export async function isUserFollowed(userId: string, followerId: string): Promise<boolean> {
  const follower = await prisma?.user.findUnique({
    where: {
      id: userId,
      followers: {
        some: {
          followerId,
        },
      },
    },
  });
  return !!follower;
}