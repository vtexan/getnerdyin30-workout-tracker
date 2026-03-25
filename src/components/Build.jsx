import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { getPR } from '../utils.js';
import { CheckIcon, PlusIcon, MapPinIcon, XIcon } from '../icons.jsx';

export default function Build({ allExercises, startWorkout, getRecentGyms }) {
  const {
    data, setView,
    workoutName, setWorkoutName,
    workoutDate, setWorkoutDate,
    workoutLocation, setWorkoutLocation,
    locationSearch, setLocationSearch,
    selectedExercises, setSelectedExercises,
  } = useWorkout();
  const { T, S } = useTheme();

  const categories = [...new Set(allExercises.map(e => e.category))];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...S.sectionLabel, color: T.textMuted }}>Workout Name</div>
        <input style={S.input} placeholder="e.g. Posterior Chain + Back" value={workoutName} onChange={e => setWorkoutName(e.target.value)} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ ...S.sectionLabel, color: T.textMuted }}>Date</div>
        <input type="date" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          style={{ ...S.input, width: 'auto' }} />
        {workoutDate !== new Date().toISOString().split('T')[0] && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>⏮ BACKDATED ENTRY</span>
            <button onClick={() => setWorkoutDate(new Date().toISOString().split('T')[0])}
              style={{ background: 'none', border: 'none', color: T.textFaint, cursor: 'pointer', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", textDecoration: 'underline' }}>reset to today</button>
          </div>
        )}
      </div>

      {/* Location picker */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...S.sectionLabel, color: T.textMuted }}><MapPinIcon /> Location</div>
        {workoutLocation ? (
          <div style={{ ...S.card, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: '#22c55e44' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#22c55e' }}><MapPinIcon /></span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textStrong }}>{workoutLocation}</span>
            </div>
            <button onClick={() => setWorkoutLocation('')} style={{ background: 'none', border: 'none', color: T.textFaint, cursor: 'pointer', padding: 4 }}><XIcon /></button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Type gym name..." value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && locationSearch.trim()) { setWorkoutLocation(locationSearch.trim()); setLocationSearch(''); }}} />
              <button onClick={() => { if (locationSearch.trim()) { setWorkoutLocation(locationSearch.trim()); setLocationSearch(''); }}}
                style={{ ...S.btn('#22c55e'), width: 'auto', padding: '8px 14px', fontSize: 10 }}>SET</button>
            </div>
            {getRecentGyms().length > 0 && (
              <div>
                <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1, marginBottom: 4 }}>RECENT</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {getRecentGyms().map((gym, i) => (
                    <button key={i} onClick={() => setWorkoutLocation(gym)}
                      style={{ background: T.bgInset, border: `1px solid ${T.borderInput}`, borderRadius: 6, padding: '6px 10px', fontSize: 10, color: T.text, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                      {gym}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ ...S.sectionLabel, color: T.textMuted, marginBottom: 14 }}>Select Exercises ({selectedExercises.length})</div>

      {categories.map(cat => {
        const catExercises = allExercises.filter(e => e.category === cat);
        const catInfo = CATEGORY_COLORS[cat] || { accent: '#888', label: cat };
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={S.tag(catInfo.accent)}>{catInfo.label}</div>
            {catExercises.map(ex => {
              const selected = selectedExercises.includes(ex.id);
              const pr = getPR(ex.id, data.workoutLogs);
              return (
                <div key={ex.id} onClick={() => setSelectedExercises(prev => selected ? prev.filter(id => id !== ex.id) : [...prev, ex.id])}
                  style={{ ...S.card, marginBottom: 4, padding: '10px 14px', cursor: 'pointer', borderColor: selected ? catInfo.accent + '66' : T.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.textStrong : T.textMuted }}>{ex.name}</div>
                    <div style={{ fontSize: 9, color: T.textFaint, marginTop: 1 }}>{ex.muscle}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {pr && <span style={{ fontSize: 9, color: '#22c55e' }}>PR: {pr}lb</span>}
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? catInfo.accent : T.borderInput}`, background: selected ? catInfo.accent + '20' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: catInfo.accent }}>
                      {selected && <CheckIcon />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {selectedExercises.length > 0 && (
        <div style={{ position: 'sticky', bottom: 70, paddingTop: 12 }}>
          <button style={S.btn()} onClick={startWorkout}>START ({selectedExercises.length} EXERCISES)</button>
        </div>
      )}
      <button onClick={() => setView('dashboard')} style={{ ...S.btnOutline('#555'), marginTop: 8 }}>CANCEL</button>
    </div>
  );
}
