"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RewardsModal from "./RewardsModal";
import { Stars, Trophy } from "lucide-react";
import { User } from "@prisma/client";
import { UserData } from "@/lib/types";
import Link from "next/link";

interface RewardsButtonProps {
  user: UserData;
}

export default function RewardsButton({ user }: RewardsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="inline-flex w-full items-center gap-2 text-sm"
        onClick={() => setIsOpen(true)}
        size="sm"
        variant={"outline"}
      >
        <Stars className="size-3.5" /> Rewards Progress
      </Button>
      <RewardsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />
      <Link href={`/users/${user.username}/rewards`} passHref>
        <Button
          className="inline-flex w-full items-center gap-2 text-sm"
          size="sm"
          variant="outline"
        >
          <Trophy className="size-3.5" /> Rewards
        </Button>
      </Link>
    </>
  );
}
