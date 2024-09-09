"use client";

import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "../../../lib/ky";
import UserAvatar from "../../../components/UserAvatar";
import NewChatDialog from "./NewChatDialog";
import NewGroupDialog from "./NewGroupDialog";
import { Channel } from "@prisma/client";
import { ExtendedChannel } from "./Chat";

interface Chat {
  id: string;
  displayName: string;
  lastMessage: string;
  avatarUrl?: string;
}

export default function Sidebar({
  chats,
  channels
}: {
  chats: Chat[];
  channels: ExtendedChannel[];
}) {
  return (
    null
  );
}
