"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RewardsModal from "./RewardsModal";
import { Stars, Trophy } from "lucide-react";
import { User } from "@prisma/client";
import { UserData } from "@/lib/types";
import Link from "next/link";
import { Badge } from "./ui/badge";

interface RewardsButtonProps {
  user: UserData;
  showRewards: boolean;
  loggedInUserId: string;
}

export default function RewardsButton({
  user,
  showRewards,
  loggedInUserId
}: RewardsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Badge
        className="inline-flex w-full cursor-pointer items-center gap-2 text-xs"
        onClick={() => setIsOpen(true)}
        variant={"button"}
      >
        <Stars className="size-3.5 min-h-3.5 min-w-3.5" /> NFTs Progress
      </Badge>
      <RewardsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        defaultOpen={showRewards}
        loggedInUserId={loggedInUserId}
      />
      <Link href={`/users/${user.username}/rewards`} passHref>
        <Badge
          className="inline-flex w-full items-center gap-2 text-xs"
          variant="button"
        >
          <Trophy className="size-3.5 min-h-3.5 min-w-3.5" /> NFT Rewards
        </Badge>
      </Link>
    </>
  );
}
