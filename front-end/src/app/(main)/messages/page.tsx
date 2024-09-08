import { Metadata } from "next";
import Chat from "./Chat";
import { validateRequest } from "@/auth";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Send messages to your friends on Avocodos - The Web3 Social Platform For Aspiring Developers.",
  keywords: "messages, chat, friends, avocodos"
};

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return notFound();
  }
  return <Chat />;
}
