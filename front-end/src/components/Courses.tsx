"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import kyInstance from "@/lib/ky";
import type { Course } from "@prisma/client";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { DollarSign, IndianRupee } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { USDToINR } from "@/lib/utils";

export function Courses({
  courses,
  loading
}: {
  courses: Course[];
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-4xl font-bold">Browse Our Courses</h2>
        <p className="mt-2 text-foreground/80">
          Explore our wide range of courses to enhance your skills and
          knowledge. Enroll in a course and start learning today! Every user who
          completes any course will get a custom NFT minted for them on the
          Aptos network.
        </p>
      </div>
      <div className="flex w-full flex-col gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : courses &&
            courses.length > 0 &&
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
        {courses && !courses.length && !loading && (
          <div className="flex items-center justify-center">
            <p className="text-foreground/80">No courses found...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="w-full overflow-hidden rounded-2xl border-2 border-muted avocodos-transition hover:border-primary/25">
        <div className="overflow-hidden rounded-t-xl">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="h-64 w-full object-cover"
          />
        </div>
        <CardContent>
          <h4 className="mb-2 pt-6">{course.title}</h4>
          <p className="mb-4 text-foreground/80">{course.description}</p>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
            <Badge
              className="inline-flex flex-row items-center gap-2 text-base font-bold"
              variant={"light"}
            >
              <span className="inline-flex items-center gap-1">
                <DollarSign className="size-3.5" /> {course.price.toPrecision()}{" "}
                USD
              </span>
              /
              <span className="inline-flex items-center gap-1">
                <IndianRupee className="mt-0.5 size-3.5" />{" "}
                {USDToINR(course.price).toFixed(0)} INR
              </span>
            </Badge>
            <Button
              variant="default"
              className="min-w-full text-sm md:min-w-[30%]"
              size={"sm"}
            >
              Enroll Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card className="w-full">
      <Skeleton className="h-64 w-full rounded-t-xl" />
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}
