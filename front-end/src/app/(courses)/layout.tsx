import React from "react";
import SessionProvider from "@/app/(main)/SessionProvider";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/app/(main)/Navbar";
import MenuBar from "@/app/(main)/MenuBar";

export default async function AddCourseLayout({
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
        <div className="mx-4 flex w-full max-w-7xl grow gap-8 p-5 sm:mx-auto">
          <MenuBar className="sticky top-[6.5em] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-4 py-5 shadow-sm md:block md:px-4" />
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-background p-3 md:hidden" />
      </div>
    </SessionProvider>
  );
}
