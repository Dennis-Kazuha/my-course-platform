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

// Your Bunny CDN Video ID
const BUNNY_VIDEO_ID = "f55e7a5b-8f43-4fc3-a994-9a2f34db12d5";

async function updateVideoIds() {
  console.log("🔄 Updating video IDs in Firebase...\n");

  try {
    // Get all lessons
    const lessonsSnapshot = await db.collection("lessons").get();

    let updated = 0;
    for (const doc of lessonsSnapshot.docs) {
      await doc.ref.update({
        videoId: BUNNY_VIDEO_ID,
      });
      console.log(`✓ Updated lesson: ${doc.data().title}`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} lessons with Bunny video ID: ${BUNNY_VIDEO_ID}`);
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  }
}

updateVideoIds().then(() => {
  process.exit(0);
});
