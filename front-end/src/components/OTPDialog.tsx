import React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "./ui/input-otp";
import LoadingButton from "./LoadingButton";
import { Loader2Icon } from "lucide-react";

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (otp: string) => void;
  error?: string;
  attemptsLeft: number;
  isPending: boolean;
}

export default function OTPDialog({
  open,
  onOpenChange,
  onSubmit,
  error,
  attemptsLeft,
  isPending
}: OTPDialogProps) {
  const [otp, setOtp] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[330px]">
        <DialogHeader>
          <DialogTitle asChild>
            <h5>Verify Your Email</h5>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-pretty">
            Please enter the OTP sent to your email.
          </p>
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-full"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-destructive">{error}</p>}
          {attemptsLeft > 0 && (
            <p className="max-w-[300px] text-pretty text-sm text-foreground/80">
              You have {attemptsLeft} attempts left.
              <br /> Failing to verify your email will result in an IP ban.
            </p>
          )}
          <LoadingButton
            onClick={() => onSubmit(otp)}
            disabled={otp.length < 6 || attemptsLeft === 0 || isPending}
            loading={isPending}
            className="inline-flex w-full items-center justify-center gap-2"
          >
            {isPending && <Loader2Icon className="size-5 animate-spin" />}
            {isPending ? "Verifying OTP..." : "Verify OTP"}
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
