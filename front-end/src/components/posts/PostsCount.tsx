import { formatNumber, getKandMString } from "@/lib/utils";

export default function PostsCount({ count }: { count: number }) {
  return (
    <span className="inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-muted p-2.5">
      <span className="text-3xl font-bold">{getKandMString(count)}</span>
      <span className="text-xs text-foreground/80">Posts</span>
    </span>
  );
}
