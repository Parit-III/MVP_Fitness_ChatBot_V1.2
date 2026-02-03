import OpenAI from "openai";
import { db } from "./firebaseAdmin.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function embedText(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function run() {
  const snapshot = await db.collection("exercises").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const text = `
Title: ${data.Title}
BodyPart: ${data.BodyPart}
Equipment: ${data.Equipment}
Level: ${data.Level}
Description: ${data.Desc}
`;

    const embedding = await embedText(text);

    await doc.ref.update({
      embedding,
      embeddedAt: new Date(),
    });

    console.log("Embedded:", data.Title);
  }

  console.log("✅ DONE embedding all exercises");
}

run();
