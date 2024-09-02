import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Bookmarks from "./Bookmarks";
import { Bookmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Bookmarks"
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2">
            <Bookmark className="size-8" /> Bookmarks
          </h3>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </main>
  );
}
