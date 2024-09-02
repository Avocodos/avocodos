import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Notifications from "./Notifications";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications"
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="group rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-3">
            <Bell className="size-6 avocodos-transition group-hover:-rotate-12" />
            Notifications
          </h3>
        </div>
        <Notifications />
      </div>
      <TrendsSidebar />
    </main>
  );
}
