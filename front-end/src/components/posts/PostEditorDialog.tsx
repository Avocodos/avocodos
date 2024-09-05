import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import PostEditor from "@/components/posts/editor/PostEditor";

interface PostEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostEditorDialog({
  open,
  onOpenChange
}: PostEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90dvw] max-w-[90dvw] sm:w-[80dvw] sm:max-w-[80dvw] md:w-[50dvw] md:max-w-[50dvw]">
        <DialogHeader>
          <DialogTitle asChild>
            <h4>Create a New Post</h4>
          </DialogTitle>
        </DialogHeader>
        <PostEditor />
      </DialogContent>
    </Dialog>
  );
}
