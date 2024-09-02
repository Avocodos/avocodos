import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import ClientSideNFTButton from "./ClientSideNFTButton";
import { Metadata } from "next";

interface PageProps {
  params: { courseId: string };
}

export async function generateStaticParams() {
  const courses = await prisma?.course.findMany({
    select: { id: true },
    cacheStrategy: { ttl: 3600 } // Cache for 1 hour
  });

  if (!courses) return [];

  return courses.map((course) => ({
    courseId: course.id
  }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const course = await getCourse(params.courseId);

  return {
    title: `${course.title} | Avocodos LMS`,
    description: `Learn ${course.title} with Avocodos LMS`
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
    cacheStrategy: { ttl: 60 }
  });

  if (!course) notFound();

  return course;
}

export default async function LMSPage({ params: { courseId } }: PageProps) {
  const { user } = await validateRequest();
  const userData = await prisma?.user.findUnique({
    where: { id: user?.id },
    cacheStrategy: { ttl: 60 }
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
