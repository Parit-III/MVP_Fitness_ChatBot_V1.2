import json
import os
from sentence_transformers import SentenceTransformer

# 1. Setup paths
input_file = '../data/Exe.json'
output_dir = '../data'
output_file = os.path.join(output_dir, 'exercises_with_vectors.json')

# Ensure the output directory exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f"Created directory: {output_dir}")

# 2. Load your JSON file
try:
    with open(input_file, 'r') as f:
        exercises = json.load(f)
    print(f"Successfully loaded {len(exercises)} exercises from {input_file}")
except FileNotFoundError:
    print(f"Error: {input_file} not found. Please check the file path.")
    exit()

# 3. Initialize the embedding model
print("Loading embedding model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# 4. Process and Embed
print("Starting vectorization...")
for index, item in enumerate(exercises):
    # Combine fields for rich context
    combined_text = (
        f"Exercise: {item.get('Title', '')}. "
        f"Target: {item.get('BodyPart', '')}. "
        f"Equipment: {item.get('Equipment', '')}. "
        f"Level: {item.get('Level', '')}. "
        f"Description: {item.get('Desc', '')}"
    )
    
    # Generate the vector
    vector = model.encode(combined_text).tolist()
    
    # Add vector to the dictionary
    item['vector'] = vector
    
    # Console log progress every 5 items (or adjust as needed)
    if (index + 1) % 5 == 0 or (index + 1) == len(exercises):
        print(f"Progress: [{index + 1}/{len(exercises)}] - Embedded: {item.get('Title')}")

# 5. Save the output
with open(output_file, 'w') as f:
    json.dump(exercises, f, indent=4)

print("-" * 30)
print(f"DONE! File saved to: {output_file}")
print("-" * 30)