"use client";

import {
  AptosWalletAdapterProvider,
  Wallet
} from "@aptos-labs/wallet-adapter-react";
import { BitgetWallet } from "@bitget-wallet/aptos-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "@msafe/aptos-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { useAutoConnect } from "./AutoConnectProvider";
import { useToast } from "@/components/ui/use-toast";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { autoConnect } = useAutoConnect();
  const { toast } = useToast();

  const wallets: readonly Wallet[] = [
    new PetraWallet() as Wallet,
    new WelldoneWallet() as Wallet,
    new BitgetWallet() as Wallet,
    new FewchaWallet() as Wallet,
    new MartianWallet() as Wallet,
    new MSafeWalletAdapter() as Wallet,
    new PontemWallet() as Wallet,
    new TrustWallet() as Wallet,
    new OKXWallet() as Wallet
  ] as const;

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={autoConnect}
      // dappConfig={{
      //   network: Network.TESTNET,
      //   aptosConnectDappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
      //   mizuwallet: {
      //     manifestURL:
      //       "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json"
      //   }
      // }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error"
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
