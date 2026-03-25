import React from 'react';
import { useWorkout } from '../../context/WorkoutContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../../constants.js';
import { SwapIcon, ArrowUpSmall, ArrowDownSmall, XIcon, CheckIcon } from '../../icons.jsx';

export default function CardioCard({ ex, exIdx, catInfo, allExercises, updateField, moveExercise, removeExercise, swapExercise }) {
  const { activeWorkout, swappingExerciseIdx, setSwappingExerciseIdx } = useWorkout();
  const { T, S, dark } = useTheme();

  const currentIds = activeWorkout.exercises.map(e => e.exerciseId);
  const cardioAlts = allExercises.filter(e =>
    e.id !== ex.exerciseId && !currentIds.includes(e.id) && (e.isCardio || e.category === 'cardio')
  );

  return (
    <div style={{ ...S.card, borderColor: ex.completed ? '#22c55e22' : T.border, position: 'relative', overflow: 'hidden', padding: 0 }}>
      {ex.completed && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#22c55e' }} />}

      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.tag(catInfo.accent)}>{CATEGORY_COLORS[ex.category]?.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: ex.completed ? '#22c55e' : T.textStrong, marginTop: 6 }}>{ex.name}</div>
          </div>
          <button onClick={() => setSwappingExerciseIdx(swappingExerciseIdx === exIdx ? null : exIdx)}
            style={{ background: swappingExerciseIdx === exIdx ? '#0ea5e915' : 'none', border: `1px solid ${swappingExerciseIdx === exIdx ? '#0ea5e9' : '#0ea5e925'}`, borderRadius: 4, color: '#0ea5e9', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: swappingExerciseIdx === exIdx ? 1 : 0.6 }}>
            <SwapIcon />
          </button>
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

      {swappingExerciseIdx === exIdx && (
        <div style={{ padding: '10px 16px', background: dark ? '#0ea5e908' : '#0ea5e906', borderBottom: `1px solid ${T.borderSubtle}` }}>
          <div style={{ fontSize: 8, color: '#0ea5e9', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>SWAP — OTHER CARDIO</div>
          {cardioAlts.length === 0 && <div style={{ fontSize: 10, color: T.textFaint, padding: '8px 0' }}>No other cardio exercises available</div>}
          {cardioAlts.map(alt => (
            <button key={alt.id} onClick={() => swapExercise(exIdx, alt.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 10px', marginBottom: 3, background: dark ? '#1a1a2e' : '#fff', border: `1px solid ${T.borderSubtle}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textStrong }}>{alt.name}</div>
                <div style={{ fontSize: 8, color: T.textFaint }}>{alt.muscle}</div>
              </div>
            </button>
          ))}
          <button onClick={() => setSwappingExerciseIdx(null)}
            style={{ ...S.btnOutline('#666'), fontSize: 9, padding: '6px 12px', marginTop: 6, width: '100%' }}>CANCEL</button>
        </div>
      )}

      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1, marginBottom: 3 }}>DURATION (min)</div>
            <input type="number" style={{ ...S.input, fontSize: 14, textAlign: 'center', fontWeight: 700 }}
              value={ex.duration || ''} placeholder="30"
              onChange={e => updateField(exIdx, 'duration', Number(e.target.value) || 0)} />
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1, marginBottom: 3 }}>DISTANCE (mi)</div>
            <input type="number" step="0.1" style={{ ...S.input, fontSize: 14, textAlign: 'center', fontWeight: 700 }}
              value={ex.distance || ''} placeholder="0.0"
              onChange={e => updateField(exIdx, 'distance', Number(e.target.value) || 0)} />
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1, marginBottom: 3 }}>CALORIES</div>
            <input type="number" style={{ ...S.input, fontSize: 14, textAlign: 'center', fontWeight: 700 }}
              value={ex.calories || ''} placeholder="0"
              onChange={e => updateField(exIdx, 'calories', Number(e.target.value) || 0)} />
          </div>
          <div>
            <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1, marginBottom: 3 }}>AVG HR (bpm)</div>
            <input type="number" style={{ ...S.input, fontSize: 14, textAlign: 'center', fontWeight: 700 }}
              value={ex.avgHeartRate || ''} placeholder="0"
              onChange={e => updateField(exIdx, 'avgHeartRate', Number(e.target.value) || 0)} />
          </div>
        </div>

        <textarea value={ex.notes || ''} onChange={e => updateField(exIdx, 'notes', e.target.value)}
          placeholder="Class name, instructor, how it felt..."
          style={{ ...S.input, minHeight: 40, resize: 'vertical', fontSize: 11, lineHeight: 1.5, border: `1px solid ${T.borderInput}` }} />

        <button onClick={() => updateField(exIdx, 'completed', !ex.completed)}
          style={{ ...ex.completed ? S.btn('#22c55e') : S.btnOutline('#22c55e'), marginTop: 10, padding: '10px 14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckIcon /> {ex.completed ? 'COMPLETED ✓' : 'MARK COMPLETE'}
          </span>
        </button>
      </div>
    </div>
  );
}
