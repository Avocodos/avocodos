import { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Send messages to your friends on Avocodos - The Web3 Social Platform For Aspiring Developers.",
  keywords: "messages, chat, friends, avocodos"
};

export default function Page() {
  return <Chat />;
}
