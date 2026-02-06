import "dotenv/config";
import axios from "axios";
console.log("🔑 OPENAI_API_KEY =", process.env.OPENAI_API_KEY);
export async function embedBatch(texts) {
  const res = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      model: "text-embedding-3-small",
      input: texts,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data.map(d => d.embedding);
}

// ✅ เพิ่มตัวนี้
export async function embedText(text) {
  const [embedding] = await embedBatch([text]);
  return embedding;
}
