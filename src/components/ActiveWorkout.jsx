import React from 'react';
import { useWorkout } from '../context/WorkoutContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { CATEGORY_COLORS } from '../constants.js';
import { softDelete } from '../constants.js';
import {
  getLastWorkingWeight, getLastWarmupWeight, getLastCardioStats,
  getLastCarryStats, getLastTabataRounds, getProgressionSuggestion, getPR,
} from '../utils.js';
import {
  CheckIcon, PlusIcon, XIcon, ArrowLeftIcon, MapPinIcon, FlameIcon,
} from '../icons.jsx';
import CardioCard from './cards/CardioCard.jsx';
import CarryCard from './cards/CarryCard.jsx';
import TabataCard from './cards/TabataCard.jsx';
import StrengthCard from './cards/StrengthCard.jsx';

export default function ActiveWorkout({ allExercises, saveWorkout, getVideoUrl }) {
  const {
    data, persist, setView,
    activeWorkout, setActiveWorkout,
    editingLogIdx, setEditingLogIdx,
    showMidWorkoutPicker, setShowMidWorkoutPicker,
    exerciseSearch, setExerciseSearch,
    showSaveTemplate, setShowSaveTemplate,
    templateName, setTemplateName,
    moveItem,
    swappingExerciseIdx, setSwappingExerciseIdx,
    dismissedHints, dismissHint,
  } = useWorkout();
  const { T, S } = useTheme();

    if (!activeWorkout) return null;

    const updateField = (exIdx, field, value) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx], [field]: value };

      // BUG-001 fix: when changing workingWeight, lock in the old weight
      // on any completed sets that don't have a custom weight yet
      if (field === "workingWeight" && ex.workingSets) {
        const oldWeight = updated.exercises[exIdx].workingWeight || 0;
        ex.workingSets = ex.workingSets.map(set => {
          if (set.completed && set.weight == null) {
            return { ...set, weight: oldWeight };
          }
          return set;
        });
      }

      updated.exercises[exIdx] = ex;
      setActiveWorkout(updated);
    };

    const toggleSet = (exIdx, setType, setIdx) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx] };
      const key = setType === "warmup" ? "warmupSets" : "workingSets";
      ex[key] = [...ex[key]];
      ex[key][setIdx] = { ...ex[key][setIdx], completed: !ex[key][setIdx].completed };
      if (ex[key][setIdx].completed && ex[key][setIdx].reps === 0) ex[key][setIdx].reps = setType === "warmup" ? 6 : 12;
      if (setType === "working" && ex[key][setIdx].completed && !ex[key][setIdx].weight) {
        ex[key][setIdx].weight = ex.workingWeight || 0;
      }
      updated.exercises[exIdx] = ex;
      setActiveWorkout(updated);
    };

    const updateReps = (exIdx, setType, setIdx, reps) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx] };
      const key = setType === "warmup" ? "warmupSets" : "workingSets";
      ex[key] = [...ex[key]];
      ex[key][setIdx] = { ...ex[key][setIdx], reps: parseInt(reps) || 0 };
      updated.exercises[exIdx] = ex;
      setActiveWorkout(updated);
    };

    const updateSetWeight = (exIdx, setIdx, weight) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx] };
      ex.workingSets = [...ex.workingSets];
      ex.workingSets[setIdx] = { ...ex.workingSets[setIdx], weight: parseFloat(weight) || 0 };
      // Also update the exercise-level workingWeight to the new value so future sets inherit it
      ex.workingWeight = parseFloat(weight) || ex.workingWeight;
      updated.exercises[exIdx] = ex;
      setActiveWorkout(updated);
    };

    const addSet = (exIdx, setType) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx] };
      const key = setType === "warmup" ? "warmupSets" : "workingSets";
      const newSet = setType === "working" ? { reps: 0, completed: false, weight: null } : { reps: 0, completed: false };
      ex[key] = [...ex[key], newSet];
      updated.exercises[exIdx] = ex;
      setActiveWorkout(updated);
    };

    const removeSet = (exIdx, setType) => {
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises] };
      const ex = { ...updated.exercises[exIdx] };
      const key = setType === "warmup" ? "warmupSets" : "workingSets";
      if (ex[key].length > 1) {
        ex[key] = ex[key].slice(0, -1);
        updated.exercises[exIdx] = ex;
        setActiveWorkout(updated);
      }
    };

    const moveExercise = (exIdx, dir) => {
      const exercises = activeWorkout.exercises;
      const to = exIdx + dir;
      if (to < 0 || to >= exercises.length) return;
      setActiveWorkout({ ...activeWorkout, exercises: moveItem(exercises, exIdx, to) });
    };

    const removeExercise = (exIdx) => {
      const ex = activeWorkout.exercises[exIdx];
      const hasProgress = ex.isCardio
        ? ex.completed
        : ex.isCarry
          ? (ex.sets || []).some(s => s.completed)
          : ex.isTabata
            ? (ex.rounds || []).some(r => r.completed)
            : (ex.warmupSets || []).some(s => s.completed) || (ex.workingSets || []).some(s => s.completed);
      if (hasProgress && !confirm(`Remove "${ex.name}"? You have logged sets on this exercise.`)) return;
      if (!hasProgress && !confirm(`Remove "${ex.name}" from this workout?`)) return;
      const updated = { ...activeWorkout, exercises: activeWorkout.exercises.filter((_, i) => i !== exIdx) };
      setActiveWorkout(updated);
    };

    const swapExercise = (exIdx, newExerciseId) => {
      const newEx = allExercises.find(e => e.id === newExerciseId);
      if (!newEx) return;
      const isCardio = newEx.isCardio || newEx.category === "cardio";
      const oldEx = activeWorkout.exercises[exIdx];

      let replacement;
      if (isCardio) {
        const lastCardio = getLastCardioStats(newExerciseId, data.workoutLogs);
        replacement = {
          exerciseId: newExerciseId, name: newEx.name, category: newEx.category, isCardio: true,
          duration: lastCardio?.duration || 0, distance: lastCardio?.distance || 0,
          calories: lastCardio?.calories || 0, avgHeartRate: lastCardio?.avgHeartRate || 0,
          notes: "Swapped from: " + oldEx.name, completed: false,
        };
      } else if (newEx.category === "carry") {
        const lastCarry = getLastCarryStats(newExerciseId, data.workoutLogs);
        const lastSet = lastCarry?.sets?.[0] || {};
        replacement = {
          exerciseId: newExerciseId, name: newEx.name, category: newEx.category, isCarry: true,
          sets: [{ weight: lastSet.weight || 0, laps: lastSet.laps || 1, distance: "", completed: false }],
          notes: "Swapped from: " + oldEx.name,
        };
      } else if (newEx.isTabata || newEx.category === "tabata") {
        const lastRounds = getLastTabataRounds(newExerciseId, data.workoutLogs);
        replacement = {
          exerciseId: newExerciseId, name: newEx.name, category: newEx.category, isTabata: true,
          rounds: Array.from({ length: lastRounds > 0 ? lastRounds : 1 }, () => ({ completed: false })),
          notes: "Swapped from: " + oldEx.name,
        };
      } else {
        const lastWorking = getLastWorkingWeight(newExerciseId, data.workoutLogs);
        const lastWarmup = getLastWarmupWeight(newExerciseId, data.workoutLogs);
        const suggestion = getProgressionSuggestion(newExerciseId, data.workoutLogs);
        const pr = getPR(newExerciseId, data.workoutLogs);
        replacement = {
          exerciseId: newExerciseId, name: newEx.name, category: newEx.category,
          warmupWeight: lastWarmup || (lastWorking > 0 ? Math.round(lastWorking * 0.5 / 5) * 5 : 0),
          workingWeight: lastWorking || 0,
          warmupSets: [{ reps: 0, completed: false }],
          workingSets: [
            { reps: 0, completed: false, weight: null },
            { reps: 0, completed: false, weight: null },
            { reps: 0, completed: false, weight: null },
          ],
          notes: "Swapped from: " + oldEx.name,
          pr, suggestion, lastWorking,
        };
      }

      const exercises = [...activeWorkout.exercises];
      exercises[exIdx] = replacement;
      setActiveWorkout({ ...activeWorkout, exercises });
      setSwappingExerciseIdx(null);
      if (!dismissedHints.swap) dismissHint("swap");
    };

    const addExerciseMidWorkout = (id) => {
      const ex = allExercises.find(e => e.id === id);
      if (!ex) return;
      const isCardio = ex.isCardio || ex.category === "cardio";

      let newEx;
      const isCarryMid = ex.category === "carry";
      const isTabataMid = ex.isTabata || ex.category === "tabata";
      if (isCardio) {
        const lastCardio = getLastCardioStats(id, data.workoutLogs);
        newEx = {
          exerciseId: id, name: ex.name, category: ex.category, isCardio: true,
          duration: lastCardio?.duration || 0, distance: lastCardio?.distance || 0,
          calories: lastCardio?.calories || 0, avgHeartRate: lastCardio?.avgHeartRate || 0,
          notes: "", completed: false,
        };
      } else if (isCarryMid) {
        const lastCarry = getLastCarryStats(id, data.workoutLogs);
        const lastSet = lastCarry?.sets?.[0] || {};
        newEx = {
          exerciseId: id, name: ex.name, category: ex.category, isCarry: true,
          sets: [{ weight: lastSet.weight || 0, laps: lastSet.laps || 1, distance: "", completed: false }],
          notes: "",
        };
      } else if (isTabataMid) {
        const lastRounds = getLastTabataRounds(id, data.workoutLogs);
        newEx = {
          exerciseId: id, name: ex.name, category: ex.category, isTabata: true,
          rounds: Array.from({ length: lastRounds > 0 ? lastRounds : 1 }, () => ({ completed: false })),
          notes: "",
        };
      } else {
        const lastWorking = getLastWorkingWeight(id, data.workoutLogs);
        const lastWarmup = getLastWarmupWeight(id, data.workoutLogs);
        const suggestion = getProgressionSuggestion(id, data.workoutLogs);
        const pr = getPR(id, data.workoutLogs);
        newEx = {
          exerciseId: id, name: ex.name, category: ex.category,
          warmupWeight: lastWarmup || (lastWorking > 0 ? Math.round(lastWorking * 0.5 / 5) * 5 : 0),
          workingWeight: lastWorking || 0,
          warmupSets: [{ reps: 0, completed: false }],
          workingSets: [
            { reps: 0, completed: false, weight: null },
            { reps: 0, completed: false, weight: null },
            { reps: 0, completed: false, weight: null },
          ],
          notes: "", pr, suggestion, lastWorking,
        };
      }
      const updated = { ...activeWorkout, exercises: [...activeWorkout.exercises, newEx] };
      setActiveWorkout(updated);
      setShowMidWorkoutPicker(false);
    };

    const totalSets = activeWorkout.exercises.reduce((s, ex) => {
      if (ex.isCardio) return s + 1;
      if (ex.isCarry) return s + (ex.sets || []).length;
      if (ex.isTabata) return s + (ex.rounds || []).length;
      return s + (ex.warmupSets || []).length + (ex.workingSets || []).length;
    }, 0);
    const completedSets = activeWorkout.exercises.reduce((s, ex) => {
      if (ex.isCardio) return s + (ex.completed ? 1 : 0);
      if (ex.isCarry) return s + (ex.sets || []).filter(s => s.completed).length;
      if (ex.isTabata) return s + (ex.rounds || []).filter(r => r.completed).length;
      return s + (ex.warmupSets || []).filter(s => s.completed).length + (ex.workingSets || []).filter(s => s.completed).length;
    }, 0);
    // ═══════════════════════════════════════
    // EXERCISE CARD RENDER FUNCTIONS
    // Each function closes over: activeWorkout, setActiveWorkout, allExercises,
    // data, S, T, dark, swappingExerciseIdx, setSwappingExerciseIdx,
    // dismissedHints, dismissHint, and all handler functions above.
    // ═══════════════════════════════════════

    const progress = totalSets > 0 ? (completedSets / totalSets * 100) : 0;

    return (
      <div>
        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              {editingLogIdx !== null && (
                <div style={{ fontSize: 8, color: "#f59e0b", letterSpacing: 1.5, fontWeight: 700, marginBottom: 2 }}>✏ EDITING</div>
              )}
              <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1.5 }}>{activeWorkout.name.toUpperCase()}</span>
              {activeWorkout.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <span style={{ color: "#0ea5e9" }}><MapPinIcon /></span>
                  <span style={{ fontSize: 9, color: "#0ea5e9" }}>{activeWorkout.location}</span>
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, color: "#e94560", fontWeight: 700 }}>{completedSets}/{totalSets} SETS</span>
          </div>
          <div style={{ height: 3, background: T.borderSubtle, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #e94560, #f59e0b)", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* ── WARMUP NOTES ── */}
        <div style={{ ...S.card, padding: 0, marginBottom: 12, borderColor: "#f59e0b22" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#f59e0b" }}>~</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", letterSpacing: 1.5 }}>WARMUP</span>
          </div>
          <div style={{ padding: "10px 16px" }}>
            <textarea
              value={activeWorkout.warmupNotes || ""}
              onChange={e => setActiveWorkout({ ...activeWorkout, warmupNotes: e.target.value })}
              placeholder="Leg swings, hurdle steps, TRX squat & row, band pull-aparts..."
              style={{
                ...S.input,
                minHeight: 44,
                resize: "vertical",
                fontSize: 11,
                lineHeight: 1.6,
                padding: "8px 10px",
                borderColor: "#f59e0b15",
              }}
            />
          </div>
        </div>


        {activeWorkout.exercises.map((ex, exIdx) => {
          const exInfo = allExercises.find(e => e.id === ex.exerciseId);
          const catInfo = CATEGORY_COLORS[exInfo?.category] || { accent: "#888" };

          // ── CARDIO EXERCISE ──
          if (ex.isCardio) return <CardioCard key={exIdx} ex={ex} exIdx={exIdx} catInfo={catInfo} allExercises={allExercises} updateField={updateField} moveExercise={moveExercise} removeExercise={removeExercise} swapExercise={swapExercise} />;

          // ── CARRY EXERCISE ──
          if (ex.isCarry) return <CarryCard key={exIdx} ex={ex} exIdx={exIdx} exInfo={exInfo} getVideoUrl={getVideoUrl} updateField={updateField} moveExercise={moveExercise} removeExercise={removeExercise} />;

          // ── TABATA EXERCISE ──
          if (ex.isTabata) return <TabataCard key={exIdx} ex={ex} exIdx={exIdx} updateField={updateField} moveExercise={moveExercise} removeExercise={removeExercise} />;

          // ── STRENGTH EXERCISE ──
          return <StrengthCard key={exIdx} ex={ex} exIdx={exIdx} catInfo={catInfo} exInfo={exInfo} allExercises={allExercises} getVideoUrl={getVideoUrl} updateField={updateField} toggleSet={toggleSet} updateReps={updateReps} updateSetWeight={updateSetWeight} addSet={addSet} removeSet={removeSet} moveExercise={moveExercise} removeExercise={removeExercise} swapExercise={swapExercise} />;

        })}

        {/* ── COOLDOWN NOTES ── */}
        <div style={{ ...S.card, padding: 0, marginBottom: 16, borderColor: "#8b5cf622" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#8b5cf6" }}>❄</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#8b5cf6", letterSpacing: 1.5 }}>COOLDOWN</span>
          </div>
          <div style={{ padding: "10px 16px" }}>
            <textarea
              value={activeWorkout.cooldownNotes || ""}
              onChange={e => setActiveWorkout({ ...activeWorkout, cooldownNotes: e.target.value })}
              placeholder="Stretching, foam rolling, mobility work..."
              style={{
                ...S.input,
                minHeight: 44,
                resize: "vertical",
                fontSize: 11,
                lineHeight: 1.6,
                padding: "8px 10px",
                borderColor: "#8b5cf615",
              }}
            />
          </div>
        </div>

        {/* ── ADD EXERCISE MID-WORKOUT ── */}
        {!showMidWorkoutPicker ? (
          <button onClick={() => setShowMidWorkoutPicker(true)}
            style={{ ...S.btnOutline("#0ea5e9"), marginBottom: 16, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <PlusIcon /> ADD EXERCISE
          </button>
        ) : (
          <div style={{ ...S.card, padding: 0, marginBottom: 16, border: `1px solid #0ea5e933` }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1 }}>ADD EXERCISE</span>
              <button onClick={() => setShowMidWorkoutPicker(false)}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}>
                <XIcon />
              </button>
            </div>
            <div style={{ padding: "8px 12px 4px" }}>
              <input type="text" placeholder="🔍 Search exercises..." value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                style={{ ...S.input, fontSize: 11, padding: "7px 10px", width: "100%", borderColor: "#0ea5e933" }} />
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 0" }}>
              {(() => {
                const currentIds = activeWorkout.exercises.map(e => e.exerciseId);
                const available = allExercises.filter(e => !currentIds.includes(e.id));
                const searchTerm = exerciseSearch.toLowerCase().trim();
                const filtered = searchTerm ? available.filter(e => e.name.toLowerCase().includes(searchTerm) || e.muscle.toLowerCase().includes(searchTerm) || (e.category || "").toLowerCase().includes(searchTerm)) : available;
                const categories = [...new Set(filtered.map(e => e.category))];
                return categories.map(cat => {
                  const catExercises = filtered.filter(e => e.category === cat);
                  const catInfo = CATEGORY_COLORS[cat] || { accent: "#888", label: cat };
                  return (
                    <div key={cat} style={{ padding: "0 12px" }}>
                      <div style={{ ...S.tag(catInfo.accent), marginTop: 8, marginBottom: 4 }}>{catInfo.label}</div>
                      {catExercises.map(ex => (
                        <div key={ex.id} onClick={() => addExerciseMidWorkout(ex.id)}
                          style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center",
                            transition: "background 0.1s" }}
                          onMouseOver={e => e.currentTarget.style.background = T.bgInset}
                          onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.textStrong }}>{ex.name}</div>
                            <div style={{ fontSize: 9, color: T.textFaint }}>{ex.muscle}</div>
                          </div>
                          <span style={{ color: "#0ea5e9", fontSize: 9, flexShrink: 0 }}><PlusIcon /></span>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        <button style={S.btn("#22c55e")} onClick={() => {
          if (editingLogIdx === null && activeWorkout) {
            // Check if exercises deviated from original template
            const currentExerciseIds = activeWorkout.exercises.map(e => e.exerciseId);
            const originalIds = activeWorkout.originalTemplateExerciseIds || [];
            const exercisesChanged = originalIds.length > 0 && (
              currentExerciseIds.length !== originalIds.length ||
              !currentExerciseIds.every((id, i) => id === originalIds[i])
            );
            if (exercisesChanged) {
              const newName = prompt(
                "You changed exercises from the original \"" + activeWorkout.name + "\" template.\n\nKeep this name or type a new one:",
                activeWorkout.name
              );
              if (newName !== null && newName.trim()) {
                activeWorkout.name = newName.trim();
              }
            }
            // Capture for template prompt before saveWorkout clears it
            const capturedName = activeWorkout.name;
            const capturedIds = activeWorkout.exercises.map(e => e.exerciseId);
            const capturedLocation = activeWorkout.location || "";
            const capturedConfigs = activeWorkout.exercises.map(e => ({
              exerciseId: e.exerciseId,
              targetWeight: e.workingWeight || 0,
              warmupWeight: e.warmupWeight || 0,
              targetSets: (e.workingSets || []).length,
              targetReps: 12,
              notes: e.notes || "",
            }));
            saveWorkout();
            // Check if a template with these exact exercises already exists
            const existing = (data.templates || []).find(t =>
              t.exerciseIds.length === capturedIds.length && t.exerciseIds.every((id, i) => id === capturedIds[i])
            );
            if (!existing) {
              setTemplateName(capturedName);
              setShowSaveTemplate({ name: capturedName, exerciseIds: capturedIds, location: capturedLocation, exerciseConfigs: capturedConfigs, warmupNotes: activeWorkout.warmupNotes, cooldownNotes: activeWorkout.cooldownNotes });
            }
          } else {
            saveWorkout();
          }
        }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><CheckIcon /> {editingLogIdx !== null ? "SAVE CHANGES" : "FINISH WORKOUT"}</span>
        </button>
        {/* ── Safe navigation: DONE (editing) or BACK TO DASHBOARD (new workout) ── */}
        {editingLogIdx !== null ? (
          <button onClick={() => {
            // Just go back — the original workout in history is untouched
            setActiveWorkout(null);
            setEditingLogIdx(null);
            setView("history");
          }} style={{ ...S.btnOutline("#0ea5e9"), marginTop: 12 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><ArrowLeftIcon /> DONE — BACK TO HISTORY</span>
          </button>
        ) : (
          <button onClick={() => {
            // Navigate away — draft auto-save keeps the workout alive
            setView("dashboard");
          }} style={{ ...S.btnOutline("#0ea5e9"), marginTop: 12 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><ArrowLeftIcon /> BACK TO DASHBOARD</span>
          </button>
        )}

        {/* ── Discard (destructive — pushed way down, protected) ── */}
        <button onClick={() => {
          const hasProgress = activeWorkout.exercises.some(ex =>
            ex.isCardio ? ex.completed :
            (ex.warmupSets || []).some(s => s.completed) || (ex.workingSets || []).some(s => s.completed)
          );
          if (editingLogIdx !== null) {
            // Editing — discard just means "don't save edits", original stays intact
            setActiveWorkout(null);
            setEditingLogIdx(null);
            setView("history");
            return;
          }
          if (hasProgress) {
            if (!confirm("You have " + activeWorkout.exercises.reduce((s, ex) => s + (ex.isCardio ? (ex.completed ? 1 : 0) : (ex.workingSets || []).filter(s => s.completed).length), 0) + " completed sets. Discard this workout?\n\nIt will be saved to Recently Deleted for 30 days.")) return;
            // Soft-delete to trash
            const deletedItem = softDelete(activeWorkout, "workout");
            persist({ ...data, recentlyDeleted: [...(data.recentlyDeleted || []), deletedItem] });
          } else {
            if (!confirm("Discard this workout?")) return;
          }
          setActiveWorkout(null);
          setEditingLogIdx(null);
          setView("dashboard");
        }} style={{ ...S.btnOutline("#e9456033"), marginTop: 40, fontSize: 9, opacity: 0.4, color: "#e94560", borderColor: "#e9456033" }}>
          DISCARD WORKOUT
        </button>
      </div>
    );
}
