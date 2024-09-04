"use client";

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
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Tag, TagInput } from "emblor";
import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { Community } from "@prisma/client";

// Define the schema for community creation
const communitySchema = z.object({
  name: z.string().min(3, "Community name must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  category: z
    .array(
      z.object({
        id: z.string(),
        text: z.string()
      })
    )
    .min(1, "Please select at least one category"),
  isPrivate: z.boolean(),
  rules: z.string().optional()
});

type CommunityFormValues = z.infer<typeof communitySchema>;

export default function AddCommunityForm() {
  const { user } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = React.useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(-1);

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      description: "",
      category: [],
      isPrivate: false,
      rules: ""
    }
  });

  if (!user) {
    return (
      <p className="text-base text-destructive">
        You must be logged in to create a community.
      </p>
    );
  }

  async function onSubmit(values: CommunityFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error("Failed to create community");
      }

      const createdCommunity: Community = await response.json();

      toast({
        title: "Community created",
        description: "Your community has been successfully created."
      });

      form.reset();
      setCategories([]);
      router.push(`/communities/${createdCommunity.name}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
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
        className="max-w-lg space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter community name" {...field} />
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
                <Textarea placeholder="Describe your community" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  placeholder="Enter categories"
                  tags={categories}
                  className="sm:min-w-[450px]"
                  setTags={(newTags) => {
                    setCategories(newTags);
                    form.setValue("category", newTags as [Tag, ...Tag[]]);
                  }}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                  customTagRenderer={(tag, isActiveTag) => (
                    <div
                      className={`${
                        isActiveTag
                          ? "bg-primary text-neutral-950"
                          : "bg-secondary"
                      } inline-flex flex-row items-center gap-1 rounded-full px-2 py-1`}
                    >
                      <XIcon
                        onClick={() => {
                          setCategories(
                            categories.filter((t) => t.id !== tag.id)
                          );
                        }}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="pr-1.5 text-sm font-medium">
                        {tag.text}
                      </span>
                    </div>
                  )}
                />
              </FormControl>
              <FormDescription>
                Enter categories for your community
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Private Community</FormLabel>
                <FormDescription>
                  Make this community private (invite-only)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Rules (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter community rules" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Community"}
        </Button>
      </form>
    </Form>
  );
}
