import { Metadata } from "next";
import AddCourseForm from "@/components/forms/AddCourseForm";

export const metadata: Metadata = {
  title: "Add New Course",
  description: "Add a new course to the platform",
  keywords: "course, add, new, platform"
};

export default function AddCoursePage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Add New Course
      </h1>
      <AddCourseForm />
    </main>
  );
}
