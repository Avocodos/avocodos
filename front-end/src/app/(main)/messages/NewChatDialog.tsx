"use client";

import { Key, ReactNode, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MailPlus, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

import { Channel, User } from "@prisma/client";
import { useDisclosure } from "@nextui-org/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "../../../components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ExtendedChannel } from "./Chat";

export default function NewChatDialog({
  channels
}: {
  channels: { channels: ExtendedChannel[] };
}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [recipientId, setRecipientId] = useState("");

  const handleCreateChat = async () => {
    await kyInstance.post("/api/messages/create-channel", {
      json: { recipientId }
    });
    onClose();
    setRecipientId("");
    toast({
      title: "Chat created",
      description: "You have successfully created a new chat."
    });
  };
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => kyInstance.get("/api/users").json<User[]>()
  });

  if (isLoading)
    return (
      <div className="flex size-full items-center justify-center">
        <Loader2 className="size-4 animate-spin text-primary" />
      </div>
    );

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
              <MailPlus className="size-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Create a new chat</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Chat</ModalHeader>
              <ModalBody>
                <Autocomplete
                  label="User"
                  placeholder="Search for a user"
                  defaultItems={users?.map((user) => ({
                    label: user.displayName,
                    value: user.displayName
                  }))}
                  className="flex flex-col gap-0"
                  onSelectionChange={(value: Key | null) => {
                    if (value) {
                      setRecipientId(value.toString());
                    }
                  }}
                >
                  {users
                    ?.filter(
                      (user) =>
                        !channels.channels.some((channel) =>
                          channel.members
                            .map((member) => member.id)
                            .includes(user.id)
                        )
                    )
                    .map((user) => (
                      <AutocompleteItem
                        key={user.id}
                        value={user.id}
                        className="flex flex-row items-center gap-2"
                      >
                        {user.displayName}
                      </AutocompleteItem>
                    )) || []}
                </Autocomplete>
              </ModalBody>
              {console.log("channels", channels) as ReactNode}
              <ModalFooter>
                <Button onClick={handleCreateChat}>Create</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
