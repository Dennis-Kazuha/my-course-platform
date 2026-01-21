import { adminDb } from "./lib/firebase-admin";
import type {
  User,
  Course,
  Chapter,
  Lesson,
  Transcript,
  UserProgress,
  ChatMessage,
} from "../shared/types";

/**
 * Firestore Database Helpers
 * These functions handle all database operations using Firebase Admin SDK
 */

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserByOpenId(openId: string): Promise<User | null> {
  try {
    const snapshot = await adminDb
      .collection("users")
      .where("openId", "==", openId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      openId: data.openId,
      name: data.name || null,
      email: data.email || null,
      loginMethod: data.loginMethod || null,
      role: data.role || "user",
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      lastSignedIn: data.lastSignedIn?.toDate?.() || new Date(),
    } as User;
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error);
    throw error;
  }
}

export async function upsertUser(user: Partial<User> & { openId: string }): Promise<void> {
  try {
    if (!user.openId) {
      throw new Error("User openId is required for upsert");
    }

    const snapshot = await adminDb
      .collection("users")
      .where("openId", "==", user.openId)
      .limit(1)
      .get();

    const userData = {
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      loginMethod: user.loginMethod || null,
      role: user.role || "user",
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn || new Date(),
    };

    if (snapshot.empty) {
      // Create new user
      await adminDb.collection("users").add({
        ...userData,
        createdAt: new Date(),
      });
    } else {
      // Update existing user
      const existingDoc = snapshot.docs[0];
      await existingDoc.ref.update(userData);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

export async function getCourseWithChapters(courseId: string): Promise<
  (Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null
> {
  try {
    const courseSnap = await adminDb.collection("courses").doc(courseId).get();

    if (!courseSnap.exists) {
      return null;
    }

    const courseData = {
      id: courseSnap.id,
      ...courseSnap.data(),
      createdAt: courseSnap.data()?.createdAt?.toDate?.() || new Date(),
      updatedAt: courseSnap.data()?.updatedAt?.toDate?.() || new Date(),
    } as Course;

    // Fetch chapters
    const chaptersSnap = await adminDb
      .collection("chapters")
      .where("courseId", "==", courseId)
      .orderBy("order", "asc")
      .get();

    const chapters = await Promise.all(
      chaptersSnap.docs.map(async (chapterDoc) => {
        const chapterData = {
          id: chapterDoc.id,
          ...chapterDoc.data(),
          createdAt: chapterDoc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: chapterDoc.data().updatedAt?.toDate?.() || new Date(),
        } as Chapter;

        // Fetch lessons for this chapter
        const lessonsSnap = await adminDb
          .collection("lessons")
          .where("chapterId", "==", chapterDoc.id)
          .orderBy("order", "asc")
          .get();

        const lessons = lessonsSnap.docs.map((lessonDoc) => ({
          id: lessonDoc.id,
          ...lessonDoc.data(),
          createdAt: lessonDoc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: lessonDoc.data().updatedAt?.toDate?.() || new Date(),
        })) as Lesson[];

        return { ...chapterData, lessons };
      })
    );

    return { ...courseData, chapters };
  } catch (error) {
    console.error("[Database] Failed to get course with chapters:", error);
    throw error;
  }
}

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

export async function getLessonWithTranscripts(lessonId: string): Promise<
  (Lesson & { transcripts: Transcript[] }) | null
> {
  try {
    const lessonSnap = await adminDb.collection("lessons").doc(lessonId).get();

    if (!lessonSnap.exists) {
      return null;
    }

    const lessonData = {
      id: lessonSnap.id,
      ...lessonSnap.data(),
      createdAt: lessonSnap.data()?.createdAt?.toDate?.() || new Date(),
      updatedAt: lessonSnap.data()?.updatedAt?.toDate?.() || new Date(),
    } as Lesson;

    // Fetch transcripts
    const transcriptsSnap = await adminDb
      .collection("transcripts")
      .where("lessonId", "==", lessonId)
      .orderBy("order", "asc")
      .get();

    const transcripts = transcriptsSnap.docs.map((transcriptDoc) => ({
      id: transcriptDoc.id,
      ...transcriptDoc.data(),
      createdAt: transcriptDoc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: transcriptDoc.data().updatedAt?.toDate?.() || new Date(),
    })) as Transcript[];

    return { ...lessonData, transcripts };
  } catch (error) {
    console.error("[Database] Failed to get lesson with transcripts:", error);
    throw error;
  }
}

// ============================================================================
// TRANSCRIPT OPERATIONS
// ============================================================================

export async function getTranscriptsByLesson(lessonId: string): Promise<Transcript[]> {
  try {
    const snapshot = await adminDb
      .collection("transcripts")
      .where("lessonId", "==", lessonId)
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Transcript[];
  } catch (error) {
    console.error("[Database] Failed to get transcripts:", error);
    throw error;
  }
}

// ============================================================================
// PROGRESS OPERATIONS
// ============================================================================

export async function getUserProgress(
  userId: string,
  lessonId: string
): Promise<UserProgress | null> {
  try {
    const snapshot = await adminDb
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      completedAt: doc.data().completedAt?.toDate?.() || null,
    } as UserProgress;
  } catch (error) {
    console.error("[Database] Failed to get user progress:", error);
    throw error;
  }
}

export async function getCourseProgress(
  courseId: string,
  userId: string
): Promise<{ total: number; completed: number }> {
  try {
    // Get all lessons in the course
    const chaptersSnap = await adminDb
      .collection("chapters")
      .where("courseId", "==", courseId)
      .get();

    let totalLessons = 0;
    let completedLessons = 0;

    for (const chapterDoc of chaptersSnap.docs) {
      const lessonsSnap = await adminDb
        .collection("lessons")
        .where("chapterId", "==", chapterDoc.id)
        .get();

      totalLessons += lessonsSnap.size;

      // Check progress for each lesson
      for (const lessonDoc of lessonsSnap.docs) {
        const progress = await getUserProgress(userId, lessonDoc.id);
        if (progress?.isCompleted) {
          completedLessons++;
        }
      }
    }

    return { total: totalLessons, completed: completedLessons };
  } catch (error) {
    console.error("[Database] Failed to get course progress:", error);
    throw error;
  }
}

export async function updateUserProgress(
  userId: string,
  lessonId: string,
  isCompleted?: boolean,
  watchedDuration?: number
): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId)
      .limit(1)
      .get();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    if (watchedDuration !== undefined) {
      updateData.watchedDuration = watchedDuration;
    }

    if (snapshot.empty) {
      // Create new progress record
      await adminDb.collection("userProgress").add({
        userId,
        lessonId,
        isCompleted: isCompleted ?? false,
        watchedDuration: watchedDuration ?? 0,
        completedAt: null,
        createdAt: new Date(),
        ...updateData,
      });
    } else {
      // Update existing progress
      const existingDoc = snapshot.docs[0];
      await existingDoc.ref.update(updateData);
    }
  } catch (error) {
    console.error("[Database] Failed to update user progress:", error);
    throw error;
  }
}

// ============================================================================
// CHAT OPERATIONS
// ============================================================================

export async function getChatHistory(userId: string, lessonId: string): Promise<ChatMessage[]> {
  try {
    const snapshot = await adminDb
      .collection("chatMessages")
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      citations: doc.data().citations || null,
    })) as ChatMessage[];
  } catch (error) {
    console.error("[Database] Failed to get chat history:", error);
    throw error;
  }
}

export async function saveChatMessage(message: Omit<ChatMessage, "id">): Promise<void> {
  try {
    await adminDb.collection("chatMessages").add({
      ...message,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to save chat message:", error);
    throw error;
  }
}
