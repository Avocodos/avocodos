"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { UserRoundPlus } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure
} from "@nextui-org/react";
import { User } from "@prisma/client";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { toast } from "@/components/ui/use-toast";

export default function NewGroupDialog() {
  const [memberIds, setMemberIds] = useState<Option[]>([]);
  const [isTriggered, setIsTriggered] = useState(false);

  const { onClose, isOpen, onOpen, onOpenChange } = useDisclosure();
  const handleCreateGroup = async () => {
    await kyInstance.post("/api/messages/create-group", {
      json: { memberIds }
    });
    onClose();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-fit">
            <Badge
              className="inline-flex w-fit cursor-pointer items-center gap-2 p-1.5"
              variant={"button"}
              onClick={onOpen}
            >
              <UserRoundPlus className="size-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Create a new group</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Modal onOpenChange={onOpenChange} isOpen={isOpen} onClose={onClose}>
        <ModalContent className="h-[60dvh]">
          <ModalHeader>Create New Group</ModalHeader>
          <ModalBody>
            <MultipleSelector
              onSearch={async (value) => {
                try {
                  setIsTriggered(true);
                  const res = await kyInstance
                    .get("/api/users", {
                      searchParams: {
                        q: value
                      }
                    })
                    .json<User[]>();
                  setIsTriggered(false);
                  return res.map((user) => ({
                    value: user.id,
                    label: user.displayName
                  }));
                } catch (error: any) {
                  console.error(error);
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                  });
                  return [];
                }
              }}
              placeholder="Search for users..."
              loadingIndicator={
                <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                  Loading...
                </p>
              }
              emptyIndicator={
                <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                  No results found.
                </p>
              }
              onChange={setMemberIds}
            />
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
