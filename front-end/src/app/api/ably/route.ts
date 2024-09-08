import Ably from "ably";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    const client = new Ably.Rest(env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest();
    return NextResponse.json(tokenRequestData);
}