"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CommunityRole } from "@prisma/client";
import { ColorPicker } from "@/components/ui/color-picker";
import { BookUser, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import CommunityRolesSkeleton from "./skeletons/CommunityRolesSkeleton";
import { Badge } from "./ui/badge";
import { useTheme } from "next-themes";

export default function CommunityRoles({
  communityName
}: {
  communityName: string;
}) {
  const { theme } = useTheme();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(
    theme === "dark" ? "#3bf019" : "#2fbe13"
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["community-roles", communityName],
    queryFn: () =>
      kyInstance
        .get(`/api/communities/${communityName}/roles`)
        .json<CommunityRole[]>()
  });

  const createRoleMutation = useMutation({
    mutationFn: (newRole: { name: string; color: string }) =>
      kyInstance.post(`/api/communities/${communityName}/roles`, {
        json: newRole
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-roles", communityName]
      });
      setNewRoleName("");
      setNewRoleColor("#3bf019");
    }
  });

  if (isLoading) return <CommunityRolesSkeleton />;

  const visibleRoles = isExpanded ? roles : roles?.slice(0, 5);
  const hasMoreRoles = roles && roles.length > 5;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h5 className="inline-flex items-center gap-2">
          <BookUser className="size-5" />
          <span>Community Roles</span>
        </h5>
        <ul className="mt-4 flex flex-wrap gap-2">
          {visibleRoles?.map((role) => (
            <li key={role.id}>
              <Badge
                variant="secondary"
                className={`flex items-center gap-1.5 border px-4 py-2 text-xs`}
                style={{ borderColor: role.color }}
              >
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span>{role.name}</span>
              </Badge>
            </li>
          ))}
          {roles?.length === 0 && (
            <p className="max-w-[400px] text-sm text-foreground/80">
              No existing roles found for this community.
              <br /> You can create a new role below.
            </p>
          )}
          {hasMoreRoles && (
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
      <div className="flex flex-col items-end gap-2 sm:flex-row">
        <Input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="New role name"
          className="max-w-md"
          disabled={createRoleMutation.isPending}
        />
        <div className="flex w-full flex-row gap-2">
          <ColorPicker
            value={newRoleColor}
            onChange={setNewRoleColor}
            className="h-10 w-10"
          />
          <Button
            onClick={() =>
              createRoleMutation.mutate({
                name: newRoleName,
                color: newRoleColor
              })
            }
            disabled={createRoleMutation.isPending}
            className="flex flex-1 items-center gap-2"
          >
            {createRoleMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {createRoleMutation.isPending ? `Creating Role...` : "Create Role"}
          </Button>
        </div>
      </div>
    </div>
  );
}
