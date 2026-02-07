import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Exercise } from "../components/ExercisePlans";

export async function getExercises(): Promise<Exercise[]> {
  const snapshot = await getDocs(collection(db, "exercises"));

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.title ?? "Unknown Exercise",
      sets: 3,
      reps: "8-12",
      calories: 60,
      description: extractDescription(data.text),
      instructions: [
        `Body part: ${data.bodyPart ?? "N/A"}`,
        `Equipment: ${data.equipment ?? "N/A"}`
      ],
      tips: [
        `Level: ${data.level ?? "N/A"}`,
        `Type: ${data.type ?? "Strength"}` // fallback สมเหตุสมผล
      ]
    };
  });
}
function extractDescription(text?: string): string {
  if (!text) return "";

  const match = text.match(/Description:\s*(.*?)\s*(Type:|Body Part:|Equipment:|Level:|$)/i);
  return match ? match[1].trim() : "";
}

