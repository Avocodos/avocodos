"use client";

import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditProfileButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserData;
}

export default function EditProfileButton({
  user,
  className,
  ...props
}: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Badge
        variant="button"
        className={cn(
          "inline-flex w-fit cursor-pointer items-center justify-center gap-2 text-xs",
          className
        )}
        onClick={() => setShowDialog(true)}
        {...props}
      >
        <Edit className="size-3.5" />
        Edit profile
      </Badge>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
