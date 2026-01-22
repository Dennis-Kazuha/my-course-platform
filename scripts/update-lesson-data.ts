import "dotenv/config";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * 更新課程資料腳本
 * 更新第一堂課的 videoId 和逐字稿
 *
 * Usage:
 *   npx tsx scripts/update-lesson-data.ts
 */

// Initialize Firebase Admin SDK
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

// 正確的 Bunny Stream Video ID
const CORRECT_VIDEO_ID = "f55e7a5b-8f43-4fc3-a994-9a2f34db12d5";

// 正確的逐字稿資料（時間單位為毫秒）
const CORRECT_TRANSCRIPTS = [
  {
    startTime: 0,
    endTime: 7000,
    text: "It is now starting my day at like 30 miles an hour instead of zero.",
    speaker: "Instructor",
    order: 1,
  },
  {
    startTime: 7000,
    endTime: 12000,
    text: "Whatever you're best at, you're probably better than AI.",
    speaker: "Instructor",
    order: 2,
  },
  {
    startTime: 12000,
    endTime: 20000,
    text: "So how do we use AI to help you with the other aspects of your job? Lots of the stuff AI is good at is the stuff you hate the most.",
    speaker: "Instructor",
    order: 3,
  },
  {
    startTime: 20000,
    endTime: 26000,
    text: "Managing your grocery list, your workout plan. Plan a trip to Hawaii. The AI will do that for you. Cool, finished, next task.",
    speaker: "Instructor",
    order: 4,
  },
  {
    startTime: 26000,
    endTime: 37000,
    text: "If you want creative work, then you want the AI to hallucinate. Whoa, didn't think of that.",
    speaker: "Instructor",
    order: 5,
  },
  {
    startTime: 37000,
    endTime: 44000,
    text: "We are actually going to generate a business plan. Five business ideas, 20 creative names. I could have done it at two o'clock in the morning. You do not have to be a coder.",
    speaker: "Instructor",
    order: 6,
  },
  {
    startTime: 44000,
    endTime: 59000,
    text: "My boss will make me cry if you don't answer. I'm not advocating that you threaten your AI bestie, but you got to do what you need to do to get it done.",
    speaker: "Instructor",
    order: 7,
  },
  {
    startTime: 59000,
    endTime: 63000,
    text: "We're now in the AI age. Let's buckle down and figure out what that means today.",
    speaker: "Instructor",
    order: 8,
  },
  {
    startTime: 63000,
    endTime: 64000,
    text: "I'm Manuel Sensini.",
    speaker: "Manuel Sensini",
    order: 9,
  },
  {
    startTime: 64000,
    endTime: 65000,
    text: "I'm Don Allen III.",
    speaker: "Don Allen III",
    order: 10,
  },
  {
    startTime: 65000,
    endTime: 66000,
    text: "I'm Allie K. Miller.",
    speaker: "Allie K. Miller",
    order: 11,
  },
  {
    startTime: 66000,
    endTime: 70000,
    text: "I'm Ethan Mollick, and this is MasterClass.",
    speaker: "Ethan Mollick",
    order: 12,
  },
];

async function updateLessonData() {
  console.log("🔄 開始更新課程資料...\n");

  try {
    // 1. 找到第一堂課 (What is Generative AI?)
    console.log("📚 尋找課程...");
    const lessonsSnapshot = await db
      .collection("lessons")
      .where("title", "==", "What is Generative AI?")
      .limit(1)
      .get();

    if (lessonsSnapshot.empty) {
      console.error("❌ 找不到課程 'What is Generative AI?'");
      console.log("請先執行 pnpm db:seed 建立初始資料");
      process.exit(1);
    }

    const lessonDoc = lessonsSnapshot.docs[0];
    const lessonId = lessonDoc.id;
    console.log(`✓ 找到課程: ${lessonId}\n`);

    // 2. 更新 lesson 的 videoId 和 duration
    console.log("🎬 更新影片 ID...");
    await db.collection("lessons").doc(lessonId).update({
      videoId: CORRECT_VIDEO_ID,
      duration: 70, // 70 秒
      updatedAt: new Date(),
    });
    console.log(`✓ videoId 已更新為: ${CORRECT_VIDEO_ID}\n`);

    // 3. 刪除舊的逐字稿
    console.log("🗑️ 刪除舊的逐字稿...");
    const oldTranscripts = await db
      .collection("transcripts")
      .where("lessonId", "==", lessonId)
      .get();

    const deletePromises = oldTranscripts.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`✓ 已刪除 ${oldTranscripts.size} 筆舊逐字稿\n`);

    // 4. 新增正確的逐字稿
    console.log("📝 新增正確的逐字稿...");
    for (const segment of CORRECT_TRANSCRIPTS) {
      await db.collection("transcripts").add({
        lessonId: lessonId,
        ...segment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`✓ 已新增 ${CORRECT_TRANSCRIPTS.length} 筆逐字稿\n`);

    console.log("✅ 更新完成！");
    console.log("\n請重新整理網頁查看結果。");
  } catch (error) {
    console.error("❌ 更新失敗:", error);
    process.exit(1);
  }
}

// 執行更新
updateLessonData().then(() => {
  process.exit(0);
});
