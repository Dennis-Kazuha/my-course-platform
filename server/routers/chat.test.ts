import { describe, it, expect, vi, beforeEach } from "vitest";
import { chatRouter } from "./chat";
import * as db from "../db";
import * as llm from "../_core/llm";

// Mock the database and LLM modules
vi.mock("../db", () => ({
  getChatHistory: vi.fn(),
  saveChatMessage: vi.fn(),
  getTranscriptsByLesson: vi.fn(),
}));

vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("chatRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHistory", () => {
    it("should fetch chat history for a lesson", async () => {
      const mockHistory = [
        {
          id: 1,
          userId: 1,
          lessonId: 1,
          role: "user",
          content: "What is HTML?",
          citations: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          lessonId: 1,
          role: "assistant",
          content: "HTML is a markup language...",
          citations: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getChatHistory).mockResolvedValue(mockHistory);

      const caller = chatRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.getHistory({ lessonId: 1 });

      expect(result).toEqual(mockHistory);
      expect(db.getChatHistory).toHaveBeenCalledWith(1, 1);
    });

    it("should return empty array if no history", async () => {
      vi.mocked(db.getChatHistory).mockResolvedValue([]);

      const caller = chatRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.getHistory({ lessonId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("should send a message and get AI response", async () => {
      const mockTranscripts = [
        {
          id: 1,
          lessonId: 1,
          startTime: 0,
          endTime: 30000,
          text: "Welcome to HTML basics",
          speaker: "Instructor",
          order: 1,
        },
        {
          id: 2,
          lessonId: 1,
          startTime: 30000,
          endTime: 60000,
          text: "HTML stands for HyperText Markup Language",
          speaker: "Instructor",
          order: 2,
        },
      ];

      const mockLLMResponse = {
        choices: [
          {
            message: {
              content:
                "HTML is a markup language. The instructor explains this at [00:30].",
            },
          },
        ],
      };

      vi.mocked(db.getTranscriptsByLesson).mockResolvedValue(mockTranscripts);
      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse);
      vi.mocked(db.saveChatMessage).mockResolvedValue(undefined);

      const caller = chatRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.sendMessage({
        lessonId: 1,
        message: "What is HTML?",
      });

      expect(result.message).toContain("HTML is a markup language");
      expect(db.saveChatMessage).toHaveBeenCalledTimes(2); // Once for user, once for assistant
      expect(llm.invokeLLM).toHaveBeenCalled();
    });

    it("should extract citations from response", async () => {
      const mockTranscripts = [
        {
          id: 1,
          lessonId: 1,
          startTime: 0,
          endTime: 30000,
          text: "Welcome to the lesson",
          speaker: "Instructor",
          order: 1,
        },
        {
          id: 2,
          lessonId: 1,
          startTime: 30000,
          endTime: 60000,
          text: "This is the main concept",
          speaker: "Instructor",
          order: 2,
        },
      ];

      const mockLLMResponse = {
        choices: [
          {
            message: {
              content:
                "The main concept is explained at [00:30] in the video.",
            },
          },
        ],
      };

      vi.mocked(db.getTranscriptsByLesson).mockResolvedValue(mockTranscripts);
      vi.mocked(llm.invokeLLM).mockResolvedValue(mockLLMResponse);
      vi.mocked(db.saveChatMessage).mockResolvedValue(undefined);

      const caller = chatRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      const result = await caller.sendMessage({
        lessonId: 1,
        message: "What is the main concept?",
      });

      expect(result.citations).toBeDefined();
      expect(result.citations?.length).toBeGreaterThan(0);
      expect(result.citations?.[0]?.timestamp).toBe("00:30");
    });

    it("should handle LLM errors gracefully", async () => {
      const mockTranscripts = [
        {
          id: 1,
          lessonId: 1,
          startTime: 0,
          endTime: 30000,
          text: "Welcome",
          speaker: "Instructor",
          order: 1,
        },
      ];

      vi.mocked(db.getTranscriptsByLesson).mockResolvedValue(mockTranscripts);
      vi.mocked(llm.invokeLLM).mockRejectedValue(
        new Error("LLM service unavailable")
      );

      const caller = chatRouter.createCaller({
        user: { id: 1, openId: "user-001", role: "user" },
      } as any);

      await expect(
        caller.sendMessage({
          lessonId: 1,
          message: "What is this about?",
        })
      ).rejects.toThrow();
    });
  });
});
