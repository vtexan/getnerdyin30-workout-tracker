import React from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext.jsx';
import WorkoutTracker from './WorkoutTracker.jsx';

function AppInner() {
  const { loading, authLoading, theme } = useWorkout();

  if (loading || authLoading) return (
    <div style={{ minHeight: "100vh", background: theme === "dark" ? "#08080d" : "#f5f5f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ color: "#e94560" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l1.767 1.767a2 2 0 1 1 2.829 2.829Z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829Z"/></svg>
      </div>
      <div style={{ color: "#e94560", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 3 }}>LOADING...</div>
      <div style={{ color: theme === "dark" ? "#333" : "#999", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1 }}>Connecting to your data</div>
    </div>
  );

  return <WorkoutTracker />;
}

export default function App() {
  return (
    <WorkoutProvider>
      <AppInner />
    </WorkoutProvider>
  );
}
