import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { formatDate } from '../utils.js';
import { softDelete as softDel } from '../constants.js';
import {
  HistoryIcon, EditIcon, CopyIcon, CalendarIcon, TrashIcon,
  MapPinIcon, ChevronIcon,
} from '../icons.jsx';

export default function History({ allExercises, convertLogToPlannedWorkout, restoreFromTrash, emptyTrash }) {
  const {
    data, setData, persist, setView,
    activeWorkout, setActiveWorkout,
    editingLogIdx, setEditingLogIdx,
    editingLogName, setEditingLogName,
    expandedLogIdx, setExpandedLogIdx,
    copiedIdx, setCopiedIdx,
  } = useWorkout();
  const { T, S } = useTheme();

  const logs = [...data.workoutLogs].map((log, idx) => ({ ...log, _idx: idx })).reverse();
  const formatFullDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const deleteWorkout = (idx) => {
    const deletedItem = softDel(data.workoutLogs[idx], 'workout');
    const updatedLogs = data.workoutLogs.filter((_, i) => i !== idx);
    const trash = [...(data.recentlyDeleted || []), deletedItem];
    persist({ ...data, workoutLogs: updatedLogs, recentlyDeleted: trash });
    setExpandedLogIdx(null);
  };

  const editWorkout = (idx) => {
    const log = data.workoutLogs[idx];
    setActiveWorkout({ ...log });
    setEditingLogIdx(idx);
    setView('active');
  };

  const exportWorkout = (log) => {
    const fullDate = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    let text = `${log.name}\n${fullDate}\n`;
    if (log.location) text += `📍 ${log.location}\n`;
    text += `${'─'.repeat(30)}\n`;
    if (log.warmupNotes) text += `\nWarmup: ${log.warmupNotes}\n`;
    text += `\n`;

    log.exercises.forEach((ex, i) => {
      const catLabel = (CATEGORY_COLORS[ex.category] || {}).label || ex.category;
      text += `${i + 1}. ${ex.name} [${catLabel}]\n`;

      if (ex.isCardio) {
        const stats = [];
        if (ex.duration > 0) stats.push(`${ex.duration} min`);
        if (ex.distance > 0) stats.push(`${ex.distance} mi`);
        if (ex.calories > 0) stats.push(`${ex.calories} cal`);
        if (ex.avgHeartRate > 0) stats.push(`${ex.avgHeartRate} avg bpm`);
        if (stats.length > 0) text += `   ${stats.join(' · ')}\n`;
      } else if (ex.isCarry) {
        const completedCarrySets = (ex.sets || []).filter(s => s.completed);
        completedCarrySets.forEach((set, i) => {
          const parts = [];
          if (set.weight > 0) parts.push(`${set.weight} lb`);
          if (set.laps > 0) parts.push(`${set.laps} lap${set.laps !== 1 ? 's' : ''}`);
          if (set.distance) parts.push(set.distance);
          text += `   Set ${i + 1}: ${parts.join(' · ')}\n`;
        });
      } else if (ex.isTabata) {
        const completedRounds = (ex.rounds || []).filter(r => r.completed).length;
        text += `   ${completedRounds} round${completedRounds !== 1 ? 's' : ''} · 20s on / 10s off\n`;
      } else {
        if ((ex.warmupSets || []).length > 0 && ex.warmupWeight > 0) {
          const warmupReps = (ex.warmupSets || []).filter(s => s.completed).map(s => s.reps);
          if (warmupReps.length > 0) text += `   Warmup: ${ex.warmupWeight}lb × ${warmupReps.join(', ')} reps\n`;
        }
        const workingSets = (ex.workingSets || ex.sets || []).filter(s => s.completed);
        if (workingSets.length > 0) {
          const setStrs = workingSets.map(s => `${s.weight || ex.workingWeight || 0}lb × ${s.reps}`);
          text += `   Working: ${setStrs.join(' | ')}\n`;
        }
        const skipped = (ex.workingSets || ex.sets || []).filter(s => !s.completed).length;
        if (skipped > 0) text += `   (${skipped} set${skipped > 1 ? 's' : ''} skipped)\n`;
      }
      if (ex.notes) text += `   Notes: ${ex.notes}\n`;
      text += `\n`;
    });

    text += `${'─'.repeat(30)}\n`;
    if (log.cooldownNotes) text += `Cooldown: ${log.cooldownNotes}\n`;
    const totalWorking = log.exercises.reduce((s, ex) => s + (ex.workingSets || ex.sets || []).filter(s => s.completed).length, 0);
    text += `${log.exercises.length} exercises · ${totalWorking} working sets\n`;
    text += `Tracked with GetNerdyIn30.com`;
    return text;
  };

  const copyWorkout = async (log) => {
    const text = exportWorkout(log);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(log._idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedIdx(log._idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const shareWorkout = async (log) => {
    const text = exportWorkout(log);
    if (navigator.share) {
      try { await navigator.share({ title: log.name, text }); } catch {}
    } else {
      copyWorkout(log);
    }
  };

  return (
    <div>
      <div style={{ ...S.sectionLabel, color: T.textMuted, marginBottom: 14 }}>
        <HistoryIcon /> WORKOUT HISTORY ({logs.length})
      </div>

      {logs.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 30, color: T.textFaint }}>
          <div style={{ fontSize: 12 }}>No workouts logged yet</div>
          <div style={{ fontSize: 10, marginTop: 4 }}>Complete your first workout to see it here</div>
        </div>
      ) : logs.map((log) => {
        const isExpanded = expandedLogIdx === log._idx;
        const totalWorkingSets = log.exercises.reduce((s, ex) => s + (ex.workingSets || ex.sets || []).filter(set => set.completed).length, 0);

        return (
          <div key={log._idx} style={{ ...S.card, padding: 0, marginBottom: 8, overflow: 'hidden' }}>
            <div onClick={() => setExpandedLogIdx(isExpanded ? null : log._idx)}
              style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {editingLogName && editingLogName.idx === log._idx ? (
                    <input autoFocus
                      style={{ ...S.input, fontSize: 13, fontWeight: 700, padding: '2px 6px', width: '100%' }}
                      value={editingLogName.name}
                      onChange={e => setEditingLogName({ ...editingLogName, name: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const updatedLogs = [...data.workoutLogs];
                          updatedLogs[log._idx] = { ...updatedLogs[log._idx], name: editingLogName.name.trim() || log.name };
                          persist({ ...data, workoutLogs: updatedLogs });
                          setEditingLogName(null);
                        }
                        if (e.key === 'Escape') setEditingLogName(null);
                      }}
                      onBlur={() => {
                        const updatedLogs = [...data.workoutLogs];
                        updatedLogs[log._idx] = { ...updatedLogs[log._idx], name: editingLogName.name.trim() || log.name };
                        persist({ ...data, workoutLogs: updatedLogs });
                        setEditingLogName(null);
                      }}
                      onClick={e => e.stopPropagation()} />
                  ) : (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.textStrong }}>{log.name}</span>
                      <button onClick={e => { e.stopPropagation(); setEditingLogName({ idx: log._idx, name: log.name }); }}
                        style={{ background: 'none', border: 'none', color: T.textFaint, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                        <EditIcon />
                      </button>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{formatFullDate(log.date)}</div>
                {log.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <span style={{ color: '#0ea5e9' }}><MapPinIcon /></span>
                    <span style={{ fontSize: 9, color: '#0ea5e9' }}>{log.location}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e94560' }}>{log.exercises.length} exercises</div>
                  <div style={{ fontSize: 9, color: T.textMuted }}>{totalWorkingSets} sets</div>
                </div>
                <span style={{ color: T.textMuted }}><ChevronIcon down={isExpanded} /></span>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                {log.warmupNotes && (
                  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.borderSubtle}`, background: T.bgInset }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.5, marginBottom: 4 }}>WARMUP</div>
                    <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{log.warmupNotes}</div>
                  </div>
                )}

                {log.exercises.map((ex, exIdx) => {
                  const catInfo = CATEGORY_COLORS[ex.category] || { accent: '#888', label: ex.category };

                  if (ex.isCardio) return (
                    <div key={exIdx} style={{ padding: '12px 16px', borderBottom: exIdx < log.exercises.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                      <div style={S.tag(catInfo.accent)}>{catInfo.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 4, marginBottom: 8 }}>{ex.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                        {ex.duration > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: '#ff6b35' }}>{ex.duration}</div><div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5 }}>MIN</div></div>}
                        {ex.distance > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: '#ff6b35' }}>{ex.distance}</div><div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5 }}>MI</div></div>}
                        {ex.calories > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: '#ff6b35' }}>{ex.calories}</div><div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5 }}>CAL</div></div>}
                        {ex.avgHeartRate > 0 && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: '#e94560' }}>{ex.avgHeartRate}</div><div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5 }}>BPM</div></div>}
                      </div>
                      {ex.notes && <div style={{ marginTop: 8, padding: '6px 10px', background: T.bgInset, borderRadius: 6, fontSize: 10, color: T.textMuted, lineHeight: 1.5, fontStyle: 'italic' }}>{ex.notes}</div>}
                    </div>
                  );

                  if (ex.isCarry) {
                    const completedSetsCarry = (ex.sets || []).filter(s => s.completed);
                    return (
                      <div key={exIdx} style={{ padding: '12px 16px', borderBottom: exIdx < log.exercises.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                        <div style={S.tag('#ec4899')}>Carry</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 4, marginBottom: 8 }}>{ex.name}</div>
                        {completedSetsCarry.map((set, i) => (
                          <div key={i} style={{ fontSize: 10, color: T.textMuted, marginBottom: 3 }}>
                            <span style={{ color: '#ec4899', fontWeight: 600, fontSize: 9 }}>SET {i + 1}</span>{' '}
                            {set.weight > 0 && <span>{set.weight} lb</span>}
                            {set.laps > 0 && <span> · {set.laps} {set.laps === 1 ? 'lap' : 'laps'}</span>}
                            {set.distance && <span> · {set.distance}</span>}
                          </div>
                        ))}
                        {completedSetsCarry.length === 0 && <div style={{ fontSize: 9, color: T.textFaint, fontStyle: 'italic' }}>No sets completed</div>}
                        {ex.notes && <div style={{ marginTop: 6, padding: '6px 10px', background: T.bgInset, borderRadius: 6, fontSize: 10, color: T.textMuted, lineHeight: 1.5, fontStyle: 'italic' }}>{ex.notes}</div>}
                      </div>
                    );
                  }

                  if (ex.isTabata) {
                    const completedRounds = (ex.rounds || []).filter(r => r.completed).length;
                    return (
                      <div key={exIdx} style={{ padding: '12px 16px', borderBottom: exIdx < log.exercises.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                        <div style={S.tag('#a855f7')}>Tabata</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 4, marginBottom: 6 }}>{ex.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9, color: '#a855f7', fontWeight: 600 }}>ROUNDS</span>
                          <span style={{ fontSize: 22, fontWeight: 800, color: '#a855f7' }}>{completedRounds}</span>
                          <span style={{ fontSize: 9, color: T.textFaint }}>× 20s on / 10s off</span>
                        </div>
                        {ex.notes && <div style={{ marginTop: 6, padding: '6px 10px', background: T.bgInset, borderRadius: 6, fontSize: 10, color: T.textMuted, lineHeight: 1.5, fontStyle: 'italic' }}>{ex.notes}</div>}
                      </div>
                    );
                  }

                  // Strength
                  const maxSetWeight = Math.max(ex.workingWeight || 0, ...(ex.workingSets || ex.sets || []).map(s => s.weight || 0));
                  return (
                    <div key={exIdx} style={{ padding: '12px 16px', borderBottom: exIdx < log.exercises.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={S.tag(catInfo.accent)}>{catInfo.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 4 }}>{ex.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: catInfo.accent }}>{maxSetWeight}</div>
                          <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 0.5 }}>LB MAX</div>
                        </div>
                      </div>
                      {(ex.warmupSets || []).length > 0 && ex.warmupWeight > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>WARMUP</span>
                          <span style={{ fontSize: 10, color: T.textMuted }}>{ex.warmupWeight} lb × {(ex.warmupSets || []).filter(s => s.completed).map(s => s.reps).join(', ')} reps</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>WORKING</span>
                        <span style={{ fontSize: 10, color: T.textMuted }}>
                          {(ex.workingSets || ex.sets || []).filter(s => s.completed).map(s => `${s.weight || ex.workingWeight || 0}lb × ${s.reps}`).join(' · ')}
                        </span>
                      </div>
                      {(ex.workingSets || ex.sets || []).filter(s => !s.completed).length > 0 && (
                        <div style={{ fontSize: 9, color: T.textFaint, fontStyle: 'italic' }}>{(ex.workingSets || ex.sets || []).filter(s => !s.completed).length} set(s) skipped</div>
                      )}
                      {ex.notes && <div style={{ marginTop: 6, padding: '6px 10px', background: T.bgInset, borderRadius: 6, fontSize: 10, color: T.textMuted, lineHeight: 1.5, fontStyle: 'italic' }}>{ex.notes}</div>}
                    </div>
                  );
                })}

                {log.cooldownNotes && (
                  <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.borderSubtle}`, background: T.bgInset }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#8b5cf6', letterSpacing: 1.5, marginBottom: 4 }}>COOLDOWN</div>
                    <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{log.cooldownNotes}</div>
                  </div>
                )}

                <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.borderSubtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={e => { e.stopPropagation(); editWorkout(log._idx); }}
                      style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EditIcon /> EDIT
                    </button>
                    <button onClick={e => { e.stopPropagation(); shareWorkout(log); }}
                      style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CopyIcon /> {copiedIdx === log._idx ? 'COPIED ✓' : 'SHARE'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); convertLogToPlannedWorkout(log); }}
                      style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarIcon /> PLAN AGAIN
                    </button>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete this workout from ' + formatDate(log.date) + '?')) deleteWorkout(log._idx); }}
                    style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrashIcon /> DELETE
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Recently Deleted */}
      {(data.recentlyDeleted || []).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ ...S.sectionLabel, color: '#e94560', marginBottom: 10 }}>
            <TrashIcon /> RECENTLY DELETED ({(data.recentlyDeleted || []).length})
          </div>
          <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 10 }}>Items are kept for 30 days, then permanently removed.</div>
          {(data.recentlyDeleted || []).sort((a, b) => b.deletedAt - a.deletedAt).map((item, i) => {
            const typeLabels = { workout: 'WORKOUT', planned: 'PLANNED', template: 'TEMPLATE' };
            const typeColors = { workout: '#22c55e', planned: '#0ea5e9', template: '#f59e0b' };
            const daysAgo = Math.floor((Date.now() - item.deletedAt) / (24 * 60 * 60 * 1000));
            const daysLeft = 30 - daysAgo;
            const itemName = item.name || 'Untitled';
            const itemDate = item.date ? formatDate(item.date) : '';
            const exerciseCount = item.exercises ? item.exercises.length : (item.exerciseIds ? item.exerciseIds.length : 0);

            return (
              <div key={item.deletedAt + '-' + i} style={{ ...S.card, padding: '12px 14px', marginBottom: 6, opacity: 0.7, borderColor: '#e9456022' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 7, color: typeColors[item._type] || '#888', background: (typeColors[item._type] || '#888') + '15', padding: '1px 6px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>{typeLabels[item._type] || 'ITEM'}</span>
                      <span style={{ fontSize: 8, color: T.textFaint }}>{daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : daysAgo + ' days ago'} · {daysLeft}d left</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>{itemName}</div>
                    <div style={{ fontSize: 9, color: T.textFaint, marginTop: 2 }}>
                      {itemDate && <span>{itemDate} · </span>}
                      {exerciseCount > 0 && <span>{exerciseCount} exercises</span>}
                    </div>
                  </div>
                  <button onClick={() => restoreFromTrash(item.deletedAt)}
                    style={{ ...S.btn('#22c55e'), width: 'auto', padding: '8px 14px', fontSize: 9 }}>RESTORE</button>
                </div>
              </div>
            );
          })}
          <button onClick={emptyTrash} style={{ ...S.btnOutline('#e94560'), marginTop: 8, fontSize: 9, opacity: 0.5, padding: '8px 14px' }}>EMPTY TRASH</button>
        </div>
      )}
    </div>
  );
}
