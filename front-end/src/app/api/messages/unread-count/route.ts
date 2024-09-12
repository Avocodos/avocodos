import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { MessageCountInfo } from "@/lib/types";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prisma) {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    const messageReadReceipts = await prisma.messageReadReceipt.findMany({
      where: {
        userId: user.id,
        read: false
      }
    });

    const channelUnreadCounts = messageReadReceipts.reduce((acc, receipt) => {
      const channelId = receipt.channelId;
      if (!acc[channelId as any]) {
        acc[channelId as any] = 0;
      }
      acc[channelId as any]++;
      return acc;
    }, {} as { [channelId: string]: number });

    const totalUnreadCount = Object.values(channelUnreadCounts).reduce((a, b) => a + b, 0);

    const data: MessageCountInfo = {
      unreadCount: totalUnreadCount,
      channelUnreadCounts
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}