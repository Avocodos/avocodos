import { CommentsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { deleteComment, submitComment } from "./actions";

export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      // Optimistically update the comment count
      queryClient.setQueryData<InfiniteData<CommentsPage>>(queryKey, (oldData) => {
        if (!oldData) return { pageParams: [], pages: [] }; // Return a valid structure if oldData is undefined

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) => ({
            ...page,
            comments: [...page.comments, newComment].filter(
              (c): c is NonNullable<typeof c> => c !== undefined
            ), // Filter out undefined comments
            commentCount: (page.comments.length || 0) + 1, // Update the comment count
          })),
        };
      });

      toast({
        description: "Comment created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to submit comment. Please try again.",
      });
    },
  });

  return mutation;
}

export function useDeleteCommentMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment?.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage>>(
        queryKey,
        (oldData) => {
          if (!oldData) return; // Ensure to return if oldData is undefined

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              ...page, // Spread existing page properties
              comments: page.comments.filter((c) => c.id !== deletedComment?.id),
              commentCount: (page.comments.length || 0) - 1, // Update the comment count
            })),
          };
        },
      );

      toast({
        description: "Comment deleted",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });

  return mutation;
}
