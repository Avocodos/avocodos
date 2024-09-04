"use client";

import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import Link from "next/link";
import { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";
import { useSession } from "@/app/(main)/SessionProvider";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export default function UserLinkWithTooltip({
  children,
  username
}: UserLinkWithTooltipProps) {
  const { user: loggedInUser } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-data", username],
    queryFn: async () => {
      try {
        const userData = await kyInstance
          .get(`/api/users/username/${username}`, {
            searchParams: {
              includeFollowers: true,
              loggedInUserId: loggedInUser?.id
            }
          })
          .json<UserData>();
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
    enabled: !!loggedInUser?.id // Only run the query if loggedInUser.id is available
  });

  if (isLoading) {
    return <span>{children}</span>;
  }

  if (error) {
    console.error("Error in UserLinkWithTooltip:", error);
    return <span>{children}</span>;
  }

  if (!data) {
    console.warn("No data for UserLinkWithTooltip:", username);
    return <span>{children}</span>;
  }

  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    </UserTooltip>
  );
}
