import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_MESSAGING_SENDER_ID,
      privateKey: process.env.FIREBASE_APP_ID.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();
