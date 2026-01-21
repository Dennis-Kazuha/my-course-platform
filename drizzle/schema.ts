import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float, bigint } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "instructor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Courses table - represents a complete course with multiple chapters
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructorId: int("instructorId").notNull(),
  thumbnail: varchar("thumbnail", { length: 512 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Chapters table - groups lessons within a course
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * Lessons table - individual video lessons within chapters
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  chapterId: int("chapterId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoId: varchar("videoId", { length: 255 }).notNull(), // Cloudflare Stream video ID
  duration: int("duration"), // Duration in seconds
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Transcripts table - time-coded transcript segments for lessons
 */
export const transcripts = mysqlTable("transcripts", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  startTime: int("startTime").notNull(), // Start time in milliseconds
  endTime: int("endTime").notNull(), // End time in milliseconds
  text: text("text").notNull(), // Transcript text for this segment
  speaker: varchar("speaker", { length: 255 }), // Optional speaker name
  order: int("order").notNull(), // Order within lesson
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = typeof transcripts.$inferInsert;

/**
 * Embeddings table - stores vector embeddings for transcript segments (for RAG)
 */
export const embeddings = mysqlTable("embeddings", {
  id: int("id").autoincrement().primaryKey(),
  transcriptId: int("transcriptId").notNull(),
  vectorId: varchar("vectorId", { length: 255 }).notNull(), // Cloudflare Vectorize vector ID
  metadata: json("metadata"), // Store metadata like lessonId, startTime for quick lookup
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Embedding = typeof embeddings.$inferSelect;
export type InsertEmbedding = typeof embeddings.$inferInsert;

/**
 * User progress table - tracks which lessons users have completed
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  watchedDuration: int("watchedDuration").default(0).notNull(), // Watched duration in seconds
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Chat messages table - stores conversation history between users and AI tutor
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  citations: json("citations"), // Array of {transcriptId, startTime, endTime, text}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;