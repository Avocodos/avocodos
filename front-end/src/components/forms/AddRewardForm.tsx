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

// Define the schema for reward creation
const rewardSchema = z.object({
  name: z.string().min(3, "Reward name must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  requirement: z.number().min(1, "Requirement must be at least 1"),
  requirementType: z.enum(
    Object.values(RewardRequirementType) as [string, ...string[]]
  )
});

type RewardFormValues = z.infer<typeof rewardSchema>;

const authorizedInstructors = [
  "hr4b7qe2umifrlec",
  "sorhu7vjt7mwxlgy",
  "m6klf54owcy6kf2u"
];

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
      requirementType: "POSTS"
    }
  });

  if (!user || !authorizedInstructors.includes(user.id)) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <SelectItem value="POSTS">Posts</SelectItem>
                  <SelectItem value="COMMENTS">Comments</SelectItem>
                  <SelectItem value="LIKES">Likes</SelectItem>
                  <SelectItem value="FOLLOWS">Follows</SelectItem>
                  <SelectItem value="ENROLLMENTS">Enrollments</SelectItem>
                  <SelectItem value="REVIEWS">Reviews</SelectItem>
                  <SelectItem value="COMMUNITY_JOINS">
                    Community Joins
                  </SelectItem>
                  <SelectItem value="COMMUNITY_POSTS">
                    Community Posts
                  </SelectItem>
                  <SelectItem value="COMMUNITY_COMMENTS">
                    Community Comments
                  </SelectItem>
                  <SelectItem value="COMMUNITY_LIKES">
                    Community Likes
                  </SelectItem>
                </SelectContent>
              </Select>
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
