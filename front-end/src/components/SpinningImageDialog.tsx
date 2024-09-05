"use client";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "./ui/badge";
import {
  CheckCircle,
  Facebook,
  Info,
  Instagram,
  Linkedin,
  Mail,
  Share2,
  Twitter
} from "lucide-react";
import { Reward } from "@prisma/client";
import { Progress } from "./ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "./ui/button";
import { cn, formatDatePretty } from "@/lib/utils";
import { ShareSocial } from "react-share-social";
import Link from "next/link";
import { BASE_URL } from "@/lib/constants";

interface SpinningImageDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  imageUrl: string;
  rewardName: string;
  owned: boolean;
  reward: Reward;
  progress: number;
  username: string;
  type?: "page" | "dialog";
}

export default function SpinningImageDialog({
  isOpen,
  onClose,
  imageUrl,
  rewardName,
  owned,
  reward,
  progress,
  username,
  type = "dialog"
}: SpinningImageDialogProps) {
  const percentage = (progress / reward.requirement) * 100;

  return type === "dialog" ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="mx-auto">
          <motion.div
            className="relative"
            animate={{ rotateY: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={imageUrl}
              alt={rewardName}
              width={500}
              height={500}
              draggable={false}
              className="aspect-square size-full min-h-96 min-w-96 select-none rounded-full object-cover"
            />
          </motion.div>
          <h3 className="mt-4 text-center">{rewardName}</h3>
          <p className="text-center text-sm text-foreground/80">
            {reward.description}
          </p>
          <div className="mb-4 mt-2 flex w-full justify-center">
            {owned ? (
              <div className="flex w-full flex-col items-center justify-center gap-2">
                <Badge
                  variant={"light"}
                  className="mx-auto mt-2 inline-flex w-fit items-center gap-2 text-center text-sm text-primary"
                >
                  <CheckCircle className="size-4" />
                  Reward claimed
                </Badge>
                <ShareDropdown
                  className="w-full"
                  rewardName={rewardName}
                  username={username}
                  rewardId={reward.id}
                />
              </div>
            ) : (
              <Badge
                variant={"light"}
                className="mx-auto mt-2 inline-flex w-fit items-center gap-2 text-center text-sm text-primary"
              >
                <Info className="size-4" />
                Reward available
              </Badge>
            )}
          </div>
          {!owned && <Progress value={percentage} className="mt-4" />}
          {!owned && (
            <p className="mt-2 text-center text-sm text-foreground/80">
              {progress} / {reward.requirement} completed (
              {Math.round((progress / reward.requirement) * 100)}%)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="max-w-4xl">
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-6 sm:p-8 md:p-12">
        <motion.div
          className="relative w-fit"
          animate={{ rotateY: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={imageUrl}
            alt={rewardName}
            width={500}
            height={500}
            draggable={false}
            className="aspect-square size-full h-80 w-80 select-none rounded-full object-cover"
          />
        </motion.div>
        <h3 className="mt-4 text-center">{rewardName}</h3>
        <p className="text-center text-sm text-foreground/80">
          {reward.description}
        </p>
        <div className="mb-4 mt-2 flex w-full justify-center">
          {owned ? (
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <Badge
                variant={"light"}
                className="mx-auto mt-2 inline-flex w-fit items-center gap-2 break-words text-center text-sm text-primary"
              >
                <CheckCircle className="size-4 min-h-4 min-w-4" />
                Reward claimed by{" "}
                <span className="font-[700]">@{username}</span>
                on {formatDatePretty(reward.createdAt)}.
              </Badge>
              <ShareDropdown
                className="w-full"
                rewardName={rewardName}
                username={username}
                rewardId={reward.id}
              />
            </div>
          ) : (
            <Badge
              variant={"light"}
              className="mx-auto mt-2 inline-flex w-fit items-center gap-2 text-center text-sm text-primary"
            >
              <Info className="size-4" />
              Reward available
            </Badge>
          )}
        </div>
        {!owned && <Progress value={percentage} className="mt-4" />}
        {!owned && (
          <p className="mt-2 text-center text-sm text-foreground/80">
            {progress} / {reward.requirement} completed (
            {Math.round((progress / reward.requirement) * 100)}%)
          </p>
        )}
      </div>
    </div>
  );
}

function ShareDropdown({
  rewardId,
  username,
  className,
  rewardName
}: {
  rewardId: string;
  username: string;
  className?: string;
  rewardName: string;
}) {
  const shareUrl = `${BASE_URL}/users/${username}/rewards/${encodeURIComponent(rewardId)}`;
  const shareText = `Check out my "${rewardName}" reward on @avocodosglobal! Join the community and earn your own rewards by completing various exciting tasks! Get started now at https://avocodos.com!`;

  const style = {
    root: {
      background: "hsl(var(--card))",
      borderRadius: "var(--radius)",
      border: "1px solid hsl(var(--border))",
      padding: "1rem"
    },
    copyContainer: {
      background: "hsl(var(--muted))",
      borderRadius: "var(--radius)",
      border: "1px solid hsl(var(--border))"
    },
    title: {
      color: "hsl(var(--foreground))",
      fontWeight: "bold",
      fontSize: "16px !important !important",
      display: "none !important"
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className={cn("mt-4 w-full rounded-full", className)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Reward
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[300px] p-0">
        <ShareSocial
          url={shareUrl}
          title={shareText}
          socialTypes={[
            "twitter",
            "facebook",
            // "linkedin",
            "reddit",
            "whatsapp",
            "email"
          ]}
          style={style}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
