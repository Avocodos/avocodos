import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import bannerPlaceholder from "@/../public/auth.webp";
import CropImageDialog from "@/components/CropImageDialog";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { useUpdateProfileMutation } from "./mutations";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange
}: EditProfileDialogProps) {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
      banner: user.bannerUrl || ""
    }
  });

  const mutation = useUpdateProfileMutation();

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<Blob | null>(null);

  async function onSubmit(values: UpdateUserProfileValues) {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.png`)
      : undefined;
    const newBannerFile = croppedBanner
      ? new File([croppedBanner], `banner_${user.id}.png`)
      : undefined;

    mutation.mutate(
      {
        values,
        avatar: newAvatarFile,
        banner: newBannerFile
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          setCroppedBanner(null);
          onOpenChange(false);
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollArea className="h-full max-h-[500px]">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="inline-flex flex-col items-start justify-start gap-1.5">
              Avatar
              <span className="text-xs text-muted-foreground">
                Max size: 1MB, Recommended resolution: 512x512
              </span>
            </Label>
            <AvatarInput
              src={
                croppedAvatar
                  ? URL.createObjectURL(croppedAvatar)
                  : user.avatarUrl || avatarPlaceholder
              }
              onImageCropped={setCroppedAvatar}
            />
          </div>
          <div className="space-y-2">
            <Label className="inline-flex flex-col items-start justify-start gap-1.5">
              Banner
              <span className="text-xs text-muted-foreground">
                Max size: 2MB, Recommended resolution: 1500x500
              </span>
            </Label>
            <BannerInput
              src={
                croppedBanner
                  ? URL.createObjectURL(croppedBanner)
                  : user.bannerUrl || bannerPlaceholder
              }
              onImageCropped={setCroppedBanner}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <LoadingButton type="submit" loading={mutation.isPending}>
                  Save
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </ScrollArea>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "PNG",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        <div className="absolute inset-0 size-full rounded-full bg-black bg-opacity-50 avocodos-transition group-hover:bg-opacity-15"></div>
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white avocodos-transition group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}

interface BannerInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function BannerInput({ src, onImageCropped }: BannerInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1500,
      500,
      "PNG",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Banner preview"
          width={1500}
          height={500}
          className="relative h-36 w-full rounded-lg object-cover"
        />
        <div className="absolute inset-0 size-full rounded-b-lg bg-black bg-opacity-50 avocodos-transition group-hover:bg-opacity-15"></div>
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white avocodos-transition group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1500 / 500}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}
