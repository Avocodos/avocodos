import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import ClientSideNFTButton from "./ClientSideNFTButton";
import { Metadata, ResolvingMetadata, Viewport } from "next";

interface PageProps {
  params: { courseId: string };
}

export async function generateStaticParams() {
  const courses = await prisma?.course.findMany({
    select: { id: true },
  });

  if (!courses) return [];

  return courses.map((course) => ({
    courseId: course.id
  }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const course = await getCourse(params.courseId);

  const previousImages = (await parent).openGraph?.images || [];

  const description = `Learn ${course.title} on Avocodos LMS. ${course.description || ""}`;

  return {
    title: `${course.title} | Avocodos LMS`,
    description,
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: `/lms/${course.id}`
    },
    openGraph: {
      title: `${course.title} | Avocodos LMS`,
      description,
      url: `https://avocodos.com/lms/${course.id}`,
      siteName: "Avocodos",
      images: [`/api/og?courseId=${course.id}`, ...previousImages],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | Avocodos LMS`,
      description,
      creator: "@HarjjotSinghh",
      images: [`/api/og?courseId=${course.id}`]
    },
    category: "Web3 Education",
    keywords: [
      course.title,
      "Avocodos LMS",
      "Web3 Course",
      "Blockchain Education",
      "Crypto Learning",
      "Aptos Development",
      "Decentralized Learning",
      "DeFi Education",
      "NFT Course",
      "Web3 Skills",
      "Blockchain Technology",
      "Crypto Education",
      "Aptos Smart Contracts",
      "Decentralized Finance",
      "Web3 Career",
      "Blockchain Certification",
      "Crypto Training",
      "Aptos Ecosystem",
      "Web3 Programming",
      "Blockchain Fundamentals"
    ],
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    applicationName: "Avocodos",
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

async function getCourse(courseId: string) {
  const course = await prisma?.course.findUnique({
    where: { id: courseId },
    include: {
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

export default async function LMSPage({ params: { courseId } }: PageProps) {
  const { user } = await validateRequest();
  const userData = await prisma?.user.findUnique({
    where: { id: user?.id },
  });
  if (!user || !userData) {
    redirect("/login");
  }

  const course = await getCourse(courseId);

  return (
    <main className="max-w-3xl pt-4">
      <h1 className="mb-8 text-3xl font-bold">Avocodos LMS</h1>
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{course.title}</h2>
        <ul className="list-none space-y-2 marker:!mt-2">
          {course.lessons.map((lesson) => (
            <li key={lesson.id} className="flex items-center gap-2">
              <Image src="/check.svg" alt="Check" width={16} height={16} />
              <span className="line-through">{lesson.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <p>Your Progress ({user.displayName})</p>
      <div className="mt-2">
        <div className="relative">
          <img
            src="https://previews.123rf.com/images/metelsky/metelsky1808/metelsky180800328/108021221-diagonal-lines-pattern-lined-background-vector-illustration.jpg"
            alt="stripes"
            className="absolute inset-0 z-10 h-full w-full rounded-full object-cover opacity-10 mix-blend-screen dark:mix-blend-multiply"
          />
          <p className="absolute inset-0 z-10 flex items-center justify-center text-center text-sm text-neutral-900">
            <strong>100%</strong>&nbsp; Completed: {course.title}
          </p>
          <Progress value={100} className="mb-4 h-6" />
        </div>
        <p className="mx-auto mb-4 max-w-md text-center">
          Thank you for completing the entire course with Avocodos! You can now
          redeem your free NFT.
        </p>
        <ClientSideNFTButton userData={userData} courseId={courseId} />
      </div>
    </main>
  );
}
