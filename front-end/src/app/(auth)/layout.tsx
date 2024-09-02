import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { AutoConnectProvider } from "@/providers/AutoConnectProvider";
import { WalletProvider } from "@/providers/AptosProvider";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) redirect("/");

  return (
    <AutoConnectProvider>
      <WalletProvider>{children}</WalletProvider>
    </AutoConnectProvider>
  );
}
