"use client";

import useFollowingInfo from "@/hooks/useFollowingInfo";
import { FollowingInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialState: FollowingInfo;
}

export default function FollowingCount({
  userId,
  initialState
}: FollowerCountProps) {
  const { followingCount } = useFollowingInfo(userId, initialState);

  return (
    <span className="inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-muted p-2.5">
      <span className="text-3xl font-bold">{followingCount}</span>
      <span className="text-xs text-foreground/80">Following</span>
    </span>
  );
}
