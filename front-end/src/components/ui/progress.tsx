"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-foreground/15 to-secondary/60",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="animate-skeleton h-full w-full flex-1 rounded-l-full rounded-r-full bg-gradient-to-r from-primary to-primary/85 bg-[size:1000px_100%] avocodos-transition before:absolute before:-right-2 before:top-1/2 before:size-4 before:-translate-y-1/2 before:rounded-full before:bg-primary before:blur-lg after:absolute after:-right-2 after:top-1/2 after:size-4 after:-translate-y-1/2 after:rounded-full after:bg-primary after:blur-xl"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
