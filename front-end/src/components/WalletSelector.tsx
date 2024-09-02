"use client";

import {
  APTOS_CONNECT_ACCOUNT_URL,
  AboutAptosConnect,
  AboutAptosConnectEducationScreen,
  AnyAptosWallet,
  AptosPrivacyPolicy,
  WalletItem,
  WalletSortingOptions,
  groupAndSortWallets,
  isAptosConnectWallet,
  isInstallRequired,
  truncateAddress,
  useWallet
} from "@aptos-labs/wallet-adapter-react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Copy,
  LogOut,
  User
} from "lucide-react";
import { ComponentPropsWithoutRef, useCallback, useState } from "react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "./ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import Link from "next/link";

interface WalletSelectorProps extends ComponentPropsWithoutRef<"div"> {
  walletSortingOptions?: WalletSortingOptions;
}

export function WalletSelector({
  walletSortingOptions,
  ...props
}: WalletSelectorProps) {
  const { account, connected, disconnect, wallet } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const copyAddress = useCallback(async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      toast({
        title: "Success",
        description: "Copied wallet address to clipboard."
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy wallet address."
      });
    }
  }, [account?.address, toast]);

  return (
    <div {...props}>
      {connected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" variant={"secondary"}>
              {account?.ansName ||
                truncateAddress(account?.address) ||
                "Unknown"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={copyAddress} className="gap-2">
              <Copy className="h-4 w-4" /> Copy address
            </DropdownMenuItem>
            {wallet && isAptosConnectWallet(wallet) && (
              <DropdownMenuItem asChild>
                <a
                  href={APTOS_CONNECT_ACCOUNT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2"
                >
                  <User className="h-4 w-4" /> Account
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={disconnect} className="gap-2">
              <LogOut className="h-4 w-4" /> Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant={"secondary"}>
              Connect a Wallet
            </Button>
          </DialogTrigger>
          <ConnectWalletDialog close={closeDialog} {...walletSortingOptions} />
        </Dialog>
      )}
    </div>
  );
}

interface ConnectWalletDialogProps extends WalletSortingOptions {
  close: () => void;
}

function ConnectWalletDialog({
  close,
  ...walletSortingOptions
}: ConnectWalletDialogProps) {
  const { wallets = [] } = useWallet();

  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(wallets, walletSortingOptions);

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <DialogContent className="max-h-screen overflow-auto">
      <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
        <DialogHeader>
          <DialogTitle
            className="flex flex-col text-center leading-snug"
            asChild
          >
            {hasAptosConnectWallets ? (
              <>
                <h2 className="text-center">Connect Your Wallet</h2>
              </>
            ) : (
              <h2 className="text-center">Connect Wallet</h2>
            )}
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-[340px] text-pretty text-center text-foreground/80">
            For new users, it is highly recommended to install the{" "}
            <Link
              href={
                "https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci?hl=encategory%3Dextensions&pli=1"
              }
              target="_blank"
              className="font-bold underline underline-offset-2"
            >
              Petra Wallet
            </Link>{" "}
            extension/app and continue with the same.
          </DialogDescription>
        </DialogHeader>

        {/* {hasAptosConnectWallets && (
          <div className="flex flex-col gap-2 pt-3">
            {aptosConnectWallets.map((wallet) => (
              <AptosConnectWalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={close}
              />
            ))}
            <p className="flex items-center justify-center gap-1 text-sm text-foreground/80">
              Learn more about{" "}
              <AboutAptosConnect.Trigger className="flex items-center gap-1 py-3 text-foreground">
                Aptos Connect <ArrowRight size={16} />
              </AboutAptosConnect.Trigger>
            </p>
            <AptosPrivacyPolicy className="flex flex-col items-center py-1">
              <p className="text-xs leading-5">
                <AptosPrivacyPolicy.Disclaimer />{" "}
                <AptosPrivacyPolicy.Link className="text-foreground/80 underline underline-offset-4" />
                <span className="text-foreground/80">.</span>
              </p>
              <AptosPrivacyPolicy.PoweredBy className="flex items-center gap-1.5 text-xs leading-5 text-foreground/80" />
            </AptosPrivacyPolicy>
            <div className="flex items-center gap-3 pt-4 text-foreground/80">
              <div className="h-px w-full bg-secondary" />
              Or
              <div className="h-px w-full bg-secondary" />
            </div>
          </div>
        )} */}

        <div className="flex flex-col gap-3 pt-3">
          {availableWallets.map((wallet) => (
            <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
          ))}
          {availableWallets.length === 0 && (
            <div className="flex flex-col gap-3">
              <span>
                No installed wallets found. Please install a compatible wallet.
                <br />
                <a
                  href="https://aptosfoundation.org/ecosystem/projects/wallets"
                  target="_blank"
                >
                  Click here for a list of compatible wallets.
                </a>
              </span>
            </div>
          )}
          {!!installableWallets.length && (
            <Collapsible className="flex flex-col gap-3">
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-2">
                  More wallets <ChevronDown />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-3">
                {installableWallets.map((wallet) => (
                  <WalletRow
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={close}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </AboutAptosConnect>
    </DialogContent>
  );
}

interface WalletRowProps {
  wallet: AnyAptosWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between gap-4 rounded-md border px-4 py-3"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-6 w-6" />
        <WalletItem.Name className="text-base font-normal" />
      </div>
      {isInstallRequired(wallet) ? (
        <WalletItem.InstallLink>
          <Button size="sm" variant="secondary">
            Install Wallet
          </Button>
        </WalletItem.InstallLink>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm">Connect</Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button size="lg" variant="outline" className="w-full gap-4">
          <WalletItem.Icon className="h-5 w-5" />
          <WalletItem.Name className="text-base font-normal" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
        <Button variant="ghost" size="icon" onClick={screen.cancel}>
          <ArrowLeft />
        </Button>
        <DialogTitle className="text-center text-base leading-snug">
          About Aptos Connect
        </DialogTitle>
      </DialogHeader>

      <div className="flex h-[162px] items-end justify-center pb-3">
        <screen.Graphic />
      </div>
      <div className="flex flex-col gap-2 pb-4 text-center">
        <screen.Title className="text-xl" />
        <screen.Description className="text-sm text-foreground/80 [&>a]:text-foreground [&>a]:underline [&>a]:underline-offset-4" />
      </div>

      <div className="grid grid-cols-3 items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.back}
          className="justify-self-start"
        >
          Back
        </Button>
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-0.5 w-6 bg-muted transition-colors [[data-active]>&]:bg-foreground" />
            </ScreenIndicator>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.next}
          className="gap-2 justify-self-end"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}
