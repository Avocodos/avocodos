"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RewardRequirementType } from "@prisma/client";
import { Metadata } from "next";
import { AUTHORIZED_INSTRUCTORS } from "@/lib/constants";

// Define the schema for reward creation
const rewardSchema = z.object({
  name: z.string().min(3, "Reward name must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  requirement: z.number().min(1, "Requirement must be at least 1"),
  requirementType: z.enum([
    ...Object.values(RewardRequirementType)
  ] as unknown as [string, ...string[]]),
  imageUrl: z.string().optional()
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Add New Reward",
    description: "Add a new reward to the platform",
    keywords: "reward, add, new, platform",
    robots: "index, follow",
    openGraph: {
      title: "Add New Reward",
      description: "Add a new reward to the platform",
      url: "https://www.avocodos.com/rewards/add",
      images: ["/auth.webp"]
    }
  };
}

type RewardFormValues = z.infer<typeof rewardSchema>;

export default function AddRewardForm() {
  const { user } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      requirement: 1,
      requirementType: "OTHER",
      imageUrl: "https://avocodos.com/auth.webp"
    }
  });

  if (!user || !AUTHORIZED_INSTRUCTORS.includes(user.id)) {
    return (
      <p className="text-base text-destructive">
        You are not authorized to add rewards :p
      </p>
    );
  }

  async function onSubmit(values: RewardFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error("Failed to create reward");
      }

      const createdReward = await response.json();

      toast({
        title: "Reward created",
        description: "Your reward has been successfully created."
      });

      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create reward. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mr-auto max-w-full space-y-8 md:w-screen md:max-w-xl"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Reward name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Reward description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirementType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a requirement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[...Object.values(RewardRequirementType)].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").charAt(0).toUpperCase() +
                        type.replace(/_/g, " ").slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Reward image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Reward"}
        </Button>
      </form>
    </Form>
  );
}
