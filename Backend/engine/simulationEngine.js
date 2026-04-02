import { buildSimulationPrompt } from "../prompts/simulationPrompt.js";

export async function runSimulation(generateWithRotation, decision, mindmaps) {

  const prompt = buildSimulationPrompt(decision, mindmaps);

  const raw = await generateWithRotation(prompt, true);

  let json = {};
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse error:", err);
  }

  // Clamp helper để đảm bảo điểm luôn 0–10
  const clamp = (n) =>
    Number.isInteger(n) ? Math.max(0, Math.min(10, n)) : 0;

  const score = {
    clarity: clamp(json.score?.clarity),
    accuracy: clamp(json.score?.accuracy),
    precision: clamp(json.score?.precision),
    relevance: clamp(json.score?.relevance),
    depth: clamp(json.score?.depth),
    breadth: clamp(json.score?.breadth),
    logic: clamp(json.score?.logic),
    significance: clamp(json.score?.significance),
    fairness: clamp(json.score?.fairness)
  };

  const totalScore =
    score.clarity +
    score.accuracy +
    score.precision +
    score.relevance +
    score.depth +
    score.breadth +
    score.logic +
    score.significance +
    score.fairness;

  const averageScore = Math.round((totalScore / 9) * 10) / 10;

  return {
    consequences: {
      shortTerm: Array.isArray(json.consequences?.shortTerm)
        ? json.consequences.shortTerm
        : [],

      longTerm: Array.isArray(json.consequences?.longTerm)
        ? json.consequences.longTerm
        : [],

      risks: Array.isArray(json.consequences?.risks)
        ? json.consequences.risks
        : [],

      conflicts: Array.isArray(json.consequences?.conflicts)
        ? json.consequences.conflicts
        : []
    },

    score,
    totalScore,
    averageScore,

    strengths: Array.isArray(json.strengths) ? json.strengths : [],
    weaknesses: Array.isArray(json.weaknesses) ? json.weaknesses : []
  };
}