import express from "express";
import axios from "axios";
import { db } from "../scripts/firebaseAdmin.js";

console.log("✅ ai.js loaded");
console.log("GROQ_API_KEY =", process.env.GROQ_API_KEY);


const router = express.Router();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

const groq = async (messages, max_tokens = 900) => {
  const res = await axios.post(
    GROQ_URL,
    {
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message.content;
};

function extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
}

async function getExercisesFromDB() {
  const snapshot = await db.collection("exercises").get();

  return snapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.Title,
      bodyPart: d.BodyPart,
      equipment: d.Equipment,
      level: d.Level
    };
  });
}

/* ========================= */
/* ===== GENERATE PLAN ===== */
/* ========================= */
router.post("/plan", async (req, res) => {
  const { age, weight, height, goal } = req.body;

  try {
    const exercises = await getExercisesFromDB();

    const exerciseList = exercises
      .map(e => `- ${e.name} (${e.bodyPart}, ${e.level}) [id:${e.id}]`)
      .join("\n");

    const prompt = `
You are a professional personal trainer.

AVAILABLE EXERCISES:
${exerciseList}

RULES:
- Use ONLY exercises from the list
- Return ONLY JSON
- Use exerciseId from the list
- English only

User:
- age: ${age}
- weight: ${weight}
- height: ${height}
- goal: ${goal}

OUTPUT FORMAT:
{
  "days": [
    {
      "day": "Day 1",
      "exercises": [
        { "exerciseId": "abc123", "sets": 3, "reps": 12 }
      ]
    }
  ]
}
`;

    const content = await groq([
      { role: "system", content: "Workout plan generator (JSON only)" },
      { role: "user", content: prompt }
    ]);

    const plan = extractJSON(content);
    res.json({ plan });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Plan generation failed" });
  }
});


/* ===================== */
/* ===== CHAT ======== */
/* ===================== */
router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  console.log("📩 /chat called");
  console.log("MESSAGES:", messages);

  try {
    const reply = await groq([
      {
        role: "system",
        content: `
You are FitPro AI Coach, a friendly and professional fitness assistant.

Rules:
- Do NOT repeat onboarding questions if the user already answered them
- If user mentions a goal (lose weight, build muscle, endurance), remember it
- Ask ONE clear follow-up question only when needed
- Give short, practical advice (no essays)
- Be conversational and motivating
- Do NOT restart the conversation
`
      },
      ...(messages || [])
    ], 1500);

    res.json({ reply });

  } catch (err) {
    console.error("❌ GROQ CHAT ERROR");
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Chat failed" });
  }
});




/* ========================= */
/* ===== UPDATE PLAN ======= */
/* ========================= */
router.post("/update-plan", async (req, res) => {
  try {
  const { currentPlan, instruction } = req.body;
  const exercises = await getExercisesFromDB();
  const exerciseList = exercises
    .map(e => `- ${e.name} (${e.bodyPart}, ${e.level}) [id:${e.id}]`)
    .join("\n");


  const prompt = `
You are updating a workout plan.
You are a professional personal trainer.
STRICT RULES:
- Never remove all exercises from a day
- If an exercise is removed, REPLACE it with a suitable alternative
- Keep at least 2–4 exercises per day
- Match replacement exercises to the user's goal
- If user wants to avoid a body part, replace with other muscle groups or cardio
- Return ONLY valid JSON
- Same structure as input
- English only
- No explanation text

CURRENT PLAN:
${JSON.stringify(currentPlan)}

USER REQUEST:
"${instruction}"

OUTPUT FORMAT EXACTLY:
{
  "days": [
    {
      "day": "Day 1",
      "exercises": [
        { "exerciseId": "abc123", "sets": 3, "reps": 12 }
      ]
    }
  ]
}
AVAILABLE EXERCISES:
${exerciseList}

RULE:
- Use ONLY exerciseId from the list
`;

  
    const content = await groq([
      { role: "system", content: "Workout plan editor (JSON only)" },
      { role: "user", content: prompt }
    ]);

    const plan = extractJSON(content);
    res.json({ plan });
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});


export default router;
