import React from 'react';
import { useWorkout } from '../../context/WorkoutContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../../constants.js';
import { getLastWorkingWeight } from '../../utils.js';
import {
  SwapIcon, ArrowUpSmall, ArrowDownSmall, XIcon, CheckIcon,
  PlayIcon, FlameIcon, EditIcon, PlusIcon, MinusIcon,
} from '../../icons.jsx';

export default function StrengthCard({
  ex, exIdx, catInfo, exInfo, allExercises,
  getVideoUrl, updateField, toggleSet, updateReps,
  updateSetWeight, addSet, removeSet, moveExercise,
  removeExercise, swapExercise,
}) {
  const { activeWorkout, swappingExerciseIdx, setSwappingExerciseIdx, dismissedHints, dismissHint, data } = useWorkout();
  const { T, S, dark } = useTheme();

  const allWarmupDone = (ex.warmupSets || []).every(s => s.completed);
  const allWorkingDone = (ex.workingSets || []).every(s => s.completed);
  const allDone = allWarmupDone && allWorkingDone;
  const maxSetWeight = Math.max(ex.workingWeight || 0, ...ex.workingSets.map(s => s.weight || 0));
  const isNewPR = maxSetWeight > 0 && allWorkingDone && (!ex.pr || maxSetWeight > ex.pr);

  const currentIds = activeWorkout.exercises.map(e => e.exerciseId);
  const currentMuscle = exInfo?.muscle || '';
  const currentCategory = ex.category;
  const sameMuscle = allExercises.filter(e =>
    e.id !== ex.exerciseId && !currentIds.includes(e.id) && e.muscle === currentMuscle && !e.isCardio
  );
  const sameCategory = allExercises.filter(e =>
    e.id !== ex.exerciseId && !currentIds.includes(e.id) && e.category === currentCategory && e.muscle !== currentMuscle && !e.isCardio
  );

  return (
    <div style={{ ...S.card, borderColor: allDone ? '#22c55e22' : T.border, position: 'relative', overflow: 'hidden', padding: 0 }}>
      {allDone && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#22c55e' }} />}

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={S.tag(catInfo.accent)}>{CATEGORY_COLORS[ex.category]?.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: allDone ? '#22c55e' : T.textStrong, marginTop: 6 }}>{ex.name}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              {ex.pr > 0 && <span style={{ fontSize: 9, color: '#f59e0b', letterSpacing: 0.5 }}>PR: {ex.pr} lb</span>}
              {ex.suggestion && <span style={{ fontSize: 9, color: T.textMuted }}>Target: {ex.suggestion} lb</span>}
              {ex.lastWorking > 0 && <span style={{ fontSize: 9, color: T.textFaint }}>Last: {ex.lastWorking} lb</span>}
            </div>
          </div>
          {exInfo?.videoUrl && (
            <a href={getVideoUrl(exInfo)} target="_blank" rel="noopener noreferrer"
              style={{ color: catInfo.accent, display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, textDecoration: 'none', padding: '4px 8px', borderRadius: 4, border: `1px solid ${catInfo.accent}25`, letterSpacing: 0.5, flexShrink: 0 }}>
              <PlayIcon /> Form
            </a>
          )}
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

        {exIdx === 0 && !dismissedHints.swap && (
          <div style={{ margin: '6px 0 2px', padding: '6px 10px', background: '#0ea5e908', borderRadius: 6, border: '1px solid #0ea5e920', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#0ea5e9' }}>
              <strong>Tip:</strong> Machine taken? Tap <SwapIcon /> to swap for an alternative.
            </span>
            <button onClick={() => dismissHint('swap')} style={{ background: 'none', border: 'none', color: '#0ea5e950', cursor: 'pointer', padding: 2, flexShrink: 0, fontSize: 9 }}>✕</button>
          </div>
        )}
        {isNewPR && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f59e0b12', borderRadius: 6, border: '1px solid #f59e0b33' }}>
            <span style={{ color: '#f59e0b' }}><FlameIcon /></span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: 0.5 }}>NEW PR!</span>
          </div>
        )}
      </div>

      {/* Swap panel */}
      {swappingExerciseIdx === exIdx && (
        <div style={{ padding: '10px 16px', background: dark ? '#0ea5e908' : '#0ea5e906', borderBottom: `1px solid ${T.borderSubtle}` }}>
          <div style={{ fontSize: 8, color: '#0ea5e9', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>
            <SwapIcon /> SWAP — SAME MUSCLE ALTERNATIVES
          </div>
          {sameMuscle.length === 0 && sameCategory.length === 0 && (
            <div style={{ fontSize: 10, color: T.textFaint, padding: '8px 0' }}>No alternatives found for {currentMuscle}</div>
          )}
          {sameMuscle.length > 0 && (
            <div style={{ marginBottom: sameCategory.length > 0 ? 8 : 0 }}>
              <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 1, marginBottom: 4 }}>SAME MUSCLE ({currentMuscle})</div>
              {sameMuscle.map(alt => {
                const lastW = getLastWorkingWeight(alt.id, data.workoutLogs);
                return (
                  <button key={alt.id} onClick={() => swapExercise(exIdx, alt.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 10px', marginBottom: 3, background: dark ? '#1a1a2e' : '#fff', border: `1px solid ${T.borderSubtle}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textStrong }}>{alt.name}</div>
                      <div style={{ fontSize: 8, color: T.textFaint }}>{alt.muscle}</div>
                    </div>
                    {lastW > 0 && <span style={{ fontSize: 9, color: T.textMuted }}>Last: {lastW} lb</span>}
                  </button>
                );
              })}
            </div>
          )}
          {sameCategory.length > 0 && (
            <div>
              <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 1, marginBottom: 4 }}>SAME CATEGORY ({CATEGORY_COLORS[currentCategory]?.label})</div>
              {sameCategory.map(alt => {
                const lastW = getLastWorkingWeight(alt.id, data.workoutLogs);
                return (
                  <button key={alt.id} onClick={() => swapExercise(exIdx, alt.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 10px', marginBottom: 3, background: dark ? '#1a1a2e' : '#fff', border: `1px solid ${T.borderSubtle}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textStrong }}>{alt.name}</div>
                      <div style={{ fontSize: 8, color: T.textFaint }}>{alt.muscle}</div>
                    </div>
                    {lastW > 0 && <span style={{ fontSize: 9, color: T.textMuted }}>Last: {lastW} lb</span>}
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={() => setSwappingExerciseIdx(null)}
            style={{ ...S.btnOutline('#666'), fontSize: 9, padding: '6px 12px', marginTop: 6, width: '100%' }}>CANCEL</button>
        </div>
      )}

      {/* Warmup */}
      <div style={{ padding: '12px 16px', background: T.bgInset, borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div style={{ ...S.sectionLabel, color: '#f59e0b' }}>
          <span style={{ fontSize: 11 }}>~</span> WARMUP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input type="number" value={ex.warmupWeight || ''} onChange={e => updateField(exIdx, 'warmupWeight', parseFloat(e.target.value) || 0)}
            style={{ ...S.input, width: 80, textAlign: 'center', fontSize: 15, fontWeight: 700, borderColor: '#f59e0b33', padding: '6px 10px' }} placeholder="0" />
          <span style={{ fontSize: 11, color: T.textMuted }}>lb</span>
          <span style={{ fontSize: 9, color: T.textFaint, marginLeft: 'auto' }}>lighter weight, groove the pattern</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {ex.warmupSets.map((set, setIdx) => (
            <div key={setIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 0.5 }}>W{setIdx + 1}</div>
              <button onClick={() => toggleSet(exIdx, 'warmup', setIdx)} style={S.setBtn(set.completed, true)}>
                {set.completed ? <CheckIcon /> : '—'}
              </button>
              {set.completed && (
                <input type="number" value={set.reps || ''} onChange={e => updateReps(exIdx, 'warmup', setIdx, e.target.value)}
                  style={{ ...S.input, width: 50, padding: '2px 4px', textAlign: 'center', fontSize: 10, borderColor: '#f59e0b22' }} placeholder="10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Working sets */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ ...S.sectionLabel, color: '#22c55e' }}>
          <span style={{ color: '#22c55e' }}><FlameIcon /></span> WORKING SETS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input type="number" value={ex.workingWeight || ''} onChange={e => updateField(exIdx, 'workingWeight', parseFloat(e.target.value) || 0)}
            style={{ ...S.input, width: 80, textAlign: 'center', fontSize: 15, fontWeight: 700, borderColor: '#22c55e33', padding: '6px 10px' }} placeholder="0" />
          <span style={{ fontSize: 11, color: T.textMuted }}>lb</span>
          <span style={{ fontSize: 9, color: T.textFaint, marginLeft: 'auto' }}>starting weight</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ex.workingSets.map((set, setIdx) => {
            const weightChanged = set.weight != null && set.weight !== ex.workingWeight;
            return (
              <div key={setIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: setIdx < ex.workingSets.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                <button onClick={() => toggleSet(exIdx, 'working', setIdx)} style={S.setBtn(set.completed, false)}>
                  {set.completed ? <CheckIcon /> : <span style={{ fontSize: 10 }}>S{setIdx + 1}</span>}
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="number" value={set.weight != null ? set.weight : (ex.workingWeight || '')}
                      onChange={e => updateSetWeight(exIdx, setIdx, e.target.value)}
                      style={{ ...S.input, width: 70, textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '4px 6px', borderColor: weightChanged ? '#f59e0b44' : '#22c55e22', color: weightChanged ? '#f59e0b' : T.inputText }} placeholder="0" />
                    <span style={{ fontSize: 9, color: T.textMuted }}>lb</span>
                  </div>
                  <span style={{ fontSize: 9, color: T.textFaint }}>×</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="number" value={set.reps || ''} onChange={e => updateReps(exIdx, 'working', setIdx, e.target.value)}
                      style={{ ...S.input, width: 50, textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '4px 6px', borderColor: '#22c55e22' }} placeholder="12" />
                    <span style={{ fontSize: 9, color: T.textMuted }}>reps</span>
                  </div>
                  {weightChanged && <span style={{ fontSize: 8, color: '#f59e0b', letterSpacing: 0.5 }}>BUMPED</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={() => addSet(exIdx, 'working')} style={{ ...S.btnOutline('#22c55e'), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon /> SET</button>
          {ex.workingSets.length > 1 && (
            <button onClick={() => removeSet(exIdx, 'working')} style={{ ...S.btnOutline('#333'), padding: '6px 12px', fontSize: 9, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><MinusIcon /> SET</button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '10px 16px 14px', borderTop: `1px solid ${T.borderSubtle}` }}>
        <div style={{ ...S.sectionLabel, color: T.textMuted, marginBottom: 6 }}>
          <EditIcon /> NOTES
        </div>
        <textarea value={ex.notes || ''} onChange={e => updateField(exIdx, 'notes', e.target.value)}
          placeholder="Form cues, how it felt, weight adjustments..."
          style={{ ...S.input, minHeight: 50, resize: 'vertical', fontSize: 12, lineHeight: 1.5, padding: '8px 10px', borderColor: T.borderInput }} />
      </div>
    </div>
  );
}
