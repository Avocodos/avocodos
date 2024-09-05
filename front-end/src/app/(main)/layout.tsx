import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";
import { headers } from "next/headers";
import MenuBarServer from "./MenuBarServer";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl grow gap-8 px-4 pb-48 pt-8 lg:px-8">
          <MenuBarServer className="sticky top-[6.5em] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-4 py-5 shadow-sm lg:block lg:px-4" />
          {children}
        </div>
        <MenuBarServer className="sticky bottom-0 z-10 flex w-full justify-center gap-5 border-t bg-background p-3 lg:hidden" />
      </div>
    </SessionProvider>
  );
}
