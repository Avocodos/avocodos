"use client";
import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { MdOutlineAddReaction } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GithubSelector } from "@charkour/react-reactions";
import ReactionSelector from "./ReactionSelector";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  reactions: { label: string; node: React.ReactNode; key: string }[];
  reversed?: boolean;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  className,
  reactions,
  reversed
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    setShowPicker(false);
  };
  return (
    <div className={cn("relative", className)}>
      {showPicker && (
        <div
          className={cn(
            "absolute z-10 -translate-y-[6px] [&_div]:overflow-visible [&_div]:rounded-lg [&_div]:!bg-primary-0 [&_div]:dark:!bg-[#181b18]",
            !reversed ? "left-10" : "right-10"
          )}
        >
          <ReactionSelector
            reactions={reactions.map((reaction) => ({
              title: reaction.label,
              icon: reaction.key
            }))}
            onSelect={handleEmojiClick}
          />
        </div>
      )}
      <Badge
        variant={"button"}
        onClick={() => setShowPicker((prev) => !prev)}
        className="cursor-pointer p-2 text-sm"
      >
        <MdOutlineAddReaction className="size-4" />
      </Badge>
    </div>
  );
};

export default ReactionPicker;
