import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { invokeLLM } from "../_core/llm";

export const chatRouter = router({
  /**
   * Get chat history for a lesson
   */
  getHistory: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input, ctx }) => {
      return db.getChatHistory(ctx.user.id, input.lessonId);
    }),

  /**
   * Send a message and get AI response with RAG
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Save user message
      await db.saveChatMessage({
        userId: ctx.user.id,
        lessonId: input.lessonId,
        role: "user",
        content: input.message,
        citations: null,
        createdAt: new Date(),
      });

      // Get transcript segments for context (simplified RAG)
      const transcripts = await db.getTranscriptsByLesson(input.lessonId);

      // Build context from transcripts
      const context = transcripts
        .map((t) => `[${formatTime(t.startTime)}-${formatTime(t.endTime)}] ${t.text}`)
        .join("\n");

      // Generate AI response using LLM
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI tutor helping students understand course content. 
            Answer questions based on the lesson transcript provided below. 
            When answering, reference specific timestamps from the transcript to help the student find the relevant content.
            
            Lesson Transcript:
            ${context}`,
          },
          {
            role: "user",
            content: input.message,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const assistantMessage =
        typeof content === "string" ? content : "I could not generate a response.";

      // Extract citations (timestamps) from the response
      const citations = extractCitations(transcripts, assistantMessage) || undefined;

      // Save assistant message with citations
      await db.saveChatMessage({
        userId: ctx.user.id,
        lessonId: input.lessonId,
        role: "assistant",
        content: assistantMessage,
        citations: citations || null,
        createdAt: new Date(),
      });

      return {
        message: assistantMessage,
        citations,
      };
    }),
});

/**
 * Format milliseconds to MM:SS format
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Extract timestamp citations from the AI response
 */
function extractCitations(
  transcripts: any[],
  response: string
): Array<{ timestamp: string; text: string }> | undefined {
  const citations: Array<{ timestamp: string; text: string }> = [];
  const timePattern = /\[(\d{2}:\d{2})\]/g;
  let match;

  while ((match = timePattern.exec(response)) !== null) {
    const timestamp = match[1];
    const [minutes, seconds] = timestamp.split(":").map(Number);
    const timeMs = (minutes * 60 + seconds) * 1000;

    // Find the transcript segment that matches this timestamp
    const segment = transcripts.find((t) => t.startTime <= timeMs && t.endTime >= timeMs);
    if (segment) {
      citations.push({
        timestamp,
        text: segment.text,
      });
    }
  }

  return citations.length > 0 ? citations : undefined;
}
