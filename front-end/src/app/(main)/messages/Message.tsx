"use client";
import React, { useRef, useEffect } from "react";
import { useState } from "react";
import { Media, Message as MessageType, Reaction, User } from "@prisma/client";
import ReactionTooltip from "./ReactionTooltip";
import ReactionPicker from "./ReactionPicker";
import { cn, formatSentAtTime } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Add this import
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { ExtendedMessage } from "@/lib/types";
import Linkify from "@/components/Linkify";

interface MessageProps {
  message: ExtendedMessage;
  reversed?: boolean;
}

const reactions = [
  { label: "Love", node: <div>❤️</div>, key: "❤️" },
  { label: "Thumbs Up", node: <div>👍</div>, key: "👍" },
  { label: "Thumbs Down", node: <div>👎</div>, key: "👎" },
  { label: "ROFL", node: <div>🤣</div>, key: "🤣" },
  { label: "LOL", node: <div>😂</div>, key: "😂" },
  { label: "Smile", node: <div>😄</div>, key: "😄" },
  { label: "Surprised", node: <div>😲</div>, key: "😲" },
  { label: "Sad", node: <div>😢</div>, key: "😢" },
  { label: "Angry", node: <div>😠</div>, key: "😠" }
];

export default function Message({ message, reversed }: MessageProps) {
  const [showReactions, setShowReactions] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: addReaction } = useMutation({
    mutationFn: (emoji: string) =>
      kyInstance.post(`/api/messages/react`, {
        json: {
          messageId: message.id,
          reaction: emoji
        }
      }),
    onMutate: async (emoji) => {
      await queryClient.cancelQueries({ queryKey: ["message", message.id] });

      const previousReactions = message.reactions;

      // Optimistically update the reactions
      message.reactions = [
        ...previousReactions,
        {
          id: Math.random().toString(),
          messageId: message.id,
          userId: message.userId,
          reaction: emoji,
          createdAt: new Date() // Set the current date/time
        }
      ];

      queryClient.setQueryData(["message", message.id], message);
      return { previousReactions };
    },
    onError: (error, emoji, context) => {
      queryClient.setQueryData(
        ["message", message.id],
        context?.previousReactions
      );
      console.error("Error adding reaction:", error);
    }
  });

  const handleEmojiSelect = async (emoji: string) => {
    setShowReactions(true);
    addReaction(emoji);
  };

  // useEffect(() => {
  //   const markAsRead = async () => {
  //     await kyInstance.get("/api/messages/read-receipts", {
  //       searchParams: { messageIds: message.id }
  //     });
  //   };

  //   markAsRead();
  // }, [message.id]);

  return !reversed ? (
    <div className="message-container flex flex-col items-start justify-start gap-2">
      <div className="flex flex-row items-center gap-2">
        <Image
          src={message.user.avatarUrl || "/avatar-placeholder.png"}
          alt={message.user.displayName}
          className="h-11 w-11 select-none rounded-full object-cover"
          draggable={false}
          width={44}
          height={44}
        />
        <div className="flex flex-col items-start gap-0">
          <span className="font-bold">{message.user.displayName}</span>
          <span className="text-sm text-foreground/80">
            {formatSentAtTime(new Date(message.createdAt))}
          </span>
        </div>
      </div>
      <div className="message-content flex flex-col">
        <Linkify>
          <div className="inline-flex flex-col gap-2 rounded-lg bg-foreground/[0.05] px-3 py-2 text-foreground">
            <Linkify>{message.content}</Linkify>
            {message.attachments && !!message.attachments.length && (
              <MediaPreviews attachments={message.attachments} />
            )}
          </div>
        </Linkify>
        <div className="relative mt-2 flex flex-row flex-wrap items-center justify-start gap-2">
          <ReactionPicker
            reactions={reactions}
            className=""
            onSelect={handleEmojiSelect}
            reversed={reversed}
          />
          {message.reactions && message.reactions.length >= 1 && (
            <ReactionTooltip
              reactions={message.reactions.map((reaction) => ({
                emoji: reaction.reaction,
                count: message.reactions.filter(
                  (r) => r.reaction === reaction.reaction
                ).length
              }))}
              messageId={message.id}
            />
          )}
        </div>
      </div>
      {/* {message.read && <span className="text-xs text-foreground/80">Read</span>} */}
    </div>
  ) : (
    <div className="message-container flex w-full items-start justify-end gap-2">
      <div className="message-content flex flex-col">
        <div className="mb-1 flex flex-row items-center justify-end gap-2">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-0">
              <span className="font-bold">{message.user.displayName}</span>
              <span className="text-xs text-foreground/80">
                {formatSentAtTime(new Date(message.createdAt))}
              </span>
            </div>
            <Image
              src={message.user.avatarUrl || "/avatar-placeholder.png"}
              alt={message.user.displayName}
              className="size-11 select-none rounded-full object-cover"
              width={44}
              height={44}
              draggable={false}
            />
          </div>
        </div>
        <div className="inline-flex flex-col gap-2 rounded-lg bg-foreground/[0.05] px-3 py-2 text-foreground">
          <Linkify>{message.content}</Linkify>
          {message.attachments && !!message.attachments.length && (
            <MediaPreviews attachments={message.attachments} />
          )}
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center justify-end gap-2">
          {message.reactions && message.reactions.length >= 1 && (
            <ReactionTooltip
              reactions={message.reactions.map((reaction) => ({
                emoji: reaction.reaction,
                count: message.reactions.filter(
                  (r) => r.reaction === reaction.reaction
                ).length
              }))}
              messageId={message.id}
            />
          )}
          <ReactionPicker
            reactions={reactions}
            className=""
            onSelect={handleEmojiSelect}
            reversed={reversed}
          />
        </div>
      </div>
    </div>
  );
}

