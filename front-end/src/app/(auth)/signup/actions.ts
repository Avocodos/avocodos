"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendOTPEmail } from "@/lib/zepto-client";
import crypto from 'crypto';

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
}

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error?: string; userId?: string }> {
  try {
    const { username, email, password, wallet, account } = signUpSchema.parse(credentials);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma?.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      cacheStrategy: { ttl: 60 },
    });

    if (existingUsername) {
      return {
        error: "Username already taken. Please choose another.",
      };
    }

    const existingEmail = await prisma?.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      cacheStrategy: { ttl: 60 },
    });

    const existingWallet = await prisma?.user.findFirst({
      where: {
        walletAddress: account?.address,
      },
      cacheStrategy: { ttl: 60 },
    });

    if (existingWallet) {
      return {
        error: "Wallet already linked with another account. Please connect a different wallet.",
      };
    }

    if (existingEmail) {
      return {
        error: "Email already associated with an account.",
      };
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma?.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
          walletAddress: account?.address,
          walletLink: wallet?.url,
          walletName: wallet?.name,
          walletPublicKey:
            typeof account?.publicKey === "string"
              ? account?.publicKey
              : (account?.publicKey as string[]).join(" "),
          emailVerifyToken: otp,
          emailVerifyExpires: otpExpires,
        },
      });
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    await sendOTPEmail(email, otp);

    return { userId };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function verifyOTP(userId: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma?.user.findUnique({
    where: { id: userId },
    select: { emailVerifyToken: true, emailVerifyExpires: true },
    cacheStrategy: { ttl: 60 },
  });

  if (!user || user.emailVerifyToken !== otp) {
    return { success: false, error: "Invalid OTP" };
  }

  if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
    return { success: false, error: "OTP has expired" };
  }

  await prisma?.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  const session = await lucia.createSession(userId, {
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return { success: true };
}