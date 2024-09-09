"use client";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { Reaction } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface ReactionTooltipProps {
  reactions: { emoji: string; count: number }[];
  messageId: string;
}

export default function ReactionTooltip({
  reactions: initialReactions,
  messageId
}: ReactionTooltipProps) {
  const [localReactions, setLocalReactions] = useState(initialReactions);
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalReactions(initialReactions);
  }, [initialReactions]);

  const { mutate: deleteReaction } = useMutation({
    mutationFn: (emoji: string) =>
      kyInstance.delete(`/api/messages/react`, {
        json: { reaction: emoji, messageId }
      }),
    onError: (error) => {
      console.error("Error deleting reaction:", error);
      //   toast({
      //     title: "Error",
      //     description: "Failed to delete reaction. Please try again.",
      //     variant: "destructive"
      //   });
      // Revert to initial reactions on error
      setLocalReactions(initialReactions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["message", messageId] });
    }
  });

  const handleReactionDelete = (emoji: string) => {
    // Immediately update local state
    setLocalReactions((prevReactions) =>
      prevReactions
        .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1 } : r))
        .filter((r) => r.count > 0)
    );

    // Trigger the mutation
    deleteReaction(emoji);
  };

  return (
    <div className="reaction-tooltip flex flex-row flex-wrap gap-1">
      {localReactions.map((reaction) => (
        <Badge
          variant={"button"}
          className="w-fit cursor-pointer p-2"
          key={reaction.emoji}
          onClick={() => handleReactionDelete(reaction.emoji)}
        >
          {reaction.emoji} {reaction.count > 1 && `${reaction.count}`}
        </Badge>
      ))}
    </div>
  );
}
