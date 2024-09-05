"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { ClipboardEvent, useRef, useState } from "react";
import { useSubmitPostMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { CommunityBadge } from "@prisma/client";
import kyInstance from "@/lib/ky";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

interface PostEditorProps {
  communityName?: string;
  placeholderText?: string;
}

export default function PostEditor({
  communityName,
  placeholderText
}: PostEditorProps): React.ReactNode {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const mutation = useSubmitPostMutation();

  // Add this type definition
  type SubmitPostInput = {
    content: string;
    mediaIds: string[];
    communityName: string;
    badgeId: string | null;
  };

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false
      }),
      Placeholder.configure({
        placeholder: placeholderText ?? "What's on your mind?"
      })
    ],
    immediatelyRender: false
  });

  const input =
    editor?.getText({
      blockSeparator: "\n"
    }) || "";

  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const { data: badges } = useQuery({
    queryKey: ["community-badges", communityName],
    queryFn: () =>
      kyInstance
        .get(`/api/communities/${communityName}/badges`)
        .json<CommunityBadge[]>()
  });

  function onSubmit() {
    // Remove the content check and allow submission if there are attachments
    if (isUploading || (!input.trim() && attachments.length === 0)) {
      return;
    }

    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        communityName: communityName ?? "",
        badgeId: selectedBadge
      },
      {
        onSuccess: (newPost) => {
          // Reset the editor
          editor?.commands.setContent("");
          // Reset attachments
          resetMediaUploads();
          // Reset selected badge
          setSelectedBadge(null);
          // Invalidate the community posts query
          queryClient.invalidateQueries({
            queryKey: ["community-posts", communityName]
          });

          // Update the query cache with the new post data
          queryClient.setQueryData(
            ["community-posts", communityName],
            (oldData: any) => {
              if (oldData && oldData.pages) {
                const newPages = oldData.pages.map(
                  (page: any, index: number) => {
                    if (index === 0) {
                      return { ...page, posts: [newPost, ...page.posts] };
                    }
                    return page;
                  }
                );
                return { ...oldData, pages: newPages };
              }
              return oldData;
            }
          );
        },
        onError: (error) => {
          console.error("Failed to submit post:", error);
          // You might want to show an error toast here
        }
      }
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <div className="mb-4 flex flex-col gap-5 rounded-2xl border-2 border-muted bg-card p-5 shadow-sm md:p-6">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div {...rootProps} className="w-full max-w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] max-w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
              isDragActive && "outline-dashed"
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        {badges && badges.length > 0 && (
          <Select
            value={selectedBadge || ""}
            onValueChange={(value: string) => setSelectedBadge(value)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select a badge" />
            </SelectTrigger>
            <SelectContent className="max-w-xs">
              {badges.map((badge: CommunityBadge) => (
                <SelectItem key={badge.id} value={badge.id}>
                  <span style={{ color: badge.color }}>{badge.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={isUploading || (!input.trim() && attachments.length === 0)}
          className="px-4"
          size={"sm"}
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
