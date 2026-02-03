// scripts/embedExercises.js
import dotenv from "dotenv";
import OpenAI from "openai";
import { getDocs, collection, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function exerciseToText(ex) {
  return `
Exercise: ${ex.Title}
Body part: ${ex.BodyPart}
Equipment: ${ex.Equipment}
Level: ${ex.Level}
Type: ${ex.Type}
Description: ${ex.Desc}
`;
}

async function embedText(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return res.data[0].embedding;
}

async function run() {
  const snapshot = await getDocs(collection(db, "exercises"));

  for (const docSnap of snapshot.docs) {
    const ex = docSnap.data();
    const text = exerciseToText(ex);
    const embedding = await embedText(text);

    await setDoc(
      doc(db, "exercise_vectors", docSnap.id),
      { text, embedding }
    );

    console.log(`✅ Embedded: ${ex.Title}`);
  }

  console.log("🎉 All exercises embedded");
  process.exit(0);
}

run();
