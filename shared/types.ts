/**
 * Firestore Data Types
 * These interfaces represent the structure of documents in Firestore collections
 */

export interface User {
  id: string; // Firestore document ID (matches Firebase Auth UID)
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin" | "instructor";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface Course {
  id: string; // Firestore document ID
  title: string;
  description: string | null;
  instructorId: string; // Reference to User document
  thumbnail: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string; // Firestore document ID
  courseId: string; // Reference to Course document
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string; // Firestore document ID
  chapterId: string; // Reference to Chapter document
  title: string;
  description: string | null;
  videoId: string; // Cloudflare Stream video ID
  duration: number | null; // in seconds
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transcript {
  id: string; // Firestore document ID
  lessonId: string; // Reference to Lesson document
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  text: string;
  speaker: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string; // Firestore document ID
  userId: string; // Reference to User document
  lessonId: string; // Reference to Lesson document
  isCompleted: boolean;
  watchedDuration: number; // in seconds
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string; // Firestore document ID
  userId: string; // Reference to User document
  lessonId: string; // Reference to Lesson document
  role: "user" | "assistant";
  content: string;
  citations: Citation[] | null;
  createdAt: Date;
}

export interface Citation {
  timestamp: string; // "MM:SS" format
  text: string;
  transcriptId?: string; // Reference to Transcript document
}

export interface Embedding {
  id: string; // Firestore document ID
  transcriptId: string; // Reference to Transcript document
  vector: number[]; // Embedding vector
  metadata: {
    lessonId: string;
    startTime: number;
    endTime: number;
  };
  createdAt: Date;
}

export * from "./_core/errors";
