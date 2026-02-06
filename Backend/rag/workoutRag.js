import OpenAI from "openai";
import { buildWorkoutPrompt } from "./buildPrompt.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateWorkoutPlan({ user, exercises, days }) {
  const prompt = buildWorkoutPrompt({ user, exercises, days });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return response.choices[0].message.content;
}
