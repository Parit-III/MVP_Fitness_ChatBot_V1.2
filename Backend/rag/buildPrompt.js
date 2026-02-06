export function buildWorkoutPrompt({ user, exercises, days }) {
  return `
You are a professional fitness coach.

User profile:
Age: ${user.age}
Gender: ${user.gender}
Goal: ${user.goal}
Experience: ${user.experience}
Injuries: ${user.injuries?.join(", ") || "none"}

Available exercises (USE ONLY THESE):
${JSON.stringify(exercises, null, 2)}

Task:
Create a ${days}-day workout plan.
- Match the user's goal
- Avoid injury risks
- Beginner-friendly if experience is beginner
- Include sets, reps, and short explanation

Return JSON format only.
`;
}
