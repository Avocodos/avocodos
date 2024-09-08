import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { updateRewardProgress, getUserRewards } from "@/lib/rewards";

const redis = Redis.fromEnv();

export async function POST(req: NextRequest) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { courseId } = await req.json();

        // Try to get course from Redis cache
        let course = await redis.get(`course:${courseId}`);
        if (!course) {
            course = await prisma?.course.findUnique({
                where: { id: courseId },
            });
            if (course) {
                // Cache course data for 60 seconds
                await redis.set(`course:${courseId}`, JSON.stringify(course), { ex: 60 });
            }
        } else {
            course = JSON.parse(JSON.stringify(course));
        }

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Check for existing enrollment in Redis cache
        const enrollmentCacheKey = `enrollment:${user.id}:${courseId}`;
        let existingEnrollment = await redis.get(enrollmentCacheKey);

        if (existingEnrollment === null) {
            existingEnrollment = await prisma?.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId: courseId,
                    },
                },
            });
            // Cache the result (even if it's null) for 5 minutes
            await redis.set(enrollmentCacheKey, JSON.stringify(existingEnrollment), { ex: 300 });
        } else {
            existingEnrollment = JSON.parse(JSON.stringify(existingEnrollment));
        }

        if (existingEnrollment) {
            return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
        }

        const enrollment = await prisma?.enrollment.create({
            data: {
                userId: user.id,
                courseId: courseId,
            },
        });

        await prisma?.course.update({
            where: { id: courseId },
            data: {
                enrollmentCount: { increment: 1 },
            },
        });

        // Update reward progress
        await updateRewardProgress(user.id, 'ENROLLMENTS', 1);

        // Invalidate caches
        await redis.del(enrollmentCacheKey);
        await redis.del(`user:${user.id}:enrollments`);
        await redis.del(`course:${courseId}`);

        // Fetch updated rewards (this will use cache if available)
        const updatedRewards = await getUserRewards(user.id);

        return NextResponse.json({ enrollment, updatedRewards }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
