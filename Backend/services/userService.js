import { db } from "../firebase.js";

export async function getUser(uid) {
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) throw new Error("User not found");
  return doc.data();
}
