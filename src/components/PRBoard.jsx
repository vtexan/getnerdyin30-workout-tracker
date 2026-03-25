import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { formatDate } from '../utils.js';

export default function PRBoard({ allExercises }) {
  const { data } = useWorkout();
  const { T, S } = useTheme();

  const prs = allExercises.map(ex => {
    const logs = data.workoutLogs.map(log => {
      const found = log.exercises.find(e => e.exerciseId === ex.id);
      if (!found) return null;
      const maxSetWeight = found.isCarry
        ? Math.max(0, ...(found.sets || []).map(s => (s.weight && s.completed) ? s.weight : 0))
        : found.workingSets
          ? Math.max(found.workingWeight || 0, ...found.workingSets.map(s => (s.weight && s.completed) ? s.weight : 0))
          : (found.workingWeight || found.weight || 0);
      return { date: log.date, weight: maxSetWeight };
    }).filter(Boolean);

    if (logs.length === 0) return null;

    const hasWeight = logs.some(l => l.weight > 0);
    const logsWithWeight = logs.filter(l => l.weight > 0);
    const best = hasWeight
      ? logsWithWeight.reduce((max, l) => l.weight > max.weight ? l : max, logsWithWeight[0])
      : logs[logs.length - 1];

    return {
      ...ex,
      prWeight: hasWeight ? best.weight : null,
      prDate: best.date,
      totalSessions: logs.length,
      isFirstOnly: logs.length === 1 && hasWeight,
      noWeight: !hasWeight,
    };
  }).filter(Boolean).sort((a, b) => {
    if (a.noWeight && !b.noWeight) return 1;
    if (!a.noWeight && b.noWeight) return -1;
    return (b.prWeight || 0) - (a.prWeight || 0);
  });

  const medals = ['#f59e0b', '#a0a0b0', '#cd7f32'];
  const weightedPrs = prs.filter(p => !p.noWeight);

  return (
    <div>
      <div style={{ ...S.sectionLabel, color: T.textMuted, marginBottom: 14 }}>Personal Records</div>
      {prs.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 30, color: T.textFaint }}>
          <div style={{ fontSize: 12 }}>No PRs yet</div>
          <div style={{ fontSize: 10, marginTop: 4 }}>Log your first workout to start tracking</div>
        </div>
      ) : prs.map((pr) => {
        const catInfo = CATEGORY_COLORS[pr.category] || { accent: '#888' };
        const weightedIdx = weightedPrs.indexOf(pr);
        const medalColor = weightedIdx >= 0 && weightedIdx < 3 ? medals[weightedIdx] : '#333';
        const showMedal = weightedIdx >= 0 && weightedIdx < 3;

        return (
          <div key={pr.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
            {pr.noWeight ? (
              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: T.bgInset, border: `1px solid ${T.borderInput}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: T.textFaint, letterSpacing: 0.3 }}>BW</div>
            ) : pr.isFirstOnly ? (
              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: '#22c55e10', border: '1px solid #22c55e44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#22c55e', letterSpacing: 0.3 }}>NEW</div>
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: showMedal ? medalColor + '12' : T.bgInset, border: `1px solid ${showMedal ? medalColor + '44' : T.borderInput}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: showMedal ? medalColor : '#444' }}>{weightedIdx + 1}</div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.name}</div>
                {pr.isFirstOnly && (
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', background: '#22c55e15', borderRadius: 4, padding: '1px 5px', letterSpacing: 0.5, flexShrink: 0 }}>FIRST LOG</span>
                )}
              </div>
              <div style={{ fontSize: 9, color: T.textFaint, marginTop: 1 }}>
                {formatDate(pr.prDate)} · {pr.totalSessions} session{pr.totalSessions > 1 ? 's' : ''}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {pr.noWeight ? (
                <div style={{ fontSize: 17, fontWeight: 800, color: T.textFaint }}>—</div>
              ) : (
                <>
                  <div style={{ fontSize: 17, fontWeight: 800, color: catInfo.accent }}>{pr.prWeight}</div>
                  <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 0.5 }}>LB</div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
