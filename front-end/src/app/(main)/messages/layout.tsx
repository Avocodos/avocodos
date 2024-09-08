"use client";
import { BASE_URL } from "@/lib/constants";
import { useWeavy } from "@weavy/uikit-react";

export default function MessagesLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const weavy = useWeavy({
    url: process.env.NEXT_PUBLIC_WEAVY_URL,
    tokenUrl: `${BASE_URL}/api/weavy/token`
  });
  return <>{children}</>;
}
