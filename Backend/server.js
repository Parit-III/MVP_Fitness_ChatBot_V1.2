import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message received." });
  }

  // 🔹 TEMP: simple response logic (replace with LLM later)
  const reply = `🤖 I received: "${message}"`;
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
