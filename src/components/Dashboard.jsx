import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { getLastWorkingWeight, getLastWarmupWeight, getProgressionSuggestion, formatDate, getPR } from '../utils.js';
import {
  PlusIcon, CheckIcon, XIcon, TrashIcon, EditIcon, CopyIcon,
  CalendarIcon, TemplateIcon, ArrowLeftIcon, ArrowRightIcon,
  MapPinIcon, PlayIcon, ArrowUpSmall, ArrowDownSmall, ChevronIcon,
} from '../icons.jsx';

export default function Dashboard({
  allExercises, startWorkout, getRecentGyms,
  openPlanEditor, updatePlannedWorkout, startPlannedWorkout, deletePlannedWorkout, duplicatePlannedWorkout,
  savePlannedWorkout, openTemplateEditor, updateTemplate, startFromTemplate, deleteTemplate,
}) {
  const {
    data, persist, setView,
    activeWorkout,
    workoutDate,
    planningDate, setPlanningDate,
    editingPlan, setEditingPlan,
    planName, setPlanName,
    planExerciseConfigs, setPlanExerciseConfigs,
    planWarmup, setPlanWarmup,
    planCooldown, setPlanCooldown,
    editingTemplate, setEditingTemplate,
    tplName, setTplName,
    tplExerciseConfigs, setTplExerciseConfigs,
    tplWarmup, setTplWarmup,
    tplCooldown, setTplCooldown,
    calendarMonth, setCalendarMonth,
    calendarSelectedDate, setCalendarSelectedDate,
    expandedLogIdx, setExpandedLogIdx,
    setBuildingTemplate,
    moveItem,
    exerciseSearch, setExerciseSearch,
  } = useWorkout();
  const { T, S, dark } = useTheme();

    const totalWorkouts = data.workoutLogs.length;
    const totalSets = data.workoutLogs.reduce((sum, log) =>
      sum + log.exercises.reduce((s, ex) => (ex.warmupSets || []).filter(s => s.completed).length + (ex.workingSets || ex.sets || []).filter(s => s.completed).length, 0), 0);
    const prCount = allExercises.filter(ex => data.workoutLogs.some(log => log.exercises.find(e => e.exerciseId === ex.id))).length;

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "WORKOUTS", value: totalWorkouts, color: "#e94560" },
            { label: "SETS", value: totalSets, color: "#f59e0b" },
            { label: "PRs", value: prCount, color: "#22c55e" },
          ].map(stat => (
            <div key={stat.label} style={{ ...S.card, textAlign: "center", padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 2, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <button style={S.btn()} onClick={() => setView("build")}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><PlusIcon /> START NEW WORKOUT</span>
        </button>

        <button style={{ ...S.btnOutline("#f59e0b"), marginTop: 8 }} onClick={() => {
          setBuildingTemplate({ name: "", location: "", exercises: [] });
          setView("buildTemplate");
        }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><TemplateIcon /> CREATE TEMPLATE</span>
        </button>

        {/* Upcoming Planned Workouts */}
        {(() => {
          const now = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const upcoming = (data.plannedWorkouts || [])
            .filter(p => p.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));
          if (upcoming.length === 0) return null;
          return (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 8, color: "#0ea5e9", letterSpacing: 1.5, marginBottom: 6 }}>UPCOMING PLANNED WORKOUTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {upcoming.map(plan => {
                  const planDate = new Date(plan.date + "T12:00:00");
                  const dayLabel = planDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  const isToday = plan.date === today;
                  return (
                    <div key={plan.id} style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openPlanEditor(plan)}
                        style={{ ...S.card, flex: 1, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${isToday ? "#0ea5e944" : "#0ea5e922"}`, background: isToday ? (dark ? "#0ea5e908" : "#0ea5e906") : T.bgCard }}>
                        <span style={{ color: "#0ea5e9" }}><CalendarIcon /></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong }}>{plan.name}</div>
                            {isToday && <span style={{ fontSize: 7, color: "#0ea5e9", background: "#0ea5e915", padding: "1px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>TODAY</span>}
                          </div>
                          <div style={{ fontSize: 9, color: T.textMuted, marginTop: 1 }}>
                            {dayLabel} · {plan.exerciseIds.length} exercises
                          </div>
                          <div style={{ fontSize: 9, color: T.textFaint, marginTop: 2 }}>
                            {plan.exerciseIds.map(id => allExercises.find(e => e.id === id)?.name).filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      </button>
                      <button onClick={() => duplicatePlannedWorkout(plan)}
                        style={{ background: "none", border: `1px solid #0ea5e915`, borderRadius: 10, color: "#0ea5e9", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", opacity: 0.5 }}>
                        <CopyIcon />
                      </button>
                      <button onClick={() => { if (confirm("Delete planned workout \"" + plan.name + "\"?")) deletePlannedWorkout(plan.id); }}
                        style={{ background: "none", border: `1px solid #e9456015`, borderRadius: 10, color: "#e94560", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", opacity: 0.5 }}>
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── PLAN EDITOR ── */}
        {editingPlan && planningDate && (
          <div style={{ ...S.card, padding: 0, marginTop: 14, borderColor: "#0ea5e933" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1 }}>EDIT PLAN — {new Date(editingPlan.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <button onClick={() => { setEditingPlan(null); setPlanningDate(null); setPlanExerciseConfigs([]); setPlanName(""); setPlanWarmup(""); setPlanCooldown(""); setExerciseSearch(""); }}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><XIcon /></button>
            </div>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>WORKOUT NAME</div>
              <input style={{ ...S.input, fontSize: 12 }} placeholder="Auto-generates from exercises" value={planName} onChange={e => setPlanName(e.target.value)} />
            </div>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 1, marginBottom: 4 }}>WARMUP</div>
              <textarea style={{ ...S.input, fontSize: 11, minHeight: 36, resize: "vertical", lineHeight: 1.5, padding: "8px 10px", borderColor: "#f59e0b15" }}
                placeholder="e.g. Leg swings, TRX squat & row..."
                value={planWarmup} onChange={e => setPlanWarmup(e.target.value)} />
            </div>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div style={{ fontSize: 9, color: "#8b5cf6", letterSpacing: 1, marginBottom: 4 }}>COOLDOWN</div>
              <textarea style={{ ...S.input, fontSize: 11, minHeight: 36, resize: "vertical", lineHeight: 1.5, padding: "8px 10px", borderColor: "#8b5cf615" }}
                placeholder="e.g. Tabata finisher, stretching..."
                value={planCooldown} onChange={e => setPlanCooldown(e.target.value)} />
            </div>

            <div style={{ padding: "8px 12px 4px" }}>
              <input type="text" placeholder="🔍 Search exercises..." value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                style={{ ...S.input, fontSize: 11, padding: "7px 10px", width: "100%", borderColor: "#0ea5e933" }} />
            </div>

            <div style={{ maxHeight: 350, overflowY: "auto", padding: "8px 0" }}>
              {(() => {
                const searchTerm = exerciseSearch.toLowerCase().trim();
                const filtered = searchTerm ? allExercises.filter(e => e.name.toLowerCase().includes(searchTerm) || e.muscle.toLowerCase().includes(searchTerm) || (e.category || "").toLowerCase().includes(searchTerm)) : allExercises;
                const categories = [...new Set(filtered.map(e => e.category))];
                return categories.map(cat => {
                  const catExercises = filtered.filter(e => e.category === cat);
                  const catInfo = CATEGORY_COLORS[cat] || { accent: "#888", label: cat };
                  return (
                    <div key={cat} style={{ padding: "0 12px" }}>
                      <div style={{ ...S.tag(catInfo.accent), marginTop: 8, marginBottom: 4 }}>{catInfo.label}</div>
                      {catExercises.map(ex => {
                        const config = planExerciseConfigs.find(c => c.exerciseId === ex.id);
                        const selected = !!config;
                        const isCardio = ex.isCardio || ex.category === "cardio";
                        const lastWeight = isCardio ? null : getLastWorkingWeight(ex.id, data.workoutLogs);
                        const lastWarmup = isCardio ? null : getLastWarmupWeight(ex.id, data.workoutLogs);
                        const suggestion = isCardio ? null : getProgressionSuggestion(ex.id, data.workoutLogs);

                        const toggleExercise = (e) => {
                          e.stopPropagation();
                          if (selected) {
                            setPlanExerciseConfigs(prev => prev.filter(c => c.exerciseId !== ex.id));
                          } else {
                            setPlanExerciseConfigs(prev => [...prev, {
                              exerciseId: ex.id,
                              targetWeight: lastWeight || 0,
                              warmupWeight: lastWarmup || (lastWeight > 0 ? Math.round(lastWeight * 0.5 / 5) * 5 : 0),
                              targetSets: 3,
                              targetReps: 12,
                            }]);
                          }
                        };

                        const updateConfig = (field, value) => {
                          setPlanExerciseConfigs(prev => prev.map(c =>
                            c.exerciseId === ex.id ? { ...c, [field]: value } : c
                          ));
                        };

                        return (
                          <div key={ex.id} style={{ borderRadius: 6, marginBottom: 2, background: selected ? (dark ? "#0ea5e908" : "#0ea5e906") : "transparent" }}>
                            <div onClick={toggleExercise}
                              style={{ padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.textStrong : T.textMuted }}>{ex.name}</div>
                                <div style={{ fontSize: 9, color: T.textFaint, marginTop: 1 }}>
                                  {ex.muscle}
                                  {!isCardio && lastWeight > 0 && <span style={{ color: T.textMuted }}> · Last: {lastWeight} lb</span>}
                                  {!isCardio && suggestion && <span style={{ color: "#22c55e" }}> · Suggested: {suggestion} lb</span>}
                                </div>
                              </div>
                              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? "#0ea5e9" : T.borderInput}`, background: selected ? "#0ea5e920" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0ea5e9", flexShrink: 0 }}>
                                {selected && <CheckIcon />}
                              </div>
                            </div>

                            {selected && !isCardio && (
                              <div style={{ padding: "4px 12px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}
                                onClick={e => e.stopPropagation()}>
                                <div style={{ flex: 1, minWidth: 70 }}>
                                  <div style={{ fontSize: 7, color: "#f59e0b", letterSpacing: 0.5, marginBottom: 2 }}>WARMUP</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={config.warmupWeight || ""} placeholder="0"
                                      onChange={e => updateConfig("warmupWeight", Number(e.target.value) || 0)}
                                      style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#f59e0b60" }} />
                                    <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                  </div>
                                </div>
                                <div style={{ flex: 1, minWidth: 70 }}>
                                  <div style={{ fontSize: 7, color: "#22c55e", letterSpacing: 0.5, marginBottom: 2 }}>WORKING</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={config.targetWeight || ""} placeholder="0"
                                      onChange={e => updateConfig("targetWeight", Number(e.target.value) || 0)}
                                      style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#22c55e60" }} />
                                    <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                  </div>
                                </div>
                                <div style={{ flex: 0.6, minWidth: 50 }}>
                                  <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>SETS</div>
                                  <input type="number" value={config.targetSets || ""} placeholder="3"
                                    onChange={e => updateConfig("targetSets", Number(e.target.value) || 0)}
                                    style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                </div>
                                <div style={{ flex: 0.6, minWidth: 50 }}>
                                  <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>REPS</div>
                                  <input type="number" value={config.targetReps || ""} placeholder="12"
                                    onChange={e => updateConfig("targetReps", Number(e.target.value) || 0)}
                                    style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>

            {planExerciseConfigs.length > 1 && (
              <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{ fontSize: 8, color: "#0ea5e9", letterSpacing: 1.5, marginBottom: 6 }}>EXERCISE ORDER</div>
                {planExerciseConfigs.map((cfg, idx) => {
                  const ex = allExercises.find(e => e.id === cfg.exerciseId);
                  return (
                    <div key={cfg.exerciseId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: idx < planExerciseConfigs.length - 1 ? `1px solid ${T.borderSubtle}` : "none" }}>
                      <span style={{ fontSize: 9, color: T.textFaint, width: 16, textAlign: "center", fontWeight: 700 }}>{idx + 1}</span>
                      <span style={{ flex: 1, fontSize: 11, color: T.textStrong, fontWeight: 600 }}>{ex?.name || "Unknown"}</span>
                      <button onClick={() => idx > 0 && setPlanExerciseConfigs(moveItem(planExerciseConfigs, idx, idx - 1))}
                        style={{ background: "none", border: "none", color: idx > 0 ? "#0ea5e9" : T.borderInput, cursor: idx > 0 ? "pointer" : "default", padding: 4 }}>
                        <ArrowUpSmall />
                      </button>
                      <button onClick={() => idx < planExerciseConfigs.length - 1 && setPlanExerciseConfigs(moveItem(planExerciseConfigs, idx, idx + 1))}
                        style={{ background: "none", border: "none", color: idx < planExerciseConfigs.length - 1 ? "#0ea5e9" : T.borderInput, cursor: idx < planExerciseConfigs.length - 1 ? "pointer" : "default", padding: 4 }}>
                        <ArrowDownSmall />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {planExerciseConfigs.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.borderSubtle}`, display: "flex", gap: 8 }}>
                <button onClick={updatePlannedWorkout}
                  style={{ ...S.btn("#0ea5e9"), flex: 1, padding: "12px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>SAVE CHANGES</span>
                </button>
                <button onClick={() => {
                  // Build the updated plan object locally — don't call updatePlannedWorkout()
                  // which clears state before startPlannedWorkout can read it
                  const exerciseIds = planExerciseConfigs.map(c => c.exerciseId);
                  let finalName = planName.trim();
                  if (!finalName) {
                    const cats = [...new Set(exerciseIds.map(id => {
                      const ex = allExercises.find(e => e.id === id);
                      return ex ? (CATEGORY_COLORS[ex.category]?.label || ex.category) : null;
                    }).filter(Boolean))];
                    finalName = cats.join(" + ") || "Workout";
                  }
                  const updated = { ...editingPlan, name: finalName, exerciseIds, exerciseConfigs: planExerciseConfigs, warmupNotes: planWarmup, cooldownNotes: planCooldown };
                  // Save the updated plan first, then start it
                  const remaining = (data.plannedWorkouts || []).map(p => p.id === editingPlan.id ? updated : p);
                  persist({ ...data, plannedWorkouts: remaining });
                  setEditingPlan(null);
                  setPlanningDate(null);
                  setPlanExerciseConfigs([]);
                  setPlanName("");
                  setPlanWarmup("");
                  setPlanCooldown("");
                  startPlannedWorkout(updated);
                }}
                  style={{ ...S.btn("#22c55e"), flex: 1, padding: "12px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><PlayIcon /> START</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates - Recurring Routines */}
        {(data.templates || []).length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 8, color: T.textFaint, letterSpacing: 1.5, marginBottom: 6 }}>TEMPLATES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(data.templates || []).map(tpl => (
                <div key={tpl.id} style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openTemplateEditor(tpl)}
                    style={{ ...S.card, flex: 1, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${dark ? "#f59e0b22" : "#f59e0b33"}` }}>
                    <span style={{ color: "#f59e0b" }}><TemplateIcon /></span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong }}>{tpl.name}</div>
                      <div style={{ fontSize: 9, color: T.textMuted, marginTop: 1 }}>
                        {tpl.exerciseIds.length} exercises{tpl.location ? ` · ${tpl.location}` : ""}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => { if (confirm("Delete template \"" + tpl.name + "\"?")) deleteTemplate(tpl.id); }}
                    style={{ background: "none", border: `1px solid #e9456015`, borderRadius: 10, color: "#e94560", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", opacity: 0.5 }}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TEMPLATE EDITOR ── */}
        {editingTemplate && (
          <div style={{ ...S.card, padding: 0, marginTop: 14, borderColor: "#f59e0b33" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1 }}>EDIT TEMPLATE</span>
              <button onClick={() => { setEditingTemplate(null); setTplName(""); setTplExerciseConfigs([]); }}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><XIcon /></button>
            </div>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>TEMPLATE NAME</div>
              <input style={{ ...S.input, fontSize: 12 }} placeholder="Auto-generates from exercises" value={tplName} onChange={e => setTplName(e.target.value)} />
            </div>

            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 1, marginBottom: 4 }}>WARMUP NOTES</div>
                <textarea value={tplWarmup} onChange={e => setTplWarmup(e.target.value)}
                  placeholder="e.g. Leg swings, TRX squats..."
                  style={{ ...S.input, fontSize: 10, minHeight: 40, resize: "vertical" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#8b5cf6", letterSpacing: 1, marginBottom: 4 }}>COOLDOWN NOTES</div>
                <textarea value={tplCooldown} onChange={e => setTplCooldown(e.target.value)}
                  placeholder="e.g. Stretching, foam roll..."
                  style={{ ...S.input, fontSize: 10, minHeight: 40, resize: "vertical" }} />
              </div>
            </div>

            <div style={{ padding: "8px 12px 4px" }}>
              <input type="text" placeholder="🔍 Search exercises..." value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                style={{ ...S.input, fontSize: 11, padding: "7px 10px", width: "100%", borderColor: "#0ea5e933" }} />
            </div>

            <div style={{ maxHeight: 350, overflowY: "auto", padding: "8px 0" }}>
              {(() => {
                const searchTerm = exerciseSearch.toLowerCase().trim();
                const filtered = searchTerm ? allExercises.filter(e => e.name.toLowerCase().includes(searchTerm) || e.muscle.toLowerCase().includes(searchTerm) || (e.category || "").toLowerCase().includes(searchTerm)) : allExercises;
                const categories = [...new Set(filtered.map(e => e.category))];
                return categories.map(cat => {
                  const catExercises = filtered.filter(e => e.category === cat);
                  const catInfo = CATEGORY_COLORS[cat] || { accent: "#888", label: cat };
                  return (
                    <div key={cat} style={{ padding: "0 12px" }}>
                      <div style={{ ...S.tag(catInfo.accent), marginTop: 8, marginBottom: 4 }}>{catInfo.label}</div>
                      {catExercises.map(ex => {
                        const config = tplExerciseConfigs.find(c => c.exerciseId === ex.id);
                        const selected = !!config;
                        const isCardio = ex.isCardio || ex.category === "cardio";
                        const lastWeight = isCardio ? null : getLastWorkingWeight(ex.id, data.workoutLogs);
                        const lastWarmup = isCardio ? null : getLastWarmupWeight(ex.id, data.workoutLogs);
                        const suggestion = isCardio ? null : getProgressionSuggestion(ex.id, data.workoutLogs);

                        const toggleExercise = (e) => {
                          e.stopPropagation();
                          if (selected) {
                            setTplExerciseConfigs(prev => prev.filter(c => c.exerciseId !== ex.id));
                          } else {
                            setTplExerciseConfigs(prev => [...prev, {
                              exerciseId: ex.id,
                              targetWeight: lastWeight || 0,
                              warmupWeight: lastWarmup || (lastWeight > 0 ? Math.round(lastWeight * 0.5 / 5) * 5 : 0),
                              targetSets: 3,
                              targetReps: 12,
                            }]);
                          }
                        };

                        const updateConfig = (field, value) => {
                          setTplExerciseConfigs(prev => prev.map(c =>
                            c.exerciseId === ex.id ? { ...c, [field]: value } : c
                          ));
                        };

                        return (
                          <div key={ex.id} style={{ borderRadius: 6, marginBottom: 2, background: selected ? (dark ? "#f59e0b08" : "#f59e0b06") : "transparent" }}>
                            <div onClick={toggleExercise}
                              style={{ padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.textStrong : T.textMuted }}>{ex.name}</div>
                                <div style={{ fontSize: 9, color: T.textFaint, marginTop: 1 }}>
                                  {ex.muscle}
                                  {!isCardio && lastWeight > 0 && <span style={{ color: T.textMuted }}> · Last: {lastWeight} lb</span>}
                                  {!isCardio && suggestion && <span style={{ color: "#22c55e" }}> · Suggested: {suggestion} lb</span>}
                                </div>
                              </div>
                              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? "#f59e0b" : T.borderInput}`, background: selected ? "#f59e0b20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", flexShrink: 0 }}>
                                {selected && <CheckIcon />}
                              </div>
                            </div>

                            {selected && !isCardio && (
                              <div style={{ padding: "4px 12px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}
                                onClick={e => e.stopPropagation()}>
                                <div style={{ flex: 1, minWidth: 70 }}>
                                  <div style={{ fontSize: 7, color: "#f59e0b", letterSpacing: 0.5, marginBottom: 2 }}>WARMUP</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={config.warmupWeight || ""} placeholder="0"
                                      onChange={e => updateConfig("warmupWeight", Number(e.target.value) || 0)}
                                      style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#f59e0b60" }} />
                                    <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                  </div>
                                </div>
                                <div style={{ flex: 1, minWidth: 70 }}>
                                  <div style={{ fontSize: 7, color: "#22c55e", letterSpacing: 0.5, marginBottom: 2 }}>WORKING</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={config.targetWeight || ""} placeholder="0"
                                      onChange={e => updateConfig("targetWeight", Number(e.target.value) || 0)}
                                      style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#22c55e60" }} />
                                    <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                  </div>
                                </div>
                                <div style={{ flex: 0.6, minWidth: 50 }}>
                                  <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>SETS</div>
                                  <input type="number" value={config.targetSets || ""} placeholder="3"
                                    onChange={e => updateConfig("targetSets", Number(e.target.value) || 0)}
                                    style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                </div>
                                <div style={{ flex: 0.6, minWidth: 50 }}>
                                  <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>REPS</div>
                                  <input type="number" value={config.targetReps || ""} placeholder="12"
                                    onChange={e => updateConfig("targetReps", Number(e.target.value) || 0)}
                                    style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>

            {tplExerciseConfigs.length > 1 && (
              <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{ fontSize: 8, color: "#f59e0b", letterSpacing: 1.5, marginBottom: 6 }}>EXERCISE ORDER</div>
                {tplExerciseConfigs.map((cfg, idx) => {
                  const ex = allExercises.find(e => e.id === cfg.exerciseId);
                  return (
                    <div key={cfg.exerciseId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: idx < tplExerciseConfigs.length - 1 ? `1px solid ${T.borderSubtle}` : "none" }}>
                      <span style={{ fontSize: 9, color: T.textFaint, width: 16, textAlign: "center", fontWeight: 700 }}>{idx + 1}</span>
                      <span style={{ flex: 1, fontSize: 11, color: T.textStrong, fontWeight: 600 }}>{ex?.name || "Unknown"}</span>
                      <button onClick={() => idx > 0 && setTplExerciseConfigs(moveItem(tplExerciseConfigs, idx, idx - 1))}
                        style={{ background: "none", border: "none", color: idx > 0 ? "#f59e0b" : T.borderInput, cursor: idx > 0 ? "pointer" : "default", padding: 4 }}>
                        <ArrowUpSmall />
                      </button>
                      <button onClick={() => idx < tplExerciseConfigs.length - 1 && setTplExerciseConfigs(moveItem(tplExerciseConfigs, idx, idx + 1))}
                        style={{ background: "none", border: "none", color: idx < tplExerciseConfigs.length - 1 ? "#f59e0b" : T.borderInput, cursor: idx < tplExerciseConfigs.length - 1 ? "pointer" : "default", padding: 4 }}>
                        <ArrowDownSmall />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {tplExerciseConfigs.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.borderSubtle}`, display: "flex", gap: 8 }}>
                <button onClick={updateTemplate}
                  style={{ ...S.btn("#f59e0b"), flex: 1, padding: "12px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>SAVE CHANGES</span>
                </button>
                <button onClick={() => {
                  updateTemplate();
                  const updated = { ...editingTemplate, name: tplName || editingTemplate.name, exerciseIds: tplExerciseConfigs.map(c => c.exerciseId), exerciseConfigs: tplExerciseConfigs };
                  startFromTemplate(updated);
                }}
                  style={{ ...S.btn("#22c55e"), flex: 1, padding: "12px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><PlayIcon /> START</span>
                </button>
              </div>
            )}
          </div>
        )}

        {(() => {
          const { year, month } = calendarMonth;
          const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const today = new Date();

          // Build map of date strings to workout logs
          const workoutsByDate = {};
          data.workoutLogs.forEach((log, idx) => {
            const d = new Date(log.date);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!workoutsByDate[key]) workoutsByDate[key] = [];
            workoutsByDate[key].push({ ...log, _idx: idx });
          });

          const plannedByDate = {};
          (data.plannedWorkouts || []).forEach(p => {
            const d = new Date(p.date + "T12:00:00");
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!plannedByDate[key]) plannedByDate[key] = [];
            plannedByDate[key].push(p);
          });

          const prevMonth = () => setCalendarMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 });
          const nextMonth = () => {
            setCalendarMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 });
          };

          const selectedKey = calendarSelectedDate;
          const selectedLogs = selectedKey ? (workoutsByDate[selectedKey] || []) : [];
          const selectedPlans = selectedKey ? (plannedByDate[selectedKey] || []) : [];

          return (
            <div style={{ marginTop: 24 }}>
              {/* Calendar header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button onClick={prevMonth} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><ArrowLeftIcon /></button>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, letterSpacing: 0.5 }}>{monthNames[month]} {year}</div>
                <button onClick={nextMonth} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><ArrowRightIcon /></button>
              </div>

              {/* Day names */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                {dayNames.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 8, color: T.textFaint, letterSpacing: 1, fontWeight: 600, padding: "4px 0" }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = `${year}-${month}-${day}`;
                  const hasWorkout = !!workoutsByDate[key];
                  const hasPlanned = !!plannedByDate[key];
                  const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                  const isSelected = selectedKey === key;
                  const workoutCount = hasWorkout ? workoutsByDate[key].length : 0;

                  return (
                    <div key={day} onClick={() => setCalendarSelectedDate(isSelected ? null : key)}
                      style={{
                        textAlign: "center", padding: "6px 0", borderRadius: 8, cursor: "pointer",
                        background: isSelected ? "#e9456025" : hasWorkout ? (dark ? "#22c55e12" : "#22c55e15") : hasPlanned ? (dark ? "#0ea5e912" : "#0ea5e915") : "transparent",
                        border: isToday ? `1px solid ${T.textMuted}` : isSelected ? "1px solid #e9456044" : "1px solid transparent",
                        transition: "all 0.15s",
                      }}>
                      <div style={{ fontSize: 11, fontWeight: isToday ? 800 : (hasWorkout || hasPlanned) ? 700 : 400, color: isSelected ? "#e94560" : hasWorkout ? "#22c55e" : hasPlanned ? "#0ea5e9" : isToday ? T.textStrong : T.textMuted }}>{day}</div>
                      {(hasWorkout || hasPlanned) && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
                          {hasWorkout && Array.from({ length: Math.min(workoutCount, 3) }).map((_, j) => (
                            <div key={`w${j}`} style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
                          ))}
                          {hasPlanned && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#0ea5e9" }} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected day detail */}
              {selectedKey && (
                <div style={{ marginTop: 12 }}>
                  {/* Completed workouts */}
                  {selectedLogs.map((log, i) => (
                    <div key={`log-${i}`} onClick={() => { setExpandedLogIdx(log._idx); setView("history"); }}
                      style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong }}>{log.name}</div>
                        <div style={{ fontSize: 9, color: T.textMuted, marginTop: 3 }}>
                          {log.exercises.map(e => e.name).join(" · ")}
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{formatDate(log.date)}</div>
                        {log.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                            <span style={{ color: "#0ea5e9" }}><MapPinIcon /></span>
                            <span style={{ fontSize: 9, color: "#0ea5e9" }}>{log.location}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#e94560" }}>{log.exercises.length} exercises</div>
                          <div style={{ fontSize: 10, color: T.textMuted }}>
                            {log.exercises.reduce((s, ex) => s + (ex.workingSets || ex.sets || []).filter(set => set.completed).length, 0)} working sets
                          </div>
                        </div>
                        <span style={{ color: T.textFaint }}><ChevronIcon down={false} /></span>
                      </div>
                    </div>
                  ))}

                  {/* Planned workouts */}
                  {selectedPlans.map((plan, i) => (
                    <div key={`plan-${i}`} style={{ ...S.card, borderColor: "#0ea5e933", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 7, color: "#0ea5e9", background: "#0ea5e915", padding: "1px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>PLANNED</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.textStrong, marginTop: 4 }}>{plan.name}</div>
                          <div style={{ fontSize: 9, color: T.textMuted, marginTop: 3 }}>
                            {plan.exerciseIds.map(id => allExercises.find(e => e.id === id)?.name).filter(Boolean).join(" · ")}
                          </div>
                          {plan.warmupNotes && <div style={{ fontSize: 9, color: "#f59e0b", marginTop: 3 }}>Warmup: {plan.warmupNotes}</div>}
                          {plan.cooldownNotes && <div style={{ fontSize: 9, color: "#8b5cf6", marginTop: 2 }}>Cooldown: {plan.cooldownNotes}</div>}
                        </div>
                        <button onClick={() => { if(confirm("Delete this planned workout?")) deletePlannedWorkout(plan.id); }}
                          style={{ background: "none", border: "none", color: "#e94560", cursor: "pointer", padding: 4, opacity: 0.5 }}>
                          <TrashIcon />
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { openPlanEditor(plan); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ ...S.btnOutline("#0ea5e9"), flex: 1, padding: "10px 16px", fontSize: 11 }}>
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><EditIcon /> EDIT PLAN</span>
                        </button>
                        <button onClick={() => {
                          startPlannedWorkout(plan);
                        }} style={{ ...S.btn("#22c55e"), flex: 1, padding: "10px 16px", fontSize: 11 }}>
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><PlayIcon /> START</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Plan workout button */}
                  {!planningDate && !editingPlan && (
                    <button onClick={() => {
                      const [y, m, d] = selectedKey.split("-").map(Number);
                      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      setPlanningDate(dateStr);
                      setPlanExerciseConfigs([]);
                      setPlanName("");
                      setPlanWarmup("");
                      setPlanCooldown("");
                    }} style={{ ...S.btnOutline("#0ea5e9"), marginTop: 8, fontSize: 10, padding: "10px 16px" }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><PlusIcon /> PLAN WORKOUT FOR THIS DAY</span>
                    </button>
                  )}

                  {/* Inline planning view */}
                  {planningDate && !editingPlan && selectedKey && (() => {
                    const [y, m, d] = selectedKey.split("-").map(Number);
                    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    if (planningDate !== dateStr) return null;

                    const categories = [...new Set(allExercises.map(e => e.category))];
                    return (
                      <div style={{ ...S.card, padding: 0, marginTop: 8, borderColor: "#0ea5e933" }}>
                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1 }}>PLAN WORKOUT</span>
                          <button onClick={() => { setPlanningDate(null); setExerciseSearch(""); }} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><XIcon /></button>
                        </div>

                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
                          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1, marginBottom: 4 }}>WORKOUT NAME (optional)</div>
                          <input style={{ ...S.input, fontSize: 12 }} placeholder="Auto-generates from exercises" value={planName} onChange={e => setPlanName(e.target.value)} />
                        </div>

                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
                          <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 1, marginBottom: 4 }}>WARMUP (optional)</div>
                          <textarea style={{ ...S.input, fontSize: 11, minHeight: 36, resize: "vertical", lineHeight: 1.5, padding: "8px 10px", borderColor: "#f59e0b15" }}
                            placeholder="e.g. Leg swings, TRX squat & row, hurdle steps..."
                            value={planWarmup} onChange={e => setPlanWarmup(e.target.value)} />
                        </div>

                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
                          <div style={{ fontSize: 9, color: "#8b5cf6", letterSpacing: 1, marginBottom: 4 }}>COOLDOWN (optional)</div>
                          <textarea style={{ ...S.input, fontSize: 11, minHeight: 36, resize: "vertical", lineHeight: 1.5, padding: "8px 10px", borderColor: "#8b5cf615" }}
                            placeholder="e.g. Tabata finisher, stretching, foam rolling..."
                            value={planCooldown} onChange={e => setPlanCooldown(e.target.value)} />
                        </div>

                        <div style={{ padding: "8px 12px 4px" }}>
                          <input type="text" placeholder="🔍 Search exercises..." value={exerciseSearch}
                            onChange={e => setExerciseSearch(e.target.value)}
                            style={{ ...S.input, fontSize: 11, padding: "7px 10px", width: "100%", borderColor: "#0ea5e933" }} />
                        </div>

                        <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
                          {(() => {
                            const searchTerm = exerciseSearch.toLowerCase().trim();
                            const filtered = searchTerm ? allExercises.filter(e => e.name.toLowerCase().includes(searchTerm) || e.muscle.toLowerCase().includes(searchTerm) || (e.category || "").toLowerCase().includes(searchTerm)) : allExercises;
                            const filteredCategories = [...new Set(filtered.map(e => e.category))];
                            return filteredCategories.map(cat => {
                            const catExercises = filtered.filter(e => e.category === cat);
                            const catInfo = CATEGORY_COLORS[cat] || { accent: "#888", label: cat };
                            return (
                              <div key={cat} style={{ padding: "0 12px" }}>
                                <div style={{ ...S.tag(catInfo.accent), marginTop: 8, marginBottom: 4 }}>{catInfo.label}</div>
                                {catExercises.map(ex => {
                                  const config = planExerciseConfigs.find(c => c.exerciseId === ex.id);
                                  const selected = !!config;
                                  const isCardio = ex.isCardio || ex.category === "cardio";
                                  const lastWeight = isCardio ? null : getLastWorkingWeight(ex.id, data.workoutLogs);
                                  const lastWarmup = isCardio ? null : getLastWarmupWeight(ex.id, data.workoutLogs);
                                  const suggestion = isCardio ? null : getProgressionSuggestion(ex.id, data.workoutLogs);

                                  const toggleExercise = (e) => {
                                    e.stopPropagation();
                                    if (selected) {
                                      setPlanExerciseConfigs(prev => prev.filter(c => c.exerciseId !== ex.id));
                                    } else {
                                      setPlanExerciseConfigs(prev => [...prev, {
                                        exerciseId: ex.id,
                                        targetWeight: lastWeight || 0,
                                        warmupWeight: lastWarmup || (lastWeight > 0 ? Math.round(lastWeight * 0.5 / 5) * 5 : 0),
                                        targetSets: 3,
                                        targetReps: 12,
                                      }]);
                                    }
                                  };

                                  const updateConfig = (field, value) => {
                                    setPlanExerciseConfigs(prev => prev.map(c =>
                                      c.exerciseId === ex.id ? { ...c, [field]: value } : c
                                    ));
                                  };

                                  return (
                                    <div key={ex.id} style={{ borderRadius: 6, marginBottom: 2, background: selected ? (dark ? "#0ea5e908" : "#0ea5e906") : "transparent" }}>
                                      <div onClick={toggleExercise}
                                        style={{ padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                          <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.textStrong : T.textMuted }}>{ex.name}</div>
                                          <div style={{ fontSize: 9, color: T.textFaint, marginTop: 1 }}>
                                            {ex.muscle}
                                            {!isCardio && lastWeight > 0 && <span style={{ color: T.textMuted }}> · Last: {lastWeight} lb</span>}
                                            {!isCardio && suggestion && <span style={{ color: "#22c55e" }}> · Suggested: {suggestion} lb</span>}
                                          </div>
                                        </div>
                                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? "#0ea5e9" : T.borderInput}`, background: selected ? "#0ea5e920" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#0ea5e9", flexShrink: 0 }}>
                                          {selected && <CheckIcon />}
                                        </div>
                                      </div>

                                      {/* Expanded config for selected exercises */}
                                      {selected && !isCardio && (
                                        <div style={{ padding: "4px 12px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}
                                          onClick={e => e.stopPropagation()}>
                                          <div style={{ flex: 1, minWidth: 70 }}>
                                            <div style={{ fontSize: 7, color: "#f59e0b", letterSpacing: 0.5, marginBottom: 2 }}>WARMUP</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                              <input type="number" value={config.warmupWeight || ""} placeholder="0"
                                                onChange={e => updateConfig("warmupWeight", Number(e.target.value) || 0)}
                                                style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#f59e0b60" }} />
                                              <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                            </div>
                                          </div>
                                          <div style={{ flex: 1, minWidth: 70 }}>
                                            <div style={{ fontSize: 7, color: "#22c55e", letterSpacing: 0.5, marginBottom: 2 }}>WORKING</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                              <input type="number" value={config.targetWeight || ""} placeholder="0"
                                                onChange={e => updateConfig("targetWeight", Number(e.target.value) || 0)}
                                                style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, width: "100%", padding: "5px 4px", borderColor: "#22c55e60" }} />
                                              <span style={{ fontSize: 8, color: T.textFaint }}>lb</span>
                                            </div>
                                          </div>
                                          <div style={{ flex: 0.6, minWidth: 50 }}>
                                            <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>SETS</div>
                                            <input type="number" value={config.targetSets || ""} placeholder="3"
                                              onChange={e => updateConfig("targetSets", Number(e.target.value) || 0)}
                                              style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                          </div>
                                          <div style={{ flex: 0.6, minWidth: 50 }}>
                                            <div style={{ fontSize: 7, color: T.textFaint, letterSpacing: 0.5, marginBottom: 2 }}>REPS</div>
                                            <input type="number" value={config.targetReps || ""} placeholder="12"
                                              onChange={e => updateConfig("targetReps", Number(e.target.value) || 0)}
                                              style={{ ...S.input, fontSize: 12, textAlign: "center", fontWeight: 700, padding: "5px 4px" }} />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          });
                          })()}
                        </div>

                        {planExerciseConfigs.length > 1 && (
                          <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.borderSubtle}` }}>
                            <div style={{ fontSize: 8, color: "#0ea5e9", letterSpacing: 1.5, marginBottom: 6 }}>EXERCISE ORDER</div>
                            {planExerciseConfigs.map((cfg, idx) => {
                              const ex = allExercises.find(e => e.id === cfg.exerciseId);
                              return (
                                <div key={cfg.exerciseId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: idx < planExerciseConfigs.length - 1 ? `1px solid ${T.borderSubtle}` : "none" }}>
                                  <span style={{ fontSize: 9, color: T.textFaint, width: 16, textAlign: "center", fontWeight: 700 }}>{idx + 1}</span>
                                  <span style={{ flex: 1, fontSize: 11, color: T.textStrong, fontWeight: 600 }}>{ex?.name || "Unknown"}</span>
                                  <button onClick={() => idx > 0 && setPlanExerciseConfigs(moveItem(planExerciseConfigs, idx, idx - 1))}
                                    style={{ background: "none", border: "none", color: idx > 0 ? "#0ea5e9" : T.borderInput, cursor: idx > 0 ? "pointer" : "default", padding: 4 }}>
                                    <ArrowUpSmall />
                                  </button>
                                  <button onClick={() => idx < planExerciseConfigs.length - 1 && setPlanExerciseConfigs(moveItem(planExerciseConfigs, idx, idx + 1))}
                                    style={{ background: "none", border: "none", color: idx < planExerciseConfigs.length - 1 ? "#0ea5e9" : T.borderInput, cursor: idx < planExerciseConfigs.length - 1 ? "pointer" : "default", padding: 4 }}>
                                    <ArrowDownSmall />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {planExerciseConfigs.length > 0 && (
                          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.borderSubtle}` }}>
                            <button onClick={() => savePlannedWorkout(planningDate, planName)}
                              style={{ ...S.btn("#0ea5e9"), padding: "12px 16px" }}>
                              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>SAVE PLAN ({planExerciseConfigs.length} exercises)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* View all history link */}
              <button onClick={() => setView("history")} style={{ ...S.btnOutline(T.textMuted), marginTop: 12, fontSize: 9 }}>VIEW FULL HISTORY</button>
            </div>
          );
        })()}

        {totalWorkouts > 0 && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ fontSize: 8, color: T.textFaint }}>Need to reset? Go to Settings in the Exercises tab</span>
          </div>
        )}
      </div>
    );
}