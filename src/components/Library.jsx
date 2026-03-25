import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { getPR } from '../utils.js';
import { PlusIcon, CheckIcon, XIcon, EditIcon, TrashIcon, LinkIcon } from '../icons.jsx';

export default function Library({ allExercises, addExercise, updateExerciseVideo, updateCustomExercise, deleteCustomExercise, deleteSharedExercise, clearAllData, getVideoUrl }) {
  const {
    data, setData, user,
    librarySearch, setLibrarySearch,
    showAddExercise, setShowAddExercise,
    newExercise, setNewExercise,
    shareToLibrary, setShareToLibrary,
    editingExercise, setEditingExercise,
    sharedExercises,
  } = useWorkout();
  const { T, S, dark } = useTheme();

  const categories = Object.keys(CATEGORY_COLORS);
  const customIds = new Set((data.customExercises || []).map(e => e.id));
  const filtered = allExercises.filter(ex =>
    librarySearch === '' ||
    ex.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <input style={S.input} placeholder="Search exercises..." value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} />
      </div>

      {!showAddExercise ? (
        <button style={S.btn('#0ea5e9')} onClick={() => setShowAddExercise(true)}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><PlusIcon /> ADD NEW EXERCISE</span>
        </button>
      ) : (
        <div style={{ ...S.card, borderColor: '#0ea5e933', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ ...S.sectionLabel, color: '#0ea5e9', marginBottom: 0 }}>NEW EXERCISE</div>
            <button onClick={() => setShowAddExercise(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><XIcon /></button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>NAME *</div>
            <input style={S.input} placeholder="e.g. Dumbbell Curl" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>CATEGORY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {categories.map(cat => {
                const catInfo = CATEGORY_COLORS[cat];
                const isSel = newExercise.category === cat;
                return (
                  <button key={cat} onClick={() => setNewExercise({ ...newExercise, category: cat })}
                    style={{ padding: '4px 10px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", background: isSel ? catInfo.accent + '20' : T.inputBg, color: isSel ? catInfo.accent : T.textMuted, border: `1px solid ${isSel ? catInfo.accent + '66' : T.borderInput}` }}>{catInfo.label}</button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>MUSCLE GROUP</div>
            <input style={S.input} placeholder="e.g. Biceps" value={newExercise.muscle} onChange={e => setNewExercise({ ...newExercise, muscle: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>VIDEO / HOW-TO LINK</div>
            <input style={S.input} placeholder="https://youtube.com/watch?v=..." value={newExercise.videoUrl} onChange={e => setNewExercise({ ...newExercise, videoUrl: e.target.value })} />
            <div style={{ fontSize: 8, color: T.textFaint, marginTop: 3 }}>YouTube, Muscle & Strength, or any URL</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: shareToLibrary ? (dark ? '#22c55e10' : '#22c55e12') : T.bgInset, borderRadius: 8, border: `1px solid ${shareToLibrary ? '#22c55e33' : T.borderInput}`, cursor: 'pointer' }}
              onClick={() => setShareToLibrary(!shareToLibrary)}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${shareToLibrary ? '#22c55e' : T.borderInput}`, background: shareToLibrary ? '#22c55e20' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
                {shareToLibrary && <CheckIcon />}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: shareToLibrary ? '#22c55e' : T.textMuted }}>Share with everyone</div>
                <div style={{ fontSize: 8, color: T.textFaint, marginTop: 1 }}>All users will see this exercise in their library</div>
              </div>
            </div>
          </div>
          <button style={S.btn('#0ea5e9')} onClick={addExercise}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CheckIcon /> SAVE EXERCISE</span>
          </button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {categories.map(cat => {
          const catInfo = CATEGORY_COLORS[cat];
          const catExercises = filtered.filter(e => e.category === cat);
          if (catExercises.length === 0) return null;

          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={S.tag(catInfo.accent)}>{catInfo.label} ({catExercises.length})</div>
              {catExercises.map(ex => {
                const isCustom = customIds.has(ex.id);
                const sharedEx = sharedExercises.find(s => s.id === ex.id);
                const isShared = !!sharedEx;
                const isOwnShared = isShared && sharedEx.addedBy === user.uid;
                const isAdmin = user.uid === 'otHWKPN34YR5SuKN9pS4jzycM1I2';
                const canDeleteShared = isShared && (isOwnShared || isAdmin);
                const videoUrl = getVideoUrl(ex);
                const pr = getPR(ex.id, data.workoutLogs);
                const isEditing = editingExercise === ex.id;

                if (isEditing) {
                  const editEx = isCustom ? (data.customExercises || []).find(e => e.id === ex.id) : ex;
                  return (
                    <div key={ex.id} style={{ ...S.card, marginBottom: 4, borderColor: '#0ea5e944' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong }}>{ex.name}</div>
                        <button onClick={() => setEditingExercise(null)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><XIcon /></button>
                      </div>
                      {isCustom && (
                        <>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1, marginBottom: 3 }}>NAME</div>
                            <input style={{ ...S.input, fontSize: 12 }} value={editEx.name}
                              onChange={e => { const updated = (data.customExercises || []).map(ce => ce.id === ex.id ? { ...ce, name: e.target.value } : ce); setData({ ...data, customExercises: updated }); }} />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1, marginBottom: 3 }}>MUSCLE GROUP</div>
                            <input style={{ ...S.input, fontSize: 12 }} value={editEx.muscle}
                              onChange={e => { const updated = (data.customExercises || []).map(ce => ce.id === ex.id ? { ...ce, muscle: e.target.value } : ce); setData({ ...data, customExercises: updated }); }} />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1, marginBottom: 3 }}>CATEGORY</div>
                            <select style={{ ...S.input, fontSize: 12 }} value={editEx.category || 'strength'}
                              onChange={e => { const updated = (data.customExercises || []).map(ce => ce.id === ex.id ? { ...ce, category: e.target.value } : ce); setData({ ...data, customExercises: updated }); }}>
                              <option value="strength">Strength</option>
                              <option value="cardio">Cardio</option>
                              <option value="mobility">Mobility</option>
                            </select>
                          </div>
                        </>
                      )}
                      {!isCustom && <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 8, fontStyle: 'italic' }}>Built-in exercise — only the video link can be changed</div>}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1, marginBottom: 3 }}>VIDEO / HOW-TO LINK</div>
                        <input id={`video-${ex.id}`} style={{ ...S.input, fontSize: 11 }} defaultValue={videoUrl} placeholder="https://..." />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ ...S.btn('#0ea5e9'), padding: '8px 14px', fontSize: 10 }}
                          onClick={() => {
                            const urlInput = document.getElementById(`video-${ex.id}`);
                            const newUrl = urlInput ? urlInput.value.trim() : videoUrl;
                            if (isCustom) {
                              const current = (data.customExercises || []).find(ce => ce.id === ex.id);
                              updateCustomExercise(ex.id, { name: current.name, muscle: current.muscle, category: current.category || 'strength', videoUrl: newUrl });
                            } else {
                              updateExerciseVideo(ex.id, newUrl);
                            }
                          }}>SAVE</button>
                        <button onClick={() => setEditingExercise(null)} style={{ ...S.btnOutline('#555'), padding: '8px 14px', fontSize: 10, width: 'auto' }}>CANCEL</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={ex.id} style={{ ...S.card, marginBottom: 4, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? '#ddd' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                          {isCustom && <span style={{ fontSize: 7, color: '#0ea5e9', background: '#0ea5e915', padding: '1px 5px', borderRadius: 3, letterSpacing: 0.5, fontWeight: 700 }}>CUSTOM</span>}
                          {isShared && <span style={{ fontSize: 7, color: '#22c55e', background: '#22c55e15', padding: '1px 5px', borderRadius: 3, letterSpacing: 0.5, fontWeight: 700 }}>SHARED</span>}
                        </div>
                        <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>
                          {ex.muscle}
                          {isShared && sharedEx.addedByName && <span style={{ color: T.textFaint }}> · added by {sharedEx.addedByName}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                          {videoUrl ? (
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#0ea5e9', textDecoration: 'none' }}>
                              <LinkIcon /> How-to video
                            </a>
                          ) : <span style={{ fontSize: 9, color: T.textFaint }}>No video linked</span>}
                          {pr && <span style={{ fontSize: 9, color: '#22c55e' }}>PR: {pr} lb</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <button onClick={() => setEditingExercise(ex.id)}
                          style={{ background: 'none', border: `1px solid ${T.borderInput}`, borderRadius: 5, color: T.textMuted, cursor: 'pointer', padding: '5px 7px', display: 'flex', alignItems: 'center' }}>
                          <EditIcon />
                        </button>
                        {isCustom && (
                          <button onClick={() => deleteCustomExercise(ex.id)}
                            style={{ background: 'none', border: '1px solid #e9456022', borderRadius: 5, color: '#e94560', cursor: 'pointer', padding: '5px 7px', display: 'flex', alignItems: 'center' }}>
                            <TrashIcon />
                          </button>
                        )}
                        {canDeleteShared && !isCustom && (
                          <button onClick={() => { if (confirm(`Remove "${ex.name}" from the shared library?`)) deleteSharedExercise(ex.id); }}
                            style={{ background: 'none', border: '1px solid #e9456022', borderRadius: 5, color: '#e94560', cursor: 'pointer', padding: '5px 7px', display: 'flex', alignItems: 'center' }}>
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: 12, background: T.bgCard, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 9, color: T.textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: T.textMuted }}>Built-in exercises</strong> — edit the video link anytime.<br />
          <strong style={{ color: '#0ea5e9' }}>Custom exercises</strong> — private to you, fully editable and deletable.<br />
          <strong style={{ color: '#22c55e' }}>Shared exercises</strong> — visible to all users. You can delete ones you added.
        </div>
      </div>

      <div style={{ marginTop: 40, padding: 14, borderRadius: 8, border: '1px solid #e9456022' }}>
        <div style={{ fontSize: 9, color: '#e94560', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>⚠ DANGER ZONE</div>
        <button onClick={() => {
          if (confirm('This will permanently delete ALL your workout data, custom exercises, and history. This cannot be undone.\n\nAre you sure?')) {
            if (confirm('FINAL WARNING: You are about to erase everything. Type-level confirmation — really delete all data?')) {
              clearAllData();
            }
          }
        }} style={{ background: 'none', border: '1px solid #e9456033', borderRadius: 6, color: '#e94560', cursor: 'pointer', padding: '8px 14px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
          RESET ALL DATA
        </button>
      </div>
    </div>
  );
}
