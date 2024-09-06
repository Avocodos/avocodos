import { type ClassValue, clsx } from "clsx";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";
import prisma from "@/lib/prisma";
import { Jimp } from 'jimp';
import { getUserDataSelect } from "./types";

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


  });

  return community?.creatorId === userId || community?.moderators.some((mod: { id: string }) => mod.id === userId) || false;
}

export async function isCommunityMember(userId: string, communityName: string): Promise<boolean> {
  const membership = await prisma?.community.findFirst({
    where: {
      name: communityName,
      members: {
        some: { id: userId },
      },
    },

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

export const checkIfRewardIsClaimed = async (userId: string, rewardId: string): Promise<boolean> => {
  const userReward = await prisma?.userReward.findFirst({
    where: {
      userId,
      rewardId,
    },

  });
  return !!userReward;
};

export type Color = `rgb(${number},${number},${number})`;

export function rgbToHex(rgb: Color): string {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export async function getMostProminentColorFromImage(imageUrl: string): Promise<Color> {
  try {
    const img = await Jimp.read(imageUrl)
    const colorCount: Record<Color, number> = {};

    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
      const r = img.bitmap.data[idx + 0];
      const g = img.bitmap.data[idx + 1];
      const b = img.bitmap.data[idx + 2];
      const color = `rgb(${r},${g},${b})` as Color;
      colorCount[color] = (colorCount[color] || 0) + 1;
    });

    let mostProminentColor: Color = 'rgb(0,0,0)';
    let maxCount = 0;

    for (const color in colorCount) {
      if (colorCount[color as Color] > maxCount) {
        mostProminentColor = color as Color;
        maxCount = colorCount[color as Color];
      }
    }

    return mostProminentColor;
  } catch (error) {
    console.error('Failed to process image:', error);
    return 'rgb(0,0,0)';
  }
}

export const getUserData = async ({ userId, username }: { userId?: string, username?: string }) => {
  if (userId) {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
    });
    return user;
  } else if (username) {
    const user = await prisma?.user.findUnique({
      where: { username },

    });
    return user;
  }
  return null;
};

export type CountType = `${number}B` | `${number}M` | `${number}K` | `${number}`;

export const getKandMString = (count: number): CountType => {
  if (count >= 1000000000) {
    return `${(Math.floor(count / 100000000) / 10).toFixed((count % 1000000000 === 0) ? 0 : 1)}B` as CountType;
  } else if (count >= 1000000) {
    return `${(Math.floor(count / 100000) / 10).toFixed((count % 1000000 === 0) ? 0 : 1)}M` as CountType;
  } else if (count >= 1000) {
    return `${(Math.floor(count / 100) / 10).toFixed((count % 1000 === 0) ? 0 : 1)}K` as CountType;
  }
  return count.toString() as CountType;
};