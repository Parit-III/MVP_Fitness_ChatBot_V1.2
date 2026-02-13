import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Exercise } from "../components/ExercisePlans";

export async function getExercises(): Promise<Exercise[]> {
  const snapshot = await getDocs(collection(db, "exercises"));

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      // Match the exact keys you pushed to Firebase
      Title: data.Title || "Unknown Exercise", 
      Desc: data.Desc || "",
      Type: data.Type || "Strength",
      BodyPart: data.BodyPart || "N/A",
      Equipment: data.Equipment || "N/A",
      Level: data.Level || "Intermediate",
      
      // Default values for workout logic
      sets: 3,
      reps: "8-12",
      calories: 60,
      instructions: data.instructions || [], // Use the instructions array if it exists
      tips: data.tips || []
    };
  });
}