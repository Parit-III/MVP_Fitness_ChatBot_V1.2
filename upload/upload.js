require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase using .env variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace literal '\n' with actual newlines for the private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// Load your local JSON file
const rawData = fs.readFileSync('exercises.json', 'utf8');
const exercises = JSON.parse(rawData);

async function syncToFirebase() {
  console.log(`Starting upload of ${exercises.length} exercises...`);

  const batch = db.batch();

  exercises.forEach((exercise) => {
    // Generate a consistent ID (slug) from the Title
    const docId = exercise.Title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const docRef = db.collection('exercises').doc(docId);

    // .set() without {merge: true} will delete all old fields (like embedding)
    // and replace them with exactly what is in your JSON object.
    batch.set(docRef, exercise);
  });

  try {
    await batch.commit();
    console.log("Success! Firebase structure updated and old fields removed.");
  } catch (error) {
    console.error("Error updating Firestore:", error);
  }
}

syncToFirebase();