import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Exercise } from "../components/ExercisePlans";

export async function getExercises(): Promise<Exercise[]> {
  const snapshot = await getDocs(collection(db, "exercises"));

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.Title,
      sets: 3,                 // default ไปก่อน
      reps: "8-12",             // default
      calories: 60,             // default
      description: data.Desc,
      instructions: [
        `Body part: ${data.BodyPart}`,
        `Equipment: ${data.Equipment}`
      ],
      tips: [
        `Level: ${data.Level}`,
        `Type: ${data.Type}`
      ]
    };
  });
}
