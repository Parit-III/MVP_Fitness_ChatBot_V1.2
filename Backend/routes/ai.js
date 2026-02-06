import "dotenv/config";
import express from "express";
import axios from "axios";

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

/* ========================= */
/* ===== GENERATE PLAN ===== */
/* ========================= */
router.post("/plan", async (req, res) => {
  const { age, weight, height, goal, injury, time } = req.body;

  //const topExercises = getRelevantContext(userGoalVector, 3);

  // const contextText = topExercises.map(ex => 
  //   `- ${ex.Title}: ${ex.Desc} (Equipment: ${ex.Equipment})`
  // ).join("\n");

  //-Use the following high-quality exercise data to build the plan:${contextText}
  const prompt = `
You are a professional personal trainer.
You are creating a workout plan (5 days Monday-Friday).
STRICT RULES:
- Make a workout plan that suit user need
- Match exercises to the user's goal
- If user wants to avoid a body part, replace with other muscle groups or cardio
- Return ONLY valid JSON (Very Important)
- English only
- No explanation text

User's Information:
- age: ${age}
- weight: ${weight} kg
- height: ${height} cm
- goal: ${goal}
- injury: ${injury || "None"}
- free time: ${time} minute/day

OUTPUT FORMAT EXACTLY JSON:
{
  "days": [
    {
      "day": "Day 1",
      "exercises": [
        { "name": "Squat", "sets": 3, "reps": 12 }
      ]
    }
  ]
}
`;

  try {
    const content = await groq([
      { role: "system", content: "คุณเป็นเทรนเนอร์ฟิตเนสระดับมืออาชีพ" },
      { role: "user", content: prompt }
    ]);

    const plan = JSON.parse(content);
    res.json({ plan });

  } catch (err) {
    console.error(err.message);
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
    ], 300);

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
  const { currentPlan, instruction } = req.body;

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
        { "name": "Exercise", "sets": 3, "reps": 12 }
      ]
    }
  ]
}
`;

  try {
    const content = await groq([
      { role: "system", content: "Workout plan editor (JSON only)" },
      { role: "user", content: prompt }
    ]);

    const plan = JSON.parse(content);
    res.json({ plan });
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});


export default router;
