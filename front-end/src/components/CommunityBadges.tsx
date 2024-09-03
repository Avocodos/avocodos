"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CommunityBadge } from "@prisma/client";
import { ColorPicker } from "@/components/ui/color-picker";
import { BadgeCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import CommunityBadgesSkeleton from "./skeletons/CommunityBadgesSkeleton";
import { Badge } from "./ui/badge";
import { useTheme } from "next-themes";

export default function CommunityBadges({
  communityName
}: {
  communityName: string;
}) {
  const [newBadgeName, setNewBadgeName] = useState("");
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const [newBadgeColor, setNewBadgeColor] = useState(
    theme === "dark" ? "#3bf019" : "#2fbe13"
  );
  const { data: badges, isLoading } = useQuery({
    queryKey: ["community-badges", communityName],
    queryFn: () =>
      kyInstance
        .get(`/api/communities/${communityName}/badges`)
        .json<CommunityBadge[]>()
  });

  const createBadgeMutation = useMutation({
    mutationFn: (newBadge: Omit<CommunityBadge, "id">) =>
      kyInstance.post(`/api/communities/${communityName}/badges`, {
        json: newBadge
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-badges", communityName]
      });
      setNewBadgeName("");
      setNewBadgeColor("#3bf019");
    }
  });

  if (isLoading) return <CommunityBadgesSkeleton />;

  const visibleBadges = isExpanded ? badges : badges?.slice(0, 5);
  const hasMoreBadges = badges && badges.length > 5;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h5 className="inline-flex items-center gap-2">
          <BadgeCheck className="size-5" />
          <span>Community Badges</span>
        </h5>
        <ul className="mt-4 flex flex-row flex-wrap gap-2">
          {visibleBadges?.map((badge) => (
            <li key={badge.id} className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`flex items-center gap-1.5 border px-4 py-2 text-xs`}
                style={{ borderColor: badge.color }}
              >
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: badge.color }}
                />
                <span>{badge.name}</span>
              </Badge>
            </li>
          ))}
          {badges?.length === 0 && (
            <p className="max-w-[400px] text-sm text-foreground/80">
              No existing badges found for this community.
              <br /> You can create a new badge below.
            </p>
          )}
          {hasMoreBadges && (
            <li>
              <Badge
                variant="secondary"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex cursor-pointer items-center gap-1 border border-foreground/20 py-2 pl-4 pr-5 text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-4" />
                    Collapse Roles
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" />
                    Expand Roles
                  </>
                )}
              </Badge>
            </li>
          )}
        </ul>
      </div>
      <div className="flex items-end space-x-2">
        <Input
          value={newBadgeName}
          onChange={(e) => setNewBadgeName(e.target.value)}
          placeholder="New badge name"
          className="w-full max-w-[328px]"
        />
        <ColorPicker
          value={newBadgeColor}
          onChange={setNewBadgeColor}
          className="h-10 w-10"
        />
        <Button
          onClick={() =>
            createBadgeMutation.mutate({
              name: newBadgeName,
              color: newBadgeColor,
              communityName
            })
          }
          disabled={createBadgeMutation.isPending}
          className="flex flex-1 items-center gap-2 px-5 text-xs"
        >
          {createBadgeMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          {createBadgeMutation.isPending ? "Creating Badge..." : "Create Badge"}
        </Button>
      </div>
    </div>
  );
}
