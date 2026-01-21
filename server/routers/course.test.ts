import { describe, it, expect, vi, beforeEach } from "vitest";
import { courseRouter } from "./course";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getCourseWithChapters: vi.fn(),
  getChapterWithLessons: vi.fn(),
  getLessonWithTranscripts: vi.fn(),
  getUserProgress: vi.fn(),
  getCourseProgress: vi.fn(),
  updateUserProgress: vi.fn(),
}));

describe("courseRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCourse", () => {
    it("should fetch a course with chapters", async () => {
      const mockCourse = {
        id: 1,
        title: "Test Course",
        description: "A test course",
        instructorId: 1,
        chapters: [
          {
            id: 1,
            courseId: 1,
            title: "Chapter 1",
            lessons: [],
          },
        ],
      };

      vi.mocked(db.getCourseWithChapters).mockResolvedValue(mockCourse);

      const caller = courseRouter.createCaller({});
      const result = await caller.getCourse({ courseId: 1 });

      expect(result).toEqual(mockCourse);
      expect(db.getCourseWithChapters).toHaveBeenCalledWith(1);
    });

    it("should return null if course not found", async () => {
      vi.mocked(db.getCourseWithChapters).mockResolvedValue(null);

      const caller = courseRouter.createCaller({});
      const result = await caller.getCourse({ courseId: 999 });

      expect(result).toBeNull();
    });
  });

  describe("getLesson", () => {
    it("should fetch a lesson with transcripts", async () => {
      const mockLesson = {
        id: 1,
        chapterId: 1,
        title: "Lesson 1",
        videoId: "video-001",
        duration: 600,
        transcripts: [
          {
            id: 1,
            lessonId: 1,
            startTime: 0,
            endTime: 30000,
            text: "Welcome to the lesson",
            speaker: "Instructor",
          },
        ],
      };

      vi.mocked(db.getLessonWithTranscripts).mockResolvedValue(mockLesson);

      const caller = courseRouter.createCaller({});
      const result = await caller.getLesson({ lessonId: 1 });

      expect(result).toEqual(mockLesson);
      expect(result?.transcripts).toHaveLength(1);
      expect(db.getLessonWithTranscripts).toHaveBeenCalledWith(1);
    });
  });

  describe("getUserLessonProgress", () => {
    it("should fetch user progress for a lesson", async () => {
      const mockProgress = {
        id: 1,
        userId: 1,
        lessonId: 1,
        isCompleted: false,
        watchedDuration: 300,
        completedAt: null,
      };

      vi.mocked(db.getUserProgress).mockResolvedValue(mockProgress);

      const caller = courseRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.getUserLessonProgress({ lessonId: 1 });

      expect(result).toEqual(mockProgress);
      expect(db.getUserProgress).toHaveBeenCalledWith(1, 1);
    });

    it("should return null if no progress found", async () => {
      vi.mocked(db.getUserProgress).mockResolvedValue(null);

      const caller = courseRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.getUserLessonProgress({ lessonId: 1 });

      expect(result).toBeNull();
    });
  });

  describe("getCourseProgressForUser", () => {
    it("should fetch overall course progress", async () => {
      const mockProgress = { total: 5, completed: 2 };

      vi.mocked(db.getCourseProgress).mockResolvedValue(mockProgress);

      const caller = courseRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.getCourseProgressForUser({ courseId: 1 });

      expect(result).toEqual(mockProgress);
      expect(db.getCourseProgress).toHaveBeenCalledWith(1, 1);
    });
  });

  describe("updateLessonProgress", () => {
    it("should update lesson progress", async () => {
      vi.mocked(db.getUserProgress).mockResolvedValue(null);
      vi.mocked(db.updateUserProgress).mockResolvedValue(undefined);

      const caller = courseRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      await caller.updateLessonProgress({
        lessonId: 1,
        isCompleted: true,
        watchedDuration: 600,
      });

      expect(db.updateUserProgress).toHaveBeenCalledWith(1, 1, true, 600);
    });

    it("should preserve existing progress if not specified", async () => {
      const existingProgress = {
        id: 1,
        userId: 1,
        lessonId: 1,
        isCompleted: true,
        watchedDuration: 400,
        completedAt: new Date(),
      };

      vi.mocked(db.getUserProgress).mockResolvedValue(existingProgress);
      vi.mocked(db.updateUserProgress).mockResolvedValue(undefined);

      const caller = courseRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      await caller.updateLessonProgress({
        lessonId: 1,
        watchedDuration: 500,
      });

      expect(db.updateUserProgress).toHaveBeenCalledWith(1, 1, true, 500);
    });
  });
});
