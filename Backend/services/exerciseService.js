import { db } from "../firebase.js";

export async function getExercises({ level, bodyPart, excludeEquipment = [] }) {
  let query = db.collection("exercises");

  if (level) query = query.where("level", "==", level);
  if (bodyPart) query = query.where("bodyPart", "==", bodyPart);

  const snapshot = await query.get();
  return snapshot.docs
    .map(doc => doc.data())
    .filter(ex => !excludeEquipment.includes(ex.equipment));
}
