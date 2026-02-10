import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "@huggingface/transformers";
import cliProgress from "cli-progress"; // ✅ Added for the progress bar

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, "Temp.json"); 

async function runEmbedding() { // ✅ Renamed from 'process' to avoid global conflict
  console.log("⏳ Loading local model (all-MiniLM-L6-v2)...");
  
  const extractor = await pipeline("feature-extraction", MODEL);

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: Could not find ${jsonPath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const updated = [];
  
  console.log(`🚀 Starting embedding for ${data.length} items...`);

  // ✅ Initialize Progress Bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Progress | {bar} | {percentage}% | {value}/{total} Items | {title}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);

  progressBar.start(data.length, 0, { title: "Initializing..." });

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // Update progress bar label
    progressBar.update(i, { title: (item.Title || "Item").slice(0, 20) });
    
    try {
      const textToEmbed = `${item.Title} ${item.Desc}`;
      const output = await extractor(textToEmbed, { 
        pooling: "mean", 
        normalize: true 
      });

      item.embedding = Array.from(output.data);
      updated.push(item);
    } catch (e) {
      progressBar.stop(); // Stop bar to show error clearly
      console.error(`\n❌ Failed for ${item.Title}:`, e.message);
      progressBar.start(data.length, i); // Resume
    }
  }

  progressBar.update(data.length, { title: "Complete!" });
  progressBar.stop();

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2));
  console.log("\n✅ Done! Temp.json has been updated with 384-dimension vectors.");
}

runEmbedding();