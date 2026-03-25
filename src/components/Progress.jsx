import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { getProgressionSuggestion } from '../utils.js';

export default function Progress({ allExercises }) {
  const { data } = useWorkout();
  const { T, S } = useTheme();

  const exercisesWithHistory = allExercises
    .map(ex => {
      const logs = data.workoutLogs.map(log => {
        const found = log.exercises.find(e => e.exerciseId === ex.id);
        if (!found) return null;
        const maxSetWeight = found.workingSets
          ? Math.max(found.workingWeight || 0, ...found.workingSets.map(s => (s.weight && s.completed) ? s.weight : 0))
          : (found.workingWeight || found.weight || 0);
        return { date: log.date, warmupWeight: found.warmupWeight || 0, workingWeight: maxSetWeight };
      }).filter(Boolean);
      return { ...ex, history: logs };
    })
    .filter(e => e.history.length > 0);

  return (
    <div>
      <div style={{ ...S.sectionLabel, color: T.textMuted, marginBottom: 14 }}>Exercise Progress</div>
      {exercisesWithHistory.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 30, color: T.textFaint }}>
          <div style={{ fontSize: 12 }}>No workout data yet</div>
          <div style={{ fontSize: 10, marginTop: 4 }}>Complete your first workout to see progress</div>
        </div>
      ) : exercisesWithHistory.map(ex => {
        const catInfo = CATEGORY_COLORS[ex.category] || { accent: '#888' };
        const workingWeights = ex.history.map(h => h.workingWeight).filter(w => w > 0);
        const pr = workingWeights.length > 0 ? Math.max(...workingWeights) : 0;
        const latest = workingWeights[workingWeights.length - 1] || 0;
        const first = workingWeights[0] || 0;
        const change = first > 0 ? Math.round((latest - first) / first * 100) : 0;
        const suggestion = getProgressionSuggestion(ex.id, data.workoutLogs);

        return (
          <div key={ex.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={S.tag(catInfo.accent)}>{CATEGORY_COLORS[ex.category]?.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 6 }}>{ex.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#e94560' }}>{pr} lb</div>
                <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1 }}>WORKING PR</div>
              </div>
            </div>

            {/* History bars */}
            <div style={{ display: 'flex', gap: 3, marginTop: 14, alignItems: 'flex-end', height: 36 }}>
              {ex.history.map((h, i) => {
                const maxW = Math.max(...ex.history.map(x => x.workingWeight));
                const pct = maxW > 0 ? (h.workingWeight / maxW * 100) : 0;
                return (
                  <div key={i} style={{ flex: 1, maxWidth: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', height: `${Math.max(pct, 8)}%`, minHeight: 3, background: h.workingWeight === pr ? '#e94560' : catInfo.accent + '50', borderRadius: 2 }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
              {ex.history.map((h, i) => (
                <div key={i} style={{ flex: 1, maxWidth: 28, textAlign: 'center', fontSize: 7, color: T.textFaint }}>{h.workingWeight}</div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.borderSubtle}`, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <span style={{ fontSize: 9, color: T.textMuted }}>Warmup: </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>{ex.history[ex.history.length - 1]?.warmupWeight || '—'} lb</span>
              </div>
              <div>
                <span style={{ fontSize: 9, color: T.textMuted }}>Change: </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: change > 0 ? '#22c55e' : change < 0 ? '#e94560' : '#444' }}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
              {suggestion && (
                <div>
                  <span style={{ fontSize: 9, color: T.textMuted }}>Next: </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{suggestion} lb</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
