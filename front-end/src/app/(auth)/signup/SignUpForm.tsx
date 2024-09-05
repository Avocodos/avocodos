"use client";
import { useState, useTransition, useEffect } from "react";
import Confetti from "react-confetti";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { WalletSelector } from "@/components/WalletSelector";
import { CheckIcon, XIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { signUp, verifyOTP } from "./actions";
import OTPDialog from "@/components/OTPDialog";
import kyInstance from "@/lib/ky";
import { toast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpError, setOtpError] = useState<string>();
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [userId, setUserId] = useState<string>();
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { account, wallet, connected, isLoading } = useWallet();

  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: ""
    }
  });

  const checkPasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength =
      (hasMinLength ? 1 : 0) +
      (hasUppercase ? 1 : 0) +
      (hasLowercase ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecialChar ? 1 : 0);

    if (strength < 3) return "weak";
    if (strength < 5) return "medium";
    return "strong";
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "password") {
        setPasswordStrength(checkPasswordStrength(value.password || ""));
        setShowPasswordStrength(!!value.password);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      if (!account?.address) {
        setError("No wallet connected. Please connect a wallet.");
        return;
      }
      const { error, userId } = await signUp({
        ...values,
        account: account,
        wallet: wallet
      });

      if (error) {
        setError(error);
      } else if (userId) {
        setUserId(userId);
        setShowOTPDialog(true);
      }
    });
  }

  async function handleOTPSubmit(otp: string) {
    if (!userId) return;

    const { success, error } = await verifyOTP(userId, otp);
    if (success) {
      try {
        const response = await kyInstance
          .post("/api/nft/welcome")
          .json<{ success: boolean } | { error: string }>();
        if ("success" in response) {
          toast({
            title: `Welcome to Avocodos, ${form.getValues("username")}! 🎉`,
            description:
              "You have been rewarded with a welcoming gift from our side, an exclusive NFT. You can view it in your wallet or on your NFT Rewards, which is on your profile. 🥳",
            variant: "default"
          });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        } else {
          setError(response.error);
          toast({
            title: "Error rewarding Welcome NFT",
            description: response.error,
            variant: "destructive"
          });
        }
      } catch (error) {
        setError("Failed to mint NFT. Please try again later.");
      }
    } else {
      setOtpError(error || "Invalid OTP");
      setOtpAttempts((prev) => prev + 1);
      if (otpAttempts >= 2) {
        setOtpError("Failed to verify email. Please try again later.");
      }
    }
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth - 20}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={50}
          style={{ zIndex: 2000 }}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3 px-1"
        >
          {error && <p className="text-left text-destructive">{error}</p>}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
                {showPasswordStrength && (
                  <div className="mt-2 space-y-1 text-sm">
                    <PasswordStrengthIndicator password={field.value} />
                  </div>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet</FormLabel>
                <FormControl>
                  <WalletSelector {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            loading={isPending}
            type="submit"
            className="mt-1 w-full"
            disabled={isLoading || !connected || !form.formState.isValid}
          >
            Create Account
          </LoadingButton>
          <p className="mt-2 inline-flex flex-row flex-wrap items-center justify-center gap-2 text-pretty text-sm text-foreground/80">
            <span>
              {wallet?.name ? (
                <CheckIcon className="-mt-0.5 text-primary" />
              ) : (
                <XIcon className="-mt-0.5 text-destructive" />
              )}
            </span>
            {!wallet?.name
              ? "No Wallet Connected. Please connect a wallet."
              : "Wallet connected successfully."}
          </p>
        </form>
      </Form>

      <OTPDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        onSubmit={handleOTPSubmit}
        error={otpError}
        attemptsLeft={3 - otpAttempts}
        isPending={isPending}
      />
    </>
  );
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = checkPasswordStrength(password);
  const isStrong =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  if (isStrong) {
    return (
      <p className="font-semibold text-green-500">
        <CheckIcon className="mr-1 inline h-4 w-4" /> Strong password
      </p>
    );
  }

  return (
    <>
      <p
        className={`font-semibold ${
          strength === "weak"
            ? "text-red-500"
            : strength === "medium"
              ? "text-yellow-500"
              : "text-green-500"
        }`}
      >
        Password Strength:{" "}
        {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </p>
      <p>
        <StatusIcon checked={hasMinLength} /> At least 8 characters
      </p>
      <p>
        <StatusIcon checked={hasUppercase} /> At least 1 uppercase letter
      </p>
      <p>
        <StatusIcon checked={hasLowercase} /> At least 1 lowercase letter
      </p>
      <p>
        <StatusIcon checked={hasNumber} /> At least 1 number
      </p>
      <p>
        <StatusIcon checked={hasSpecialChar} /> At least 1 special character
      </p>
    </>
  );
}

function StatusIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <CheckIcon className="inline h-4 w-4 text-green-500" />
  ) : (
    <XIcon className="inline h-4 w-4 text-red-500" />
  );
}

function checkPasswordStrength(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  if (strength < 3) return "weak";
  if (strength < 5) return "medium";
  return "strong";
}
