import express from "express";
import { db } from "../scripts/firebaseAdmin.js";

const router = express.Router();

/**
 * Save plan
 */
router.post("/", async (req, res) => {
  try {
    const { userId, plan } = req.body;

    const docRef = await db.collection("The world").add({
      userId,
      plan,
      createdAt: new Date(),
    });

    res.json({ id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Save plan failed" });
  }
});

/**
 * Get my plans
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    const snapshot = await db
      .collection("The world")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Get plans failed" });
  }
});

export default router;