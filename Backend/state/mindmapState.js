export function createMindmapState(roleName) {
  return {
    role: roleName,
    attempts: 0,
    maxAttempts: 3,
    bestScore: 0,
    latestScore: 0,
    history: [],
    status: "in_progress" // in_progress | completed
  };
}
