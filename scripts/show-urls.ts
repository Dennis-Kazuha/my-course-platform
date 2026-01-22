import "dotenv/config";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  initializeApp({
    credential: serviceAccountKey
      ? cert(serviceAccountKey)
      : applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

async function showUrls() {
  console.log("📋 所有課程 URL:\n");

  // 獲取所有課程
  const coursesSnapshot = await db.collection("courses").get();

  for (const courseDoc of coursesSnapshot.docs) {
    const courseData = courseDoc.data();
    console.log(`📚 課程: ${courseData.title}`);
    console.log(`   Course ID: ${courseDoc.id}`);
    console.log();

    // 獲取該課程的所有章節
    const chaptersSnapshot = await db
      .collection("chapters")
      .where("courseId", "==", courseDoc.id)
      .orderBy("order", "asc")
      .get();

    for (const chapterDoc of chaptersSnapshot.docs) {
      const chapterData = chapterDoc.data();
      console.log(`   📖 ${chapterData.title}`);

      // 獲取該章節的所有課程
      const lessonsSnapshot = await db
        .collection("lessons")
        .where("chapterId", "==", chapterDoc.id)
        .orderBy("order", "asc")
        .get();

      for (const lessonDoc of lessonsSnapshot.docs) {
        const lessonData = lessonDoc.data();
        const url = `/course/${courseDoc.id}/lesson/${lessonDoc.id}`;
        console.log(`      🎬 ${lessonData.title}`);
        console.log(`         URL: ${url}`);
        console.log(`         VideoId: ${lessonData.videoId}`);
      }
      console.log();
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("請使用上面的 URL 訪問正確的課程頁面");
  console.log("例如: http://localhost:5173/course/COURSE_ID/lesson/LESSON_ID");
}

showUrls().then(() => process.exit(0));
