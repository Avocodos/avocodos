"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner";
import { User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import kyInstance from "@/lib/ky";

// New client-side component for NFT minting
export default function ClientSideNFTButton({
  courseId,
  userData
}: {
  courseId: string;
  userData: User;
}) {
  const [isLoading, setIsLoading] = useState(false);

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
    }
  };

  return (
    <React.Fragment>
      <Button
        className="inline-flex w-full items-center justify-center gap-2"
        onClick={handleGetNFT}
        disabled={isLoading || !!!userData.walletAddress}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Minting..." : "Get Your NFT Now"}
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
