import fs from "fs";
import axios from "axios";

const exercises = JSON.parse(fs.readFileSync("../data/Exe.json", "utf8"));

async function process() {
  const updated = [];
  for (let ex of exercises) {
    console.log(`Embedding: ${ex.Title}`);
    try {
      // Call your Python service (ensure it's running!)
      const res = await axios.post("http://localhost:5001/embed", { 
        text: `${ex.Title} ${ex.Desc}` 
      });
      ex.embedding = res.data.vector;
      updated.push(ex);
    } catch (e) {
      console.error("Failed for", ex.Title);
    }
  }
  fs.writeFileSync("../data/Exe.json", JSON.stringify(updated, null, 2));
  console.log("✅ Done! 1,000 exercises now have vectors.");
}

process();