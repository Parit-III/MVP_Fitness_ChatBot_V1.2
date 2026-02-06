import fs from 'fs';
import path from 'path';
import similarity from 'compute-cosine-similarity';

// Load your vectorized data
const exercisesData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), '../data/exercises_with_vectors.json'), 'utf-8')
);

/**
 * Finds the top K most similar exercises based on a query vector
 */
const getRelevantContext = (queryVector, k = 3) => {
  const scored = exercisesData.map(ex => ({
    ...ex,
    score: similarity(queryVector, ex.vector)
  }));

  // Sort by highest score and take top K
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};