import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function embedText(text) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return embedding.data[0].embedding;
}
