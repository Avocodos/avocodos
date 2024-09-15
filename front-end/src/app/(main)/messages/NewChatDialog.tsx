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
import { MailPlus } from "lucide-react";
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
import { ExtendedChannel } from "./Chat";
import { useRouter } from "next/navigation";

export default function NewChatDialog({
  channels
}: {
  channels?: { channels: ExtendedChannel[] };
}) {
  const [recipientId, setRecipientId] = useState<Option[]>([]);
  const [isTriggered, setIsTriggered] = useState(false);
  const router = useRouter();

  const { onClose, isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleCreateChat = async () => {
    if (recipientId.length === 0) {
      toast({
        title: "Error",
        description: "Please select a user to chat with.",
        variant: "destructive"
      });
      return;
    }
    await kyInstance.post("/api/messages/create-channel", {
      json: { recipientId: recipientId[0].value }
    });
    onClose();
    window.location.reload();
    setRecipientId([]);
    toast({
      title: "Chat created",
      description: "You have successfully created a new chat."
    });
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
              <MailPlus className="size-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Create a new chat</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Modal onOpenChange={onOpenChange} isOpen={isOpen} onClose={onClose}>
        <ModalContent className="h-[40dvh]">
          <ModalHeader>Create New Chat</ModalHeader>
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
                  return res
                    .filter(
                      (user) =>
                        !channels?.channels.some((channel) =>
                          channel.members
                            .map((member) => member.id)
                            .includes(user.id)
                        )
                    )
                    .map((user) => ({
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
              placeholder="Search for a user..."
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
              onChange={setRecipientId}
              maxSelected={1}
            />
            <Button onClick={handleCreateChat}>Create Chat</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
