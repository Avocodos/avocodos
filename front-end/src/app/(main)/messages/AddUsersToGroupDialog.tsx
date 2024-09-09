"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { useQuery } from "@tanstack/react-query";
import { User } from "@prisma/client";

interface AddUsersToGroupDialogProps {
  groupId: string;
}

export default function AddUsersToGroupDialog({
  groupId
}: AddUsersToGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userIds, setUserIds] = useState<string[]>([]);

  const handleAddUsers = async () => {
    await kyInstance.post(`/api/messages/add-users/${groupId}`, {
      json: { userIds }
    });
    setIsOpen(false);
  };

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => kyInstance.get("/api/users").json()
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Users to Group</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogTitle>Add Users to Group</DialogTitle>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddUsers}>Add</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
