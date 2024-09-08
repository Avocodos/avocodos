import { NextApiRequest, NextApiResponse } from "next";
import { validateRequest } from "../../../../auth";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    const { user } = await validateRequest();

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const username = user.username;

    let response = await fetch(`${process.env.NEXT_PUBLIC_WEAVY_URL}/api/users/${username}/tokens`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.WEAVY_API_KEY}` }
    });

    if (response.ok) {
        let data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } else {
        return NextResponse.json({ message: "Could not get access token from server" }, { status: 500 });
    }
};
