"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatNumber, getKandMString } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span className="inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-muted p-2.5">
      <span className="text-3xl font-bold">
        {getKandMString(data.followers as unknown as number)}
      </span>
      <span className="text-xs text-foreground/80">Followers</span>
    </span>
  );
}
