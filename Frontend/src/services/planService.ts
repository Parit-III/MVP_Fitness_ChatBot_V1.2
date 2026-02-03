import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { ExercisePlan } from "../components/ExercisePlans";

export async function getPlans(): Promise<ExercisePlan[]> {
  const snapshot = await getDocs(collection(db, "plans"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ExercisePlan[];
}
// NOT USE RIGHT NOW