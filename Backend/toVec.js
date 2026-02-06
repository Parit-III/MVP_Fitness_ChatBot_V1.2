import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import admin from "firebase-admin";
import { fileURLToPath } from "url";

dotenv.config();

/* ---------- path setup (ESM safe) ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- helper ---------- */
function exerciseToText(ex) {
  return `
Title: ${ex.Title}
Description: ${ex.Desc}
Type: ${ex.Type}
Body Part: ${ex.BodyPart}
Equipment: ${ex.Equipment}
Level: ${ex.Level}
`;
}

/* ---------- OpenAI ---------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ---------- Firebase ---------- */
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(
      fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf-8")
    )
  )
});

const db = admin.firestore();

/* ---------- Load exercises.json ---------- */
const exercisesPath = path.join(__dirname, "exercises.json");
const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf-8"));

/* ---------- Embed + Store ---------- */
for (const ex of exercises) {
  const text = exerciseToText(ex);

  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  const embedding = embeddingRes.data[0].embedding;

  await db.collection("exercises").add({
    title: ex.Title,
    bodyPart: ex.BodyPart,
    level: ex.Level,
    equipment: ex.Equipment,
    text,
    embedding
  });

  console.log("✅ Embedded:", ex.Title);
}

console.log("🎉 All exercises embedded successfully");
