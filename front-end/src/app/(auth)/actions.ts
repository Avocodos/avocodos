"use server";

import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const { session } = await validateRequest();
  const cookieStore = await cookies();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();

  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/login");
}
