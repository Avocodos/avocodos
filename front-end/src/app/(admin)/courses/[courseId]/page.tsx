import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import CourseDetails from "@/components/CourseDetails";
import CourseDetailsSkeleton from "@/components/skeletons/CourseDetailsSkeleton";
import Link from "next/link";

interface PageProps {
  params: { courseId: string };
}

async function getCourse(courseId: string) {
  const course = await prisma?.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      },
      lessons: {
        select: {
          id: true,
          title: true,
          order: true
        },
        orderBy: { order: "asc" }
      }
    },
    cacheStrategy: { ttl: 3600, swr: 86400 }
  });

  if (!course) notFound();

  return course;
}

export async function generateStaticParams() {
  const courses = await prisma?.course.findMany({
    select: { id: true },
    cacheStrategy: { ttl: 3600 } // Cache for 1 hour
  });

  return (
    courses?.map((course) => ({
      courseId: course.id
    })) || []
  );
}

export async function generateMetadata({
  params: { courseId }
}: PageProps): Promise<Metadata> {
  const course = await getCourse(courseId);

  return {
    title: `${course.title} | Avocodos Learning Admin`,
    description: `Admin view for ${course.title} course`
  };
}

export default function CoursePage({ params: { courseId } }: PageProps) {
  return (
    <main className="container mx-auto py-8">
      <Suspense fallback={<CourseDetailsSkeleton />}>
        <CourseContent courseId={courseId} />
      </Suspense>
    </main>
  );
}

async function CourseContent({ courseId }: { courseId: string }) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page. Please{" "}
        <Link href="/login" className="underline">
          login
        </Link>{" "}
        to continue.
      </p>
    );
  }

  const course = await getCourse(courseId);

  return <CourseDetails course={course} />;
}
