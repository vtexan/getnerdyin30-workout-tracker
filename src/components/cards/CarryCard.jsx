import React from 'react';
import { useWorkout } from '../../context/WorkoutContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { PlayIcon, ArrowUpSmall, ArrowDownSmall, XIcon, CheckIcon, PlusIcon, MinusIcon } from '../../icons.jsx';

export default function CarryCard({ ex, exIdx, exInfo, getVideoUrl, updateField, moveExercise, removeExercise }) {
  const { activeWorkout, setActiveWorkout } = useWorkout();
  const { T, S } = useTheme();
  const carryColor = '#ec4899';
  const allCarryDone = (ex.sets || []).every(s => s.completed);

  const updateCarrySet = (setIdx, field, value) => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    exCopy.sets = [...exCopy.sets];
    exCopy.sets[setIdx] = { ...exCopy.sets[setIdx], [field]: value };
    updated.exercises[exIdx] = exCopy;
    setActiveWorkout(updated);
  };

  const toggleCarrySet = (setIdx) => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    exCopy.sets = [...exCopy.sets];
    exCopy.sets[setIdx] = { ...exCopy.sets[setIdx], completed: !exCopy.sets[setIdx].completed };
    updated.exercises[exIdx] = exCopy;
    setActiveWorkout(updated);
  };

  const addCarrySet = () => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    const lastSet = exCopy.sets[exCopy.sets.length - 1] || {};
    exCopy.sets = [...exCopy.sets, { weight: lastSet.weight || 0, laps: lastSet.laps || 1, distance: '', completed: false }];
    updated.exercises[exIdx] = exCopy;
    setActiveWorkout(updated);
  };

  const removeCarrySet = () => {
    const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
    const exCopy = { ...updated.exercises[exIdx] };
    if (exCopy.sets.length > 1) {
      exCopy.sets = exCopy.sets.slice(0, -1);
      updated.exercises[exIdx] = exCopy;
      setActiveWorkout(updated);
    }
  };

  return (
    <div style={{ ...S.card, borderColor: allCarryDone ? carryColor + '33' : T.border, position: 'relative', overflow: 'hidden', padding: 0 }}>
      {allCarryDone && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: carryColor }} />}

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.tag(carryColor)}>Carry</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: allCarryDone ? carryColor : T.textStrong, marginTop: 6 }}>{ex.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {exInfo?.videoUrl && (
              <a href={getVideoUrl(exInfo)} target="_blank" rel="noopener noreferrer"
                style={{ color: carryColor, display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, textDecoration: 'none', padding: '4px 8px', borderRadius: 4, border: `1px solid ${carryColor}25`, letterSpacing: 0.5 }}>
                <PlayIcon /> Form
              </a>
            )}
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

      {/* Sets */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 32, fontSize: 7, color: T.textFaint, letterSpacing: 0.5, textAlign: 'center', paddingTop: 2 }}></div>
          <div style={{ flex: '0 0 68px', fontSize: 7, color: T.textFaint, letterSpacing: 0.5, textAlign: 'center' }}>WEIGHT (lb)</div>
          <div style={{ flex: '0 0 54px', fontSize: 7, color: T.textFaint, letterSpacing: 0.5, textAlign: 'center' }}>LAPS</div>
          <div style={{ flex: 1, fontSize: 7, color: T.textFaint, letterSpacing: 0.5 }}>DISTANCE (opt)</div>
        </div>
        {(ex.sets || []).map((set, setIdx) => (
          <div key={setIdx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, paddingBottom: 6, borderBottom: setIdx < ex.sets.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
            <button onClick={() => toggleCarrySet(setIdx)} style={{ ...S.setBtn(set.completed, false), width: 32, flexShrink: 0 }}>
              {set.completed ? <CheckIcon /> : <span style={{ fontSize: 10 }}>S{setIdx + 1}</span>}
            </button>
            <input type="number" value={set.weight || ''} placeholder="0"
              onChange={e => updateCarrySet(setIdx, 'weight', parseFloat(e.target.value) || 0)}
              style={{ ...S.input, flex: '0 0 68px', textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '4px 6px', borderColor: carryColor + '33' }} />
            <input type="number" value={set.laps || ''} placeholder="1"
              onChange={e => updateCarrySet(setIdx, 'laps', parseInt(e.target.value) || 0)}
              style={{ ...S.input, flex: '0 0 54px', textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '4px 6px', borderColor: carryColor + '22' }} />
            <input type="text" value={set.distance || ''} placeholder="e.g. 40 ft"
              onChange={e => updateCarrySet(setIdx, 'distance', e.target.value)}
              style={{ ...S.input, flex: 1, fontSize: 11, padding: '4px 6px', borderColor: T.borderInput }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <button onClick={addCarrySet} style={{ ...S.btnOutline(carryColor), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon /> SET</button>
          {ex.sets.length > 1 && (
            <button onClick={removeCarrySet} style={{ ...S.btnOutline('#333'), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><MinusIcon /> SET</button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '10px 16px 14px', borderTop: `1px solid ${T.borderSubtle}` }}>
        <textarea value={ex.notes || ''} onChange={e => updateField(exIdx, 'notes', e.target.value)}
          placeholder="How far, how heavy, how it felt..."
          style={{ ...S.input, minHeight: 44, resize: 'vertical', fontSize: 11, lineHeight: 1.5, padding: '8px 10px', borderColor: T.borderInput }} />
      </div>
    </div>
  );
}
