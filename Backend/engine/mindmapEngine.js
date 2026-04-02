export function updateMindmapState(state, aiResponse) {
  state.attempts += 1;
  state.latestScore = aiResponse.totalScore;
  state.bestScore = Math.max(state.bestScore, aiResponse.totalScore);
  state.history.push(aiResponse);

  if (state.attempts >= state.maxAttempts) {
    state.status = "completed";
  }

  return state;
}
