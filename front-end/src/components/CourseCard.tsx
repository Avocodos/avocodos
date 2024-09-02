import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";

interface CourseCardProps {
  title: string;
  description: string;
  imgSrc: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  imgSrc
}) => {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl bg-card avocodos-transition avocodos-shadow-lg">
        <img
          src={imgSrc}
          alt="Course Image"
          width={600}
          height={400}
          className="h-64 w-full object-cover"
          style={{ aspectRatio: "600/400", objectFit: "cover" }}
        />
        <div className="space-y-2 p-6 md:p-8">
          <h4>{title}</h4>
          <p className="text-foreground/80">{description}</p>
          <div className="!mt-8 flex items-center justify-between">
            <span className="text-lg font-bold">$9.99 / ₹800</span>
            <Button variant={"default"} size={"lg"}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
