from sentence_transformers import SentenceTransformer
import firebase_admin
from firebase_admin import credentials, firestore
import json

# ---------- Firebase ----------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------- Load embedding model ----------
model = SentenceTransformer("all-MiniLM-L6-v2")
# vector size = 384

# ---------- Load exercises ----------
with open("exercises.json", "r", encoding="utf-8") as f:
    exercises = json.load(f)

def exercise_to_text(ex):
    return f"""
    Title: {ex['Title']}
    Description: {ex['Desc']}
    Type: {ex['Type']}
    Body Part: {ex['BodyPart']}
    Equipment: {ex['Equipment']}
    Level: {ex['Level']}
    """

# ---------- Embed + Store ----------
for ex in exercises:
    text = exercise_to_text(ex)
    vector = model.encode(text).tolist()

    db.collection("exercises").add({
        "title": ex["Title"],
        "bodyPart": ex["BodyPart"],
        "level": ex["Level"],
        "equipment": ex["Equipment"],
        "text": text,
        "embedding": vector
    })

    print("✅ Embedded:", ex["Title"])

print("🎉 All exercises embedded successfully")
