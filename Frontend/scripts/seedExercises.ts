import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseNode";
import exercises from "../data/Exe.json";

async function seedExercises() {
  for (const ex of exercises) {
    await addDoc(collection(db, "exercises"), ex);
  }
  console.log("Exercises seeded");
}

seedExercises();
