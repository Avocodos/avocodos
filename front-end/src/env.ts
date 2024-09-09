import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_DATABASE_URL: z.string().url(),
    STREAM_SECRET: z.string(),
    UPLOADTHING_SECRET: z.string(),
    UPLOADTHING_APP_ID: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    ALLOWED_METHODS: z.string(),
    ALLOWED_ORIGIN: z.string(),
    ALLOWED_HEADERS: z.string(),
    EXPOSED_HEADERS: z.string(),
    MAX_AGE: z.string(),
    CREDENTIALS: z.string(),
    ABLY_API_KEY: z.string(),
    WEAVY_API_KEY: z.string(),
    WEAVY_API_URL: z.string(),
    SUPABASE_URL: z.string(),
    SUPABASE_ANON_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_STREAM_KEY: z.string(),
    NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    STREAM_SECRET: process.env.STREAM_SECRET,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    NODE_ENV: process.env.NODE_ENV,
    ALLOWED_METHODS: process.env.ALLOWED_METHODS,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
    ALLOWED_HEADERS: process.env.ALLOWED_HEADERS,
    EXPOSED_HEADERS: process.env.EXPOSED_HEADERS,
    MAX_AGE: process.env.MAX_AGE,
    CREDENTIALS: process.env.CREDENTIALS,
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    WEAVY_API_KEY: process.env.WEAVY_API_KEY,
    WEAVY_API_URL: process.env.WEAVY_API_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }
});
