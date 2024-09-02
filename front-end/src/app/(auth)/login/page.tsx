import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";
import LoginForm from "./LoginForm";
import authImage from "@/assets/auth.webp";

export const metadata: Metadata = {
  title: "Login"
};

export default function Page() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-background">
        <div className="w-full space-y-10 overflow-y-auto p-4 md:max-w-lg md:p-16">
          <div>
            <h3 className="text-left text-3xl font-bold">Login to Avocodos</h3>
            <p className="mt-2 text-pretty text-left text-foreground/80">
              Welcome back! Please enter your details below to continue.
            </p>
          </div>
          <div className="space-y-5">
            {/* <GoogleSignInButton /> */}
            {/* <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div> */}
            <LoginForm />
            <Link href="/signup" className="block text-center">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
        <div className="relative hidden w-full md:block">
          <div className="absolute inset-0 z-10 h-full w-full bg-gradient-to-l from-transparent from-60% to-background"></div>
          <Image
            src={"/auth.webp"}
            alt=""
            width={1280}
            height={720}
            draggable={false}
            className="hidden h-screen w-full flex-1 select-none object-cover dark:hidden dark:md:block"
          />
          <Image
            src={"/auth-light.webp"}
            alt=""
            width={1280}
            height={720}
            draggable={false}
            className="hidden h-screen w-full flex-1 select-none object-cover dark:hidden md:block"
          />
        </div>
      </div>
    </main>
  );
}
