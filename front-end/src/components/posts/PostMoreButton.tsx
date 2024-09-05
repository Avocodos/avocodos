import { PostData } from "@/lib/types";
import { Edit, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import DeletePostDialog from "./DeletePostDialog";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { toast } from "../ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
  canModerate: boolean;
}

export default function PostMoreButton({
  post,
  className,
  canModerate
}: PostMoreButtonProps) {
  const { user } = useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isContentUnchanged = editedContent === post.content;

  const editMutation = useMutation({
    mutationFn: (newContent: string) => {
      if (isContentUnchanged) return Promise.resolve(undefined);
      setIsLoading(true);
      return kyInstance.put(`/api/posts/${post.id}/edit`, {
        json: { content: newContent }
      });
    },
    onSuccess: () => {
      if (isContentUnchanged) {
        setIsEditDialogOpen(false);
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["community-posts", post.communityName]
      });
      setIsEditDialogOpen(false);
      toast({
        title: "Post Updated",
        description: "Your post has been updated successfully."
      });
      setIsLoading(false);
    }
  });

  const canEdit = post.user.id === user.id;
  const canDelete = canEdit || canModerate;

  return (
    <>
      <div className="flex flex-row flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className={className}>
              <MoreHorizontal className="size-5 text-foreground/90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit">
            {canEdit && (
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <span className="flex items-center gap-3">
                  <Edit className="size-4" />
                  Edit
                </span>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <span className="flex items-center gap-3 text-destructive">
                  <Trash2 className="size-4" />
                  Delete
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DeletePostDialog
        post={post}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle asChild>
              <h4>Edit Post</h4>
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedContent ?? ""}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={6}
          />
          <Button
            onClick={() => editMutation.mutate(editedContent ?? "")}
            className="w-full"
            disabled={isLoading || isContentUnchanged}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
