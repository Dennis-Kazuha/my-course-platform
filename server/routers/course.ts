import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const courseRouter = router({
  /**
   * Get course with all chapters and lessons
   * Public endpoint - no authentication required
   */
  getCourse: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      const course = await db.getCourseWithChapters(input.courseId);
      return course;
    }),

  /**
   * Get a specific lesson with transcripts
   * Public endpoint - no authentication required
   */
  getLesson: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      const lesson = await db.getLessonWithTranscripts(input.lessonId);
      return lesson;
    }),

  /**
   * Get user's progress for a specific lesson
   * Protected endpoint - requires authentication
   */
  getUserLessonProgress: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const progress = await db.getUserProgress(ctx.user.id, input.lessonId);
      return progress;
    }),

  /**
   * Get user's overall progress for a course
   * Protected endpoint - requires authentication
   */
  getCourseProgressForUser: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const progress = await db.getCourseProgress(input.courseId, ctx.user.id);
      return progress;
    }),

  /**
   * Update user's lesson progress
   * Protected endpoint - requires authentication
   */
  updateLessonProgress: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        isCompleted: z.boolean().optional(),
        watchedDuration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current progress to preserve existing values
      const currentProgress = await db.getUserProgress(ctx.user.id, input.lessonId);

      await db.updateUserProgress(
        ctx.user.id,
        input.lessonId,
        input.isCompleted ?? currentProgress?.isCompleted,
        input.watchedDuration ?? currentProgress?.watchedDuration
      );

      return { success: true };
    }),
});
