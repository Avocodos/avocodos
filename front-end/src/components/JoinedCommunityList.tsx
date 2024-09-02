"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Community } from "@prisma/client";
import CommunitiesPageSkeleton from "./skeletons/CommunitiesPageSkeleton";
import CommunityCard, { CommunityWithCounts } from "./CommunityCard";

export default function JoinedCommunityList() {
  const {
    data: communities,
    isLoading,
    error
  } = useQuery({
    queryKey: ["joined-communities"],
    queryFn: () =>
      kyInstance.get("/api/communities/joined").json<CommunityWithCounts[]>()
  });

  if (isLoading) return <CommunitiesPageSkeleton />;
  if (error) return <div>Error loading joined communities</div>;

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
      {communities?.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
      {communities?.length === 0 && (
        <p className="text-center text-foreground/80">
          You haven&apos;t joined any communities yet {":("}
        </p>
      )}
    </div>
  );
}
