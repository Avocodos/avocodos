"use client";

import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Badge
        variant="button"
        className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 text-xs"
        onClick={() => setShowDialog(true)}
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
