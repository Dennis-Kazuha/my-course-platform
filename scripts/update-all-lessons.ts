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

const CORRECT_VIDEO_ID = "f55e7a5b-8f43-4fc3-a994-9a2f34db12d5";

const CORRECT_TRANSCRIPTS = [
  { startTime: 0, endTime: 7000, text: "It is now starting my day at like 30 miles an hour instead of zero.", speaker: "Instructor", order: 1 },
  { startTime: 7000, endTime: 12000, text: "Whatever you're best at, you're probably better than AI.", speaker: "Instructor", order: 2 },
  { startTime: 12000, endTime: 20000, text: "So how do we use AI to help you with the other aspects of your job? Lots of the stuff AI is good at is the stuff you hate the most.", speaker: "Instructor", order: 3 },
  { startTime: 20000, endTime: 26000, text: "Managing your grocery list, your workout plan. Plan a trip to Hawaii. The AI will do that for you. Cool, finished, next task.", speaker: "Instructor", order: 4 },
  { startTime: 26000, endTime: 37000, text: "If you want creative work, then you want the AI to hallucinate. Whoa, didn't think of that.", speaker: "Instructor", order: 5 },
  { startTime: 37000, endTime: 44000, text: "We are actually going to generate a business plan. Five business ideas, 20 creative names. I could have done it at two o'clock in the morning. You do not have to be a coder.", speaker: "Instructor", order: 6 },
  { startTime: 44000, endTime: 59000, text: "My boss will make me cry if you don't answer. I'm not advocating that you threaten your AI bestie, but you got to do what you need to do to get it done.", speaker: "Instructor", order: 7 },
  { startTime: 59000, endTime: 63000, text: "We're now in the AI age. Let's buckle down and figure out what that means today.", speaker: "Instructor", order: 8 },
  { startTime: 63000, endTime: 64000, text: "I'm Manuel Sensini.", speaker: "Manuel Sensini", order: 9 },
  { startTime: 64000, endTime: 65000, text: "I'm Don Allen III.", speaker: "Don Allen III", order: 10 },
  { startTime: 65000, endTime: 66000, text: "I'm Allie K. Miller.", speaker: "Allie K. Miller", order: 11 },
  { startTime: 66000, endTime: 70000, text: "I'm Ethan Mollick, and this is MasterClass.", speaker: "Ethan Mollick", order: 12 },
];

async function updateAllLessons() {
  console.log("🔄 更新所有 'What is Generative AI?' 課程...\n");

  // 找到所有名為 "What is Generative AI?" 的課程
  const lessonsSnapshot = await db
    .collection("lessons")
    .where("title", "==", "What is Generative AI?")
    .get();

  console.log(`📚 找到 ${lessonsSnapshot.size} 個課程需要更新\n`);

  for (const lessonDoc of lessonsSnapshot.docs) {
    const lessonId = lessonDoc.id;
    console.log(`處理課程: ${lessonId}`);

    // 1. 更新 videoId
    await db.collection("lessons").doc(lessonId).update({
      videoId: CORRECT_VIDEO_ID,
      duration: 70,
      updatedAt: new Date(),
    });
    console.log(`   ✓ 更新 videoId`);

    // 2. 刪除舊逐字稿
    const oldTranscripts = await db
      .collection("transcripts")
      .where("lessonId", "==", lessonId)
      .get();

    for (const doc of oldTranscripts.docs) {
      await doc.ref.delete();
    }
    console.log(`   ✓ 刪除 ${oldTranscripts.size} 筆舊逐字稿`);

    // 3. 新增正確逐字稿
    for (const segment of CORRECT_TRANSCRIPTS) {
      await db.collection("transcripts").add({
        lessonId: lessonId,
        ...segment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`   ✓ 新增 ${CORRECT_TRANSCRIPTS.length} 筆逐字稿`);
    console.log();
  }

  console.log("✅ 全部更新完成！請重新整理網頁。");
}

updateAllLessons().then(() => process.exit(0));
