import React from "react";
import { FloatingDock } from "../../../components/ui/floating-dock";

interface ReactionSelectorProps {
  reactions: { title: string; icon: string }[];
  onSelect: (emoji: string) => void;
}

export default function ReactionSelector({
  reactions,
  onSelect
}: ReactionSelectorProps) {
  return (
    <FloatingDock
      desktopClassName="z-[200]"
      items={reactions}
      onSelect={onSelect}
    />
  );
}
