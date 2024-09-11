"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner";
import { User } from "@prisma/client";
import { CheckCircle, Loader2 } from "lucide-react";
import kyInstance from "@/lib/ky";

// New client-side component for NFT minting
export default function ClientSideNFTButton({
  disabled,
  courseId,
  userData
}: {
  courseId: string;
  userData: User;
  disabled: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [disabled_, setDisabled] = useState(disabled);

  const handleGetNFT = async () => {
    setIsLoading(true);
    try {
      const response = await kyInstance.post("/api/nft/mint", {
        json: {
          courseId: courseId
        }
      });

      if (!response.ok) {
        throw new Error("Failed to mint NFT: " + response.statusText);
      }
      toast({
        title: "NFT minted successfully!",
        description: `You can now view your NFT in your wallet (${userData.walletAddress}).`
      });
    } catch (error) {
      toast({
        title: "Failed to mint NFT.",
        description: (error as Error).message
      });
    } finally {
      setIsLoading(false);
      setDisabled(true);
    }
  };

  return (
    <React.Fragment>
      <Button
        className="inline-flex w-full items-center justify-center gap-2"
        onClick={handleGetNFT}
        variant={disabled_ ? "secondary" : "default"}
        disabled={isLoading || !!!userData.walletAddress || disabled_}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Minting..." : disabled_ ? "" : "Get Your NFT Now"}
        {disabled_ && (
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="size-4 text-primary" /> NFT Claimed
          </span>
        )}
      </Button>
      {!userData.walletAddress && (
        <p className="mx-auto mt-4 max-w-sm text-center text-xs text-destructive">
          You do not have a wallet address associated with this account. Please
          log in with a valid account which has an associated wallet address to
          continue.
        </p>
      )}
    </React.Fragment>
  );
}
