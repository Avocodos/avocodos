"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import {
  Channel,
  MessageReadReceipt,
  Message as MessageType,
  Reaction,
  User
} from "@prisma/client";
import io from "socket.io-client";
import Message from "./Message";
import UserAvatar from "@/components/UserAvatar";
import NewGroupDialog from "./NewGroupDialog";
import NewChatDialog from "./NewChatDialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCheck,
  Loader2,
  Menu,
  Paperclip,
  Send,
  Trash2,
  X
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import MessagesChannelsSkeleton from "@/components/skeletons/MessagesChannelsSkeleton";
import Link from "next/link";
import {
  TooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { randomUUID } from "crypto";
import { User as UserLucia } from "lucia";
import { ExtendedMessage, MessageCountInfo, MessagesPage } from "@/lib/types";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/ui/form";

interface ChatProps {
  user: UserLucia;
}

interface ChannelExtendedMessage extends MessageType {
  user: User;
  createdAt: Date;
}

export interface ExtendedChannel extends Channel {
  members: User[];
  messages: ChannelExtendedMessage[];
}

// Define the form values type
type ChatFormValues = {
  message: string;
};

export default function Chat({ user }: ChatProps) {
  const [selectedChannel, setSelectedChannel] =
    useState<ExtendedChannel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachments, setAttachments] = useState<
    {
      file: File;
      mediaId?: string;
      isUploading: boolean;
      progress?: number;
      link?: string;
    }[]
  >([]);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const topScrollRef = useRef<HTMLDivElement>(null); // Reference for the top of the chat

  const getMessages = async () => {
    const response = await kyInstance
      .get<any>(`/api/messages/${selectedChannel?.id}`)
      .json<any>();

    if (response.length > 0) {
      try {
        await kyInstance.post(`/api/messages/${selectedChannel?.id}/mark-read`);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }

    // Update read status
    const newReadStatus: Record<string, boolean> = {};
    response.forEach((message: ExtendedMessage) => {
      newReadStatus[message.id] = message.read;
    });
    setReadStatus(newReadStatus);

    return { messages: response };
  };

  const { data, isFetching, status, refetch } = useQuery({
    queryKey: ["messages", selectedChannel?.id],
    queryFn: getMessages,
    enabled: !!selectedChannel?.id
  });

  const messages = data?.messages || [];

  const queryClient = useQueryClient();

  const { data: channels, isLoading: channelsLoading } = useQuery<{
    channels: ExtendedChannel[];
  }>({
    queryKey: ["channels"],
    queryFn: () =>
      kyInstance
        .get(`/api/messages/channels/${user.username}`)
        .json<{ channels: ExtendedChannel[] }>(),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 1
  });

  const { startUpload, isUploading } = useUploadThing("message_attachments", {
    onUploadProgress: (progress: number) => {
      setAttachments((prev) =>
        prev.map((attachment) => {
          return { ...attachment, progress: progress };
        })
      );
    },
    onClientUploadComplete: (res) => {
      setAttachments((prev) =>
        prev.map((attachment) => {
          const uploadResult = res.find((r) => r.name === attachment.file.name);
          if (uploadResult) {
            return {
              ...attachment,
              mediaId:
                uploadResult.serverData.mediaId ?? randomUUID().toString(),
              isUploading: false,
              link: uploadResult.serverData.messageAttachmentUrl
            };
          }
          return {
            ...attachment,
            isUploading: false,
            link: URL.createObjectURL(attachment.file),
            mediaId: randomUUID().toString()
          };
        })
      );
    },
    onUploadError: (error: any) => {
      toast({
        title: "Upload Error",
        description: error.message.includes("FileCountMismatch")
          ? "Maximum file upload limit is 5."
          : error.message,
        variant: "destructive"
      });
      setAttachments([]);
    }
  });

  const { data: unreadCounts, refetch: refetchUnreadCounts } =
    useQuery<MessageCountInfo>({
      queryKey: ["unread-message-counts"],
      queryFn: async () => {
        const data = await kyInstance
          .get("/api/messages/unread-count")
          .json<MessageCountInfo>();
        if (selectedChannel) {
          data.unreadCount -= data.channelUnreadCounts[selectedChannel.id] || 0;
          data.channelUnreadCounts[selectedChannel.id] = 0;
        }
        return data;
      },
      refetchInterval: 60000
    });

  useEffect(() => {
    if (selectedChannel) {
      refetchUnreadCounts();
    }
  }, [selectedChannel, refetchUnreadCounts]);

  useEffect(() => {
    const socket = io();
    socket.on("new_message", (data) => {
      if (data.recipientId === user.id) {
        if (!selectedChannel || data.channelId !== selectedChannel.id) {
          refetchUnreadCounts();
        }
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    });
    return () => {
      socket.off("new_message");
    };
  }, [user.id, refetchUnreadCounts, refetch, selectedChannel, queryClient]);

  const { control, handleSubmit, reset } = useForm<ChatFormValues>({
    defaultValues: {
      message: ""
    }
  });

  const onSubmit = async (data: ChatFormValues) => {
    if (!data.message.trim() || !selectedChannel) return;

    try {
      const response = await kyInstance.post("/api/messages/send-message", {
        json: {
          content: data.message,
          channelId: selectedChannel.id,
          attachments: attachments
            .map((a) => ({
              mediaId: a.mediaId,
              type: a.file.type,
              url: a.link
            }))
            .filter(Boolean)
        }
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        throw new Error("Failed to send message");
      }

      reset();
      setAttachments([]);
      refetch();
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (files: File[]) => {
    const validFiles = Array.from(files).filter(
      (file) => file.size <= 4 * 1024 * 1024
    ); // Limit to 4MB
    if (validFiles.length) {
      setAttachments((prev) => [
        ...prev,
        ...validFiles.map((file) => ({ file, isUploading: true }))
      ]);
      startUpload(validFiles);
    } else {
      toast({
        title: "Invalid File",
        description: "File size exceeds 4MB",
        variant: "destructive"
      });
    }
  };

  const removeAttachment = (fileName: string) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.file.name !== fileName)
    );
  };

  const scrollToBottom = () => {
    topScrollRef.current?.scrollTo({
      top: 100000,
      behavior: "instant"
    });
  };

  useEffect(scrollToBottom, [selectedChannel, data]);

  return (
    <div className="chat-container flex w-full flex-row gap-0 rounded-2xl border-2 border-muted bg-card md:min-h-[60dvh] 2xl:min-h-[1000px]">
      <React.Fragment>
        <div className="chat-sidebar hidden h-full min-h-full w-full max-w-[280px] flex-col overflow-y-auto rounded-lg border-r-2 border-muted md:flex lg:max-w-[300px] xl:max-w-[320px]">
          <div className="flex w-full flex-row items-center justify-between border-b-2 border-muted p-6 lg:p-8">
            <div className="flex items-center gap-2">
              {console.log("unreadCounts:", unreadCounts) as ReactNode}
              {unreadCounts?.unreadCount && unreadCounts.unreadCount >= 1 ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {(() => {
                    const totalUnread =
                      unreadCounts.unreadCount -
                      (selectedChannel
                        ? unreadCounts.channelUnreadCounts[
                            selectedChannel.id
                          ] || 0
                        : 0);
                    return totalUnread > 0
                      ? totalUnread > 99
                        ? "99+"
                        : totalUnread
                      : null;
                  })()}
                </span>
              ) : null}
              <h4 className="">Messages</h4>
            </div>
            <div className="flex flex-row gap-2">
              <NewChatDialog channels={channels!} />
              <NewGroupDialog />
            </div>
          </div>
          {channelsLoading ? (
            <MessagesChannelsSkeleton />
          ) : (
            <div className="flex-1 divide-y-2 divide-muted overflow-y-auto">
              {channels?.channels
                .sort((a, b) => {
                  const aUnread = unreadCounts?.channelUnreadCounts[a.id] || 0;
                  const bUnread = unreadCounts?.channelUnreadCounts[b.id] || 0;
                  return bUnread - aUnread;
                })
                .sort((a, b) => {
                  const aLatestMessage = a.messages.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )[0];
                  const bLatestMessage = b.messages.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )[0];
                  return aLatestMessage && bLatestMessage
                    ? bLatestMessage.createdAt.getTime() -
                        aLatestMessage.createdAt.getTime()
                    : aLatestMessage
                      ? -1
                      : bLatestMessage
                        ? 1
                        : 0;
                })
                .map((channel) => {
                  const latestMessage = channel.messages.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )[0];
                  return (
                    <div
                      key={channel.id}
                      className="flex cursor-pointer items-center gap-4 px-6 py-3 avocodos-transition hover:bg-muted lg:px-8"
                      onClick={() => setSelectedChannel(channel)}
                    >
                      {channel.members.length === 2 ? (
                        <UserAvatar
                          avatarUrl={
                            channel.members.filter(
                              (member) => member.id !== user.id
                            )[0]?.avatarUrl ?? "/avatar-placeholder.png"
                          }
                          size={44}
                        />
                      ) : (
                        <Image
                          src="/group-placeholder.png"
                          alt="Group Avatar"
                          width={39.2}
                          height={39.2}
                          className="rounded-full"
                        />
                      )}
                      <div className="flex flex-1 items-center justify-between">
                        <div className="flex flex-col gap-0">
                          <span className="line-clamp-2">
                            {channel.members.length === 2
                              ? channel.members
                                  .filter((member) => member.id !== user.id)
                                  .map((member) => member.displayName)
                                  .join(", ")
                              : channel.members
                                  .map((member) => member.displayName)
                                  .join(", ")}
                          </span>

                          <span className="line-clamp-1 inline-flex items-center gap-1 text-xs text-foreground/80">
                            <CheckCheck
                              className={`size-3.5 ${
                                channel.messages.length > 0 &&
                                latestMessage.user.id === user.id
                                  ? "block"
                                  : "hidden"
                              } `}
                            />
                            {channel.messages.length > 0
                              ? `${
                                  latestMessage.user.id === user.id
                                    ? "You"
                                    : latestMessage.user.displayName
                                }: ${latestMessage.content}`
                              : "No messages yet..."}
                          </span>
                        </div>
                        {unreadCounts?.channelUnreadCounts &&
                          unreadCounts.channelUnreadCounts[channel.id] > 0 &&
                          selectedChannel?.id !== channel.id && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {unreadCounts.channelUnreadCounts[channel.id] > 99
                                ? "99+"
                                : unreadCounts.channelUnreadCounts[channel.id]}
                            </span>
                          )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <div className="flex h-full min-h-full flex-col gap-3 border-r-2 border-muted px-2 py-4 md:hidden">
          <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <DrawerTrigger asChild>
              <Badge
                variant={"button"}
                className="w-fit cursor-pointer items-center gap-2 p-1.5"
              >
                <Menu className="size-3" />
              </Badge>
            </DrawerTrigger>
            <DrawerContent className="mb-8">
              <DrawerHeader>
                <DrawerTitle asChild>
                  <h3>Messages</h3>
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-2">
                {channelsLoading ? (
                  <MessagesChannelsSkeleton />
                ) : (
                  channels?.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex cursor-pointer items-center gap-4 rounded-xl p-2 px-4 py-3 avocodos-transition hover:bg-muted"
                      onClick={() => {
                        setSelectedChannel(channel);
                        setSidebarOpen(false);
                      }}
                    >
                      {channel.members.length === 2 ? (
                        <UserAvatar
                          avatarUrl={
                            channel.members.filter(
                              (member) => member.id !== user.id
                            )[0]?.avatarUrl ?? "/avatar-placeholder.png"
                          }
                          size={39.2}
                        />
                      ) : (
                        <Image
                          src="/group-placeholder.png"
                          alt="Group Avatar"
                          width={39.2}
                          height={39.2}
                          className="rounded-full"
                        />
                      )}
                      <span className="line-clamp-2">
                        {channel.members.length === 2
                          ? channel.members
                              .filter((member) => member.id !== user.id)
                              .map((member) => member.displayName)
                              .join(", ")
                          : channel.members
                              .map((member) => member.displayName)
                              .join(", ")}
                      </span>
                      {unreadCounts?.channelUnreadCounts &&
                        unreadCounts.channelUnreadCounts[channel.id] > 0 &&
                        selectedChannel?.id !== channel.id && (
                          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {unreadCounts.channelUnreadCounts[channel.id] > 99
                              ? "99+"
                              : unreadCounts.channelUnreadCounts[channel.id]}
                          </span>
                        )}
                    </div>
                  ))
                )}
              </div>
            </DrawerContent>
          </Drawer>
          <NewChatDialog channels={channels!} />
          <NewGroupDialog />
        </div>
      </React.Fragment>
      {selectedChannel && (
        <div className="chat-messages relative flex min-h-full w-full flex-col justify-start">
          <Link
            href={`/users/${
              selectedChannel.members.filter(
                (member) => member.id !== user.id
              )[0]?.username
            }`}
            className="w-full avocodos-transition hover:underline"
          >
            <div className="inline-flex w-full items-center gap-4 border-b-2 border-muted p-[20px] lg:p-[28px]">
              {selectedChannel.members.length === 2 ? (
                <UserAvatar
                  avatarUrl={
                    selectedChannel.members.filter(
                      (member) => member.id !== user.id
                    )[0]?.avatarUrl ?? "/avatar-placeholder.png"
                  }
                  size={39.2}
                />
              ) : (
                <Image
                  src="/group-placeholder.png"
                  alt="Group Avatar"
                  width={39.2}
                  height={39.2}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col gap-0">
                <h5 className="line-clamp-1">
                  {selectedChannel.members.length === 2 &&
                    selectedChannel.members
                      .filter((member) => member.id !== user.id)
                      .map((member) => member.displayName)
                      .join(", ")}
                  {selectedChannel.members.length > 2 &&
                    selectedChannel.members.map((member, i) => {
                      return (
                        <Link key={i} href={`/users/${member.username}`}>
                          {member.displayName}
                          {i < selectedChannel.members.length - 1 && ", "}
                        </Link>
                      );
                    })}
                </h5>
                <p className="-mt-1 line-clamp-1 text-xs text-foreground/80">
                  {selectedChannel.members.length > 2 && (
                    <span>{selectedChannel.members.length} members</span>
                  )}
                  {selectedChannel.members.length === 2 &&
                    selectedChannel.members
                      .filter((member) => member.id !== user.id)
                      .map((member) => member.bio)
                      .join(", ")}
                </p>
              </div>
            </div>
          </Link>
          <div className="h-full max-h-[90dvh] flex-1 md:max-h-[80dvh]">
            <div
              ref={topScrollRef}
              className="chat-messages-body flex h-full flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8"
            >
              {messages
                .filter(Boolean)
                .reverse()
                .map((message: any) => (
                  <Message
                    reversed={message.user.id === user.id}
                    key={message.id}
                    message={message}
                  />
                ))}
              {!isFetching && messages.length === 0 && (
                <div className="flex items-center justify-center">
                  <p className="text-foreground/80">No messages yet...</p>
                </div>
              )}
              {status === "pending" && (
                <div className="flex size-full items-center justify-center">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="flex max-h-[150px] flex-row flex-wrap gap-4 overflow-y-auto px-4 pb-4 pt-12 lg:max-h-[200px]">
              {attachments.map((attachment) => (
                <div
                  key={attachment.file.name}
                  className="flex w-fit items-start gap-2"
                >
                  <div className="relative h-fit w-fit">
                    <Image
                      src={URL.createObjectURL(attachment.file)}
                      alt={attachment.file.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={"destructive"}
                            onClick={() =>
                              removeAttachment(attachment.file.name)
                            }
                            className="absolute -right-3 -top-3 cursor-pointer p-1"
                          >
                            <X className="size-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Remove attachment</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="mt-2">
                    <span className="line-clamp-1 select-none text-xs">
                      {attachment.file.name}
                    </span>
                    {attachment.isUploading && (
                      <span className="text-xs">
                        Uploading: {attachment.progress}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="my-4 flex items-center gap-2 bg-background/80 px-4 backdrop-blur-sm"
          >
            <FormField
              name="message"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Send a message"
                  className="!h-[39px] min-h-[39px] w-full resize-none rounded-full"
                  rows={1}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(onSubmit)();
                    }
                  }}
                />
              )}
            />
            <input
              type="file"
              accept="image/*, video/*"
              multiple
              onChange={(e) =>
                handleFileChange(e.target.files as unknown as File[])
              }
              disabled={isUploading || attachments.length >= 5}
              className="hidden"
              id="attachment-input"
            />
            <label htmlFor="attachment-input" className="cursor-pointer">
              <Badge variant={"button"} className="cursor-pointer p-2.5">
                <Paperclip className="size-4" />
              </Badge>
            </label>
            <Badge
              variant={"button"}
              className="cursor-pointer p-2.5"
              onClick={handleSubmit(onSubmit)}
            >
              <Send className="size-4" />
            </Badge>
          </form>
        </div>
      )}
      {!selectedChannel && (
        <div className="flex min-h-[450px] w-full flex-col items-center justify-center gap-4 p-8 md:min-h-[350px] lg:min-h-[400px]">
          <Image
            src="/icon.svg"
            alt="Empty Chat"
            width={100}
            height={100}
            draggable={false}
            className="select-none"
          />
          <p className="max-w-[200px] text-pretty text-center leading-snug">
            Select a chat or group to start messaging
          </p>
        </div>
      )}
    </div>
  );
}