// Add the MediaPreviews component below
interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div className="flex flex-col gap-3">
      {attachments.length === 1 && <MediaPreview media={attachments[0]} />}
      {attachments.length === 2 && (
        <div className="grid grid-cols-2 gap-2">
          <MediaPreview className="" media={attachments[0]} />
          <MediaPreview className="" media={attachments[1]} />
        </div>
      )}
      {attachments.length === 3 && (
        <div className="grid grid-cols-2 gap-2">
          <MediaPreview
            className="h-full min-h-full object-cover"
            media={attachments[0]}
          />
          <div className="flex h-full flex-col gap-2">
            <MediaPreview className="h-1/2" media={attachments[1]} />
            <MediaPreview className="h-1/2" media={attachments[2]} />
          </div>
        </div>
      )}
      {attachments.length === 4 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-1 gap-2">
            <MediaPreview className="" media={attachments[0]} />
            <MediaPreview className="" media={attachments[1]} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <MediaPreview className="" media={attachments[2]} />
            <MediaPreview className="" media={attachments[3]} />
          </div>
        </div>
      )}
      {attachments.length === 5 && (
        <div className="flex size-full flex-row gap-2">
          <div className="flex w-1/2 flex-col items-start justify-start gap-2">
            <MediaPreview
              className="h-1/2 object-cover"
              media={attachments[0]}
            />
            <MediaPreview
              className="h-1/2 object-cover"
              media={attachments[1]}
            />
          </div>
          <div className="grid w-1/2 grid-cols-1 grid-rows-3 gap-2">
            <MediaPreview
              className="aspect-[1.5/1] h-full object-cover"
              media={attachments[2]}
            />
            <MediaPreview
              className="aspect-[1.5/1] h-full object-cover"
              media={attachments[3]}
            />
            <MediaPreview
              className="aspect-[1.5/1] h-full object-cover"
              media={attachments[4]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
  className?: string;
}

function MediaPreview({ media, className }: MediaPreviewProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleImageClick = () => {
    setImageUrl(media.url);
    setDialogOpen(true);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(imageUrl);
  };

  if (media.type === "IMAGE") {
    return (
      <>
        <ContextMenu modal={true}>
          <ContextMenuTrigger asChild>
            <Image
              src={media.url}
              alt="Attachment"
              width={500}
              height={500}
              className={cn(
                `mx-auto size-fit max-h-[300px] cursor-pointer select-none rounded-lg`,
                className
              )}
              draggable={false}
              onClick={handleImageClick}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem onClick={handleCopyImageUrl}>
              Copy Image URL
            </ContextMenuItem>
            <ContextMenuItem onClick={() => window.open(media.url, "_blank")}>
              Open Image in New Tab
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            disableCloseButton={true}
            className="border-0 p-0 sm:max-w-[425px]"
          >
            <ContextMenu modal={true}>
              <ContextMenuTrigger asChild>
                <Image
                  src={media.url}
                  alt="Attachment"
                  width={500}
                  height={500}
                  className={cn(
                    `mx-auto size-full cursor-pointer select-none rounded-lg`
                  )}
                  draggable={false}
                  onClick={handleImageClick}
                />
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={handleCopyImageUrl}>
                  Copy Image URL
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => window.open(media.url, "_blank")}
                >
                  Open Image in New Tab
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          draggable={false}
          className="mx-auto size-fit max-h-[300px] select-none rounded-lg"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}
