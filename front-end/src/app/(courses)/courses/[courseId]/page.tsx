import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata, Viewport } from "next";
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
  });

  if (!course) notFound();

  return course;
}

export async function generateStaticParams() {
  const courses = await prisma?.course.findMany({
    select: { id: true },
  });

  return (
    courses?.map((course) => ({
      courseId: course.id
    })) || []
  );
}

export async function generateMetadata(
  { params: { courseId } }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const course = await getCourse(courseId);
  const previousImages = (await parent).openGraph?.images || [];

  const description = `Admin view for ${course.title} course on Avocodos Learning. Manage course content, lessons, and student progress.`;

  return {
    title: course.title,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/courses/${course.id}`
    },
    openGraph: {
      title: course.title,
      description,
      url: `https://avocodos.com/courses/${course.id}`,
      siteName: "Avocodos Learning Admin",
      images: [`/api/og?courseId=${course.id}`, ...previousImages],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      creator: "@HarjjotSinghh",
      images: [`/api/og?courseId=${course.id}`]
    },
    category: "Web3 Education",
    keywords: [
      course.title,
      "Avocodos Learning",
      "Course Management",
      "Web3 Education",
      "Blockchain Course",
      "Crypto Learning",
      "Aptos Development",
      "Online Education",
      "E-learning Platform",
      "Web3 Skills",
      "Blockchain Technology",
      "Crypto Education",
      "Smart Contracts",
      "Decentralized Finance",
      "Web3 Career",
      "Blockchain Certification",
      "Crypto Training",
      "Aptos Ecosystem",
      "Web3 Programming",
      "Blockchain Fundamentals"
    ],
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    applicationName: "Avocodos Learning Admin",
    referrer: "origin-when-cross-origin",
    appLinks: {
      web: {
        url: "https://avocodos.com",
        should_fallback: true
      }
    }
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#2fbe13" },
      { media: "(prefers-color-scheme: dark)", color: "#3bf019" }
    ]
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
