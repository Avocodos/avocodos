import { validateRequest } from "@/auth";
import { Option } from "@/components/ui/multiple-selector";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();
    const { memberIds }: { memberIds: Option[] } = await req.json();

    if (!prisma) return Response.json({ error: "Prisma client not initialized" }, { status: 500 });
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (memberIds.length < 2) return Response.json({ error: "At least 3 members required" }, { status: 400 });

    const groupChannel = await prisma.channel.create({
        data: {
            type: "GROUP",
            members: {
                connect: [{ id: user.id }, ...memberIds.map((id) => ({ id: id.value }))],
            },
        },
    });

    return Response.json(groupChannel);
}