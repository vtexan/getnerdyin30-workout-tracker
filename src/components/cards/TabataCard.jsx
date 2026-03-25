import React from 'react';
import { useWorkout } from '../../context/WorkoutContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { ArrowUpSmall, ArrowDownSmall, XIcon, CheckIcon, PlusIcon, MinusIcon } from '../../icons.jsx';

export default function TabataCard({ ex, exIdx, updateField, moveExercise, removeExercise }) {
  const { activeWorkout, setActiveWorkout } = useWorkout();
  const { T, S } = useTheme();
  const tabataColor = '#a855f7';
  const completedRounds = (ex.rounds || []).filter(r => r.completed).length;
  const allTabataDone = completedRounds === (ex.rounds || []).length && (ex.rounds || []).length > 0;

  const toggleRound = (roundIdx) => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    exCopy.rounds = [...exCopy.rounds];
    exCopy.rounds[roundIdx] = { ...exCopy.rounds[roundIdx], completed: !exCopy.rounds[roundIdx].completed };
    updated.exercises[exIdx] = exCopy;
    setActiveWorkout(updated);
  };

  const addRound = () => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    exCopy.rounds = [...exCopy.rounds, { completed: false }];
    updated.exercises[exIdx] = exCopy;
    setActiveWorkout(updated);
  };

  const removeRound = () => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    if (exCopy.rounds.length > 1) {
      exCopy.rounds = exCopy.rounds.slice(0, -1);
      updated.exercises[exIdx] = exCopy;
      setActiveWorkout(updated);
    }
  };

  return (
    <div style={{ ...S.card, borderColor: allTabataDone ? tabataColor + '33' : T.border, position: 'relative', overflow: 'hidden', padding: 0 }}>
      {allTabataDone && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: tabataColor }} />}

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.tag(tabataColor)}>Tabata</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: allTabataDone ? tabataColor : T.textStrong, marginTop: 6 }}>{ex.name}</div>
            <div style={{ fontSize: 9, color: T.textFaint, marginTop: 2 }}>20s on · 10s off · per round</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => moveExercise(exIdx, -1)} disabled={exIdx === 0}
              style={{ background: 'none', border: `1px solid ${T.borderSubtle}`, borderRadius: 4, color: exIdx === 0 ? T.textFaint : T.textMuted, cursor: exIdx === 0 ? 'default' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', opacity: exIdx === 0 ? 0.3 : 0.6 }}>
              <ArrowUpSmall />
            </button>
            <button onClick={() => moveExercise(exIdx, 1)} disabled={exIdx === activeWorkout.exercises.length - 1}
              style={{ background: 'none', border: `1px solid ${T.borderSubtle}`, borderRadius: 4, color: exIdx === activeWorkout.exercises.length - 1 ? T.textFaint : T.textMuted, cursor: exIdx === activeWorkout.exercises.length - 1 ? 'default' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', opacity: exIdx === activeWorkout.exercises.length - 1 ? 0.3 : 0.6 }}>
              <ArrowDownSmall />
            </button>
            <button onClick={() => removeExercise(exIdx)}
              style={{ background: 'none', border: '1px solid #e9456025', borderRadius: 4, color: '#e94560', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.5 }}>
              <XIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Rounds */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 8, color: tabataColor, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          ROUNDS — {completedRounds} / {(ex.rounds || []).length} DONE
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {(ex.rounds || []).map((round, roundIdx) => (
            <div key={roundIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 8, color: T.textFaint }}>R{roundIdx + 1}</div>
              <button onClick={() => toggleRound(roundIdx)} style={S.setBtn(round.completed, false)}>
                {round.completed ? <CheckIcon /> : <span style={{ fontSize: 10 }}>{roundIdx + 1}</span>}
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={addRound} style={{ ...S.btnOutline(tabataColor), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon /> ROUND</button>
          {(ex.rounds || []).length > 1 && (
            <button onClick={removeRound} style={{ ...S.btnOutline('#333'), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><MinusIcon /> ROUND</button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '10px 16px 14px', borderTop: `1px solid ${T.borderSubtle}` }}>
        <textarea value={ex.notes || ''} onChange={e => updateField(exIdx, 'notes', e.target.value)}
          placeholder="Movements used, how it felt..."
          style={{ ...S.input, minHeight: 44, resize: 'vertical', fontSize: 11, lineHeight: 1.5, padding: '8px 10px', borderColor: T.borderInput }} />
      </div>
    </div>
  );
}
