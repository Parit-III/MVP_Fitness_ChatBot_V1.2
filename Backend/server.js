import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoute from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://parit-iii.github.io",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

// ✅ AI (chat / plan / update-plan)
app.use("/api/ai", aiRoute);

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
