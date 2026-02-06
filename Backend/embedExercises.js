import "dotenv/config";
import { db } from "./firebaseAdmin.js";
import { embedBatch } from "./embed.js";

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function embedExercises() {
  const snapshot = await db.collection("exercises").get();
  console.log(`📦 Found ${snapshot.size} exercises`);

  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    data: doc.data()
  }));

  const BATCH_SIZE = 5;      // 🔥 เล็กไว้ก่อน
  const DELAY_MS = 40000;     // 🔥 4 วิ ต่อ batch

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);

    const texts = batch.map(({ data }) => `
Title: ${data.Title}
Body Part: ${data.BodyPart}
Equipment: ${data.Equipment}
Level: ${data.Level}
Type: ${data.Type}
Description: ${data.Desc}
`.trim());

    console.log(`🔄 Embedding batch ${i / BATCH_SIZE + 1}`);

    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const { id, data } = batch[j];

      await db.collection("exercise_vectors").doc(id).set({
        embedding: embeddings[j],
        text: texts[j],
        metadata: {
          title: data.Title,
          bodyPart: data.BodyPart,
          level: data.Level,
          type: data.Type
        },
        createdAt: new Date()
      });

      console.log("✅ Saved:", data.Title);
    }

    console.log(`⏸ Waiting ${DELAY_MS}ms...`);
    await sleep(DELAY_MS);
  }

  console.log("🎉 Done embedding all exercises");
}

embedExercises().catch(console.error);
