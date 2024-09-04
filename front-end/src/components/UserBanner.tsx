"use client";
import { UserData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface UserBannerProps extends React.ComponentPropsWithoutRef<"div"> {
  user: UserData;
  bannerColor?: string;
}

export default function UserBanner({
  user,
  bannerColor,
  ...props
}: UserBannerProps) {
  return (
    <div className={cn("", props.className)} {...props}>
      {user.bannerUrl ? (
        <img
          src={user.bannerUrl}
          alt={`${user.displayName}'s banner`}
          className="h-52 w-full select-none object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="z-[1] h-52 w-full rounded-t-2xl"
          style={{
            backgroundColor: bannerColor
          }}
        ></div>
      )}
    </div>
  );
}
