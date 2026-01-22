import "dotenv/config";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

async function checkData() {
  console.log("🔍 檢查資料庫數據...\n");

  // 1. 找到課程
  const lessonsSnapshot = await db
    .collection("lessons")
    .where("title", "==", "What is Generative AI?")
    .get();

  if (lessonsSnapshot.empty) {
    console.log("❌ 找不到課程");
    return;
  }

  const lessonDoc = lessonsSnapshot.docs[0];
  const lessonId = lessonDoc.id;
  const lessonData = lessonDoc.data();

  console.log("📚 課程資料:");
  console.log(`   ID: ${lessonId}`);
  console.log(`   Title: ${lessonData.title}`);
  console.log(`   VideoId: ${lessonData.videoId}`);
  console.log(`   Duration: ${lessonData.duration}`);
  console.log();

  // 2. 檢查逐字稿
  const transcriptsSnapshot = await db
    .collection("transcripts")
    .where("lessonId", "==", lessonId)
    .orderBy("order", "asc")
    .get();

  console.log(`📝 逐字稿數量: ${transcriptsSnapshot.size}`);
  console.log();

  if (transcriptsSnapshot.size > 0) {
    console.log("逐字稿內容:");
    transcriptsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const startSec = Math.floor(data.startTime / 1000);
      const mins = Math.floor(startSec / 60);
      const secs = startSec % 60;
      const time = `${mins}:${String(secs).padStart(2, '0')}`;
      console.log(`   ${index + 1}. [${time}] ${data.text.substring(0, 50)}...`);
    });
  }

  // 3. 驗證 Bunny URL
  const LIBRARY_ID = '580881';
  const videoUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${lessonData.videoId}`;
  console.log();
  console.log("🎬 Bunny Embed URL:");
  console.log(`   ${videoUrl}`);
  console.log();
  console.log("請在瀏覽器中直接打開此 URL 測試影片是否可播放");
}

checkData().then(() => process.exit(0));
