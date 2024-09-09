import { Metadata } from "next";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import Chat from "./Chat";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Send messages to your friends on Avocodos - The Web3 Social Platform For Aspiring Developers.",
  keywords: "messages, chat, friends, avocodos"
};

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 pt-4">
      <p className="text-destructive">
        This feature is still in development.{" "}
        <span className="text-foreground">
          If you find any bugs, please report them{" "}
          <Link
            target="_blank"
            href="https://github.com/Avocodos/avocodos/issues/new"
          >
            here
          </Link>
          .
        </span>
      </p>
      <Chat user={user} />
    </div>
  );
}
