import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { getLastWorkingWeight } from '../utils.js';
import { CheckIcon, XIcon, TemplateIcon, MapPinIcon } from '../icons.jsx';

export default function BuildTemplate({ allExercises, saveAsTemplate, getRecentGyms }) {
  const {
    data, setView,
    buildingTemplate, setBuildingTemplate,
  } = useWorkout();
  const { T, S } = useTheme();

  if (!buildingTemplate) return null;
  const tpl = buildingTemplate;
  const categories = [...new Set(allExercises.map(e => e.category))];
  const selectedIds = new Set(tpl.exercises.map(e => e.exerciseId));

  const toggleExercise = (exId) => {
    if (selectedIds.has(exId)) {
      setBuildingTemplate({ ...tpl, exercises: tpl.exercises.filter(e => e.exerciseId !== exId) });
    } else {
      const ex = allExercises.find(e => e.id === exId);
      const lastWorking = getLastWorkingWeight(exId, data.workoutLogs);
      setBuildingTemplate({ ...tpl, exercises: [...tpl.exercises, {
        exerciseId: exId, name: ex.name, category: ex.category,
        targetWeight: lastWorking || 0, warmupWeight: lastWorking ? Math.round(lastWorking * 0.5 / 5) * 5 : 0,
        targetSets: 3, targetReps: 12, notes: '',
      }]});
    }
  };

  const updateExConfig = (exId, field, value) => {
    setBuildingTemplate({ ...tpl, exercises: tpl.exercises.map(e =>
      e.exerciseId === exId ? { ...e, [field]: value } : e
    )});
  };

  const saveTemplate = () => {
    if (!tpl.name.trim() || tpl.exercises.length === 0) return;
    saveAsTemplate(
      tpl.name,
      tpl.exercises.map(e => e.exerciseId),
      tpl.location,
      tpl.exercises.map(e => ({
        exerciseId: e.exerciseId,
        targetWeight: Number(e.targetWeight) || 0,
        warmupWeight: Number(e.warmupWeight) || 0,
        targetSets: Number(e.targetSets) || 3,
        targetReps: Number(e.targetReps) || 12,
        notes: e.notes || '',
      }))
    );
    setBuildingTemplate(null);
    setView('dashboard');
  };

  return (
    <div>
      <div style={{ ...S.sectionLabel, color: '#f59e0b', marginBottom: 14 }}><TemplateIcon /> BUILD TEMPLATE</div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>TEMPLATE NAME *</div>
        <input style={S.input} placeholder="e.g. Monday: Posterior Chain + Back" value={tpl.name}
          onChange={e => setBuildingTemplate({ ...tpl, name: e.target.value })} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ ...S.sectionLabel, color: T.textMuted }}><MapPinIcon /> Location</div>
        <input style={S.input} placeholder="e.g. Tom Muehlenbeck" value={tpl.location}
          onChange={e => setBuildingTemplate({ ...tpl, location: e.target.value })} />
        {getRecentGyms().length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {getRecentGyms().map((gym, i) => (
              <button key={i} onClick={() => setBuildingTemplate({ ...tpl, location: gym })}
                style={{ background: T.bgInset, border: `1px solid ${T.borderInput}`, borderRadius: 6, padding: '4px 8px', fontSize: 9, color: T.text, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                {gym}
              </button>
            ))}
          </div>
        )}
      </div>

      {tpl.exercises.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1, marginBottom: 8 }}>EXERCISES IN TEMPLATE ({tpl.exercises.length})</div>
          {tpl.exercises.map((exCfg) => {
            const catInfo = CATEGORY_COLORS[exCfg.category] || { accent: '#888' };
            return (
              <div key={exCfg.exerciseId} style={{ ...S.card, marginBottom: 6, padding: '12px 14px', borderColor: catInfo.accent + '33' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong }}>{exCfg.name}</div>
                    <div style={{ fontSize: 8, color: catInfo.accent }}>{(CATEGORY_COLORS[exCfg.category] || {}).label}</div>
                  </div>
                  <button onClick={() => toggleExercise(exCfg.exerciseId)}
                    style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', padding: 4 }}><XIcon /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                  {[
                    { label: 'WORKING', field: 'targetWeight', unit: 'lb' },
                    { label: 'WARMUP', field: 'warmupWeight', unit: 'lb' },
                    { label: 'SETS', field: 'targetSets' },
                    { label: 'REPS', field: 'targetReps' },
                  ].map(({ label, field, unit }) => (
                    <div key={field}>
                      <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                      <input type="number" style={{ ...S.input, fontSize: 11, padding: '6px 8px', textAlign: 'center' }} value={exCfg[field]}
                        onChange={e => updateExConfig(exCfg.exerciseId, field, e.target.value)} />
                      {unit && <div style={{ fontSize: 7, color: T.textFaint, textAlign: 'center', marginTop: 1 }}>{unit}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 6 }}>
                  <input style={{ ...S.input, fontSize: 10 }} placeholder="Notes (optional)" value={exCfg.notes}
                    onChange={e => updateExConfig(exCfg.exerciseId, 'notes', e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1, marginBottom: 8 }}>TAP TO ADD EXERCISES</div>
      {categories.map(cat => {
        const catInfo = CATEGORY_COLORS[cat];
        const catExercises = allExercises.filter(e => e.category === cat);
        if (catExercises.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 12 }}>
            <div style={S.tag(catInfo.accent)}>{catInfo.label}</div>
            {catExercises.map(ex => {
              const selected = selectedIds.has(ex.id);
              return (
                <div key={ex.id} onClick={() => toggleExercise(ex.id)}
                  style={{ ...S.card, marginBottom: 3, padding: '8px 12px', cursor: 'pointer', borderColor: selected ? catInfo.accent + '66' : T.border, opacity: selected ? 0.5 : 1, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: selected ? T.textMuted : T.textStrong }}>{ex.name}</div>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? catInfo.accent : T.borderInput}`, background: selected ? catInfo.accent + '20' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: catInfo.accent }}>
                      {selected && <CheckIcon />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {tpl.exercises.length > 0 && (
        <div style={{ position: 'sticky', bottom: 70, paddingTop: 12 }}>
          <button style={S.btn('#f59e0b')} onClick={saveTemplate}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><TemplateIcon /> SAVE TEMPLATE ({tpl.exercises.length} EXERCISES)</span>
          </button>
        </div>
      )}
      <button onClick={() => { setBuildingTemplate(null); setView('dashboard'); }} style={{ ...S.btnOutline('#555'), marginTop: 8 }}>CANCEL</button>
    </div>
  );
}
