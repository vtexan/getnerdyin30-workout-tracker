export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const getLastWorkingWeight = (exerciseId, logs) => {
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exerciseId);
    if (found && found.workingWeight > 0) return found.workingWeight;
  }
  return 0;
};

export const getLastWarmupWeight = (exerciseId, logs) => {
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exerciseId);
    if (found && found.warmupWeight > 0) return found.warmupWeight;
  }
  return 0;
};

export const getLastCardioStats = (exerciseId, logs) => {
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exerciseId && e.isCardio);
    if (found) return {
      duration: found.duration || 0,
      distance: found.distance || 0,
      calories: found.calories || 0,
      avgHeartRate: found.avgHeartRate || 0,
    };
  }
  return null;
};

export const getLastCarryStats = (exerciseId, logs) => {
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exerciseId && e.isCarry);
    if (found) return { sets: found.sets || [] };
  }
  return null;
};

export const getLastTabataRounds = (exerciseId, logs) => {
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exerciseId && e.isTabata);
    if (found) return (found.rounds || []).filter(r => r.completed).length;
  }
  return 0;
};

export const getProgressionSuggestion = (exerciseId, logs) => {
  const lastWeight = getLastWorkingWeight(exerciseId, logs);
  if (lastWeight <= 0) return null;
  return Math.round(lastWeight * 1.05 / 5) * 5 || lastWeight + 5;
};

export const getPR = (exerciseId, logs) => {
  let max = 0;
  logs.forEach(log => {
    const found = log.exercises.find(e => e.exerciseId === exerciseId);
    if (found) {
      if (found.workingWeight > max) max = found.workingWeight;
      if (found.workingSets) {
        found.workingSets.forEach(s => {
          if (s.weight && s.weight > max && s.completed) max = s.weight;
        });
      }
    }
  });
  return max > 0 ? max : null;
};
