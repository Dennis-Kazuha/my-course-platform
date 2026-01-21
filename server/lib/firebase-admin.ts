import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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

export const adminDb = getFirestore();
export const adminAuth = getAuth();
