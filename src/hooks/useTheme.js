import { useWorkout } from '../context/WorkoutContext.jsx';

export function useTheme() {
  const { theme } = useWorkout();
  const dark = theme === 'dark';

  const T = {
    bg: dark ? '#08080d' : '#f5f5f7',
    bgCard: dark ? '#0e0e16' : '#ffffff',
    bgInset: dark ? '#0c0c12' : '#f0f0f4',
    bgNav: dark ? '#0a0a10' : '#ffffff',
    border: dark ? '#18182a' : '#e2e2ea',
    borderSubtle: dark ? '#14141f' : '#ececf0',
    borderInput: dark ? '#22223a' : '#d0d0da',
    text: dark ? '#c0c0cc' : '#333340',
    textStrong: dark ? '#fff' : '#111118',
    textMuted: dark ? '#444' : '#666',
    textFaint: dark ? '#333' : '#888',
    inputBg: dark ? '#08080d' : '#f5f5f7',
    inputText: dark ? '#fff' : '#111118',
    navInactive: dark ? '#333' : '#aaa',
    warmupBg: dark ? '#0c0c12' : '#fffbf0',
    completedSetBg: (isWarmup) => dark
      ? (isWarmup ? '#f59e0b12' : '#22c55e12')
      : (isWarmup ? '#f59e0b15' : '#22c55e15'),
    uncompletedSetBg: dark ? '#08080d' : '#f5f5f7',
  };

  const S = {
    app: { minHeight: '100vh', background: T.bg, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: T.text, maxWidth: 520, margin: '0 auto', padding: '0 16px 100px', transition: 'background 0.3s, color 0.3s' },
    header: { padding: '24px 0 16px', borderBottom: `1px solid ${T.borderSubtle}`, marginBottom: 20 },
    title: { fontSize: 19, fontWeight: 800, color: T.textStrong, letterSpacing: '-0.5px' },
    subtitle: { fontSize: 10, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
    card: { background: T.bgCard, borderRadius: 10, padding: 16, marginBottom: 10, border: `1px solid ${T.border}`, transition: 'background 0.3s, border-color 0.3s' },
    btn: (color = '#e94560') => ({ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '13px 20px', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: 1, width: '100%', transition: 'opacity 0.2s' }),
    btnOutline: (color = '#e94560') => ({ background: 'none', color, border: `1px solid ${color}`, borderRadius: 8, padding: '10px 16px', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: 0.5, width: '100%' }),
    tag: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color, background: color + (dark ? '15' : '18'), marginRight: 6 }),
    input: { background: T.inputBg, border: `1px solid ${T.borderInput}`, borderRadius: 6, color: T.inputText, padding: '8px 12px', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", width: '100%', outline: 'none', transition: 'background 0.3s, border-color 0.3s, color 0.3s' },
    sectionLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
    setBtn: (completed, isWarmup) => ({
      width: 42, height: 42, borderRadius: 8,
      border: completed ? `2px solid ${isWarmup ? '#f59e0b' : '#22c55e'}` : `2px solid ${T.borderInput}`,
      background: completed ? T.completedSetBg(isWarmup) : T.uncompletedSetBg,
      color: completed ? (isWarmup ? '#f59e0b' : '#22c55e') : T.textMuted,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: 13, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.15s',
    }),
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: dark ? '#111118' : '#ffffff', borderTop: `2px solid ${dark ? '#e9456033' : '#e9456022'}`, display: 'flex', justifyContent: 'center', zIndex: 100, padding: '6px 8px 8px', gap: 6, transition: 'background 0.3s, border-color 0.3s' },
    navBtn: (active) => ({ flex: 1, maxWidth: 110, padding: '10px 0 8px', background: active ? (dark ? '#e9456020' : '#e9456012') : 'transparent', border: active ? '1px solid #e9456044' : '1px solid transparent', borderRadius: 10, color: active ? '#e94560' : (dark ? '#555' : '#aaa'), fontSize: 9, fontWeight: active ? 700 : 500, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s' }),
    themeToggle: { background: 'none', border: `1px solid ${T.borderInput}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  };

  return { T, S, dark };
}
