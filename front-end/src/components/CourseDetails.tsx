"use client";

import { Course, Lesson, User } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { formatDate } from "date-fns";
import { formatDatePretty, USDToINR } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  ClockIcon,
  Grid2X2,
  Grid2X2Icon,
  List,
  UserIcon,
  Users
} from "lucide-react";
import Link from "next/link";
import CourseDetailsSkeleton from "./skeletons/CourseDetailsSkeleton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface CourseDetailsProps {
  course: Course & {
    instructor: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
    lessons: Pick<Lesson, "id" | "title" | "order">[];
  };
}

export default function CourseDetails({ course }: CourseDetailsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleEnrollNow = () => {
    setIsDialogOpen(true);
  };

  const handlePayNow = () => {
    setIsDialogOpen(false);
    router.push(`/lms/${course.id}`);
  };
  return (
    <div className="flex flex-col gap-8">
      <Link href="/">
        <Button variant="default" className="max-w-fit">
          <ArrowLeft className="mr-2 size-4" />
          Back To Courses
        </Button>
      </Link>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="">
            <img
              src={course.imageUrl}
              alt={course.title}
              width={1200}
              height={675}
              className="w-full rounded-t-lg object-cover"
            />

            <CardContent className="p-6 !pt-0 md:p-8">
              <h4 className="mb-3 pt-6">{course.title}</h4>
              <p className="mb-4 text-foreground/80">{course.description}</p>
              <h6 className="mb-3 inline-flex items-center gap-2">
                <UserIcon className="mt-0.5 size-5" /> Instructor
              </h6>
              <div className="mb-4 flex items-center space-x-2">
                <UserAvatar avatarUrl={course.instructor.avatarUrl} />
                <span>{course.instructor.displayName}</span>
              </div>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h6 className="inline-flex items-center gap-2 text-xl font-bold">
                    <Grid2X2Icon className="mt-0.5 size-5" /> Category
                  </h6>
                  <p className="text-pretty capitalize text-foreground/80">
                    {course.category}
                  </p>
                </div>
                <div>
                  <h6 className="inline-flex items-center gap-2 text-xl font-bold">
                    <ArrowUpRight className="mt-0.5 size-5" /> Level
                  </h6>
                  <p className="text-pretty capitalize text-foreground/80">
                    {course.level}
                  </p>
                </div>
                <div>
                  <h6 className="inline-flex items-center gap-2 text-xl font-bold">
                    <ClockIcon className="mt-0.5 size-5" /> Duration
                  </h6>
                  <p className="text-pretty capitalize text-foreground/80">
                    {course.duration} minutes
                  </p>
                </div>
                <div>
                  <h6 className="inline-flex items-center gap-2 text-xl font-bold">
                    <Users className="mt-0.5 size-5" /> Enrolled
                  </h6>
                  <p className="text-pretty capitalize text-foreground/80">
                    {course.enrollmentCount} students
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <h6 className="mb-1 inline-flex items-center gap-2 text-xl font-bold">
                  <List className="mt-0.5 size-5" /> Course Content
                </h6>
                <ul className="list-inside list-disc space-y-1">
                  {course.lessons.map((lesson) => (
                    <li key={lesson.id} className="text-foreground/80">
                      {lesson.title}
                    </li>
                  ))}
                  {course.lessons.length === 0 && (
                    <li className="text-foreground/80">No lessons found</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <span className="text-sm text-foreground/80">
                Get the course now for just
              </span>
              <p className="mb-4 text-3xl font-bold text-foreground/80">
                ${course.price} / ₹{USDToINR(course.price).toFixed(0)}
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="mb-4 mt-1 w-full">
                    Enroll Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle asChild>
                      <h6>Demo Payment</h6>
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-foreground/80">
                    This is a demo payment. Please click on the &quot;Pay
                    Now&quot; button to continue.
                  </p>
                  <DialogFooter>
                    <Button onClick={handlePayNow}>Pay Now</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="mt-2 space-y-4 text-sm">
                <p className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-2 text-xl font-bold">
                    <ClockIcon className="mt-0.5 size-5" /> Start Date
                  </span>{" "}
                  {course.startDate
                    ? formatDatePretty(course.startDate)
                    : "Flexible"}
                </p>
                <p className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-2 text-xl font-bold">
                    <ClockIcon className="mt-0.5 size-5" /> End Date
                  </span>{" "}
                  {course.endDate
                    ? formatDatePretty(course.endDate)
                    : "Flexible"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
