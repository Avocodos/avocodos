import { cn } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import { Button, ButtonProps } from "./ui/button";
import { Loader2, Loader2Icon } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2Icon className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
