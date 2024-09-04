import { z } from "zod";
import { AccountInfo, type WalletInfo } from "@aptos-labs/wallet-adapter-react";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  wallet: z.custom<WalletInfo>().or(z.null()),
  account: z.custom<AccountInfo>().or(z.null()),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
  wallet: z.custom<WalletInfo>().or(z.null()),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
  communityName: z.string().or(z.null()),
  badgeId: z.string().or(z.null()),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
  banner: z.string().optional(),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});


export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  imageUrl: z.string().url("Invalid image URL"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  isPublished: z.boolean(),
  startDate: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).optional()
});