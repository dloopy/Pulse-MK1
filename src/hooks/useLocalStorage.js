// Note: exports plain functions (not a React hook), but lives in hooks/ per project convention.

const KEY = 'pulse-mk1-state'

export const DEFAULT_STATE = {
  bpm: 120,
  tsIdx: 0,
  subIdx: 6,
  vol: 75,
  tr: { target: 160, step: 2, bars: 4 },
}

function inRange(v, min, max) {
  return typeof v === 'number' && !isNaN(v) && v >= min && v <= max
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STATE, tr: { ...DEFAULT_STATE.tr } }
    const s = JSON.parse(raw)
    return {
      bpm:    inRange(s.bpm,    30,  240) ? s.bpm    : DEFAULT_STATE.bpm,
      tsIdx:  inRange(s.tsIdx,  0,   7)   ? s.tsIdx  : DEFAULT_STATE.tsIdx,
      subIdx: inRange(s.subIdx, 0,   8)   ? s.subIdx : DEFAULT_STATE.subIdx,
      vol:    inRange(s.vol,    0,   100) ? s.vol    : DEFAULT_STATE.vol,
      tr: {
        target: inRange(s.tr?.target, 30, 240) ? s.tr.target : DEFAULT_STATE.tr.target,
        step:   inRange(s.tr?.step,   1,  20)  ? s.tr.step   : DEFAULT_STATE.tr.step,
        bars:   inRange(s.tr?.bars,   1,  16)  ? s.tr.bars   : DEFAULT_STATE.tr.bars,
      },
    }
  } catch {
    return { ...DEFAULT_STATE, tr: { ...DEFAULT_STATE.tr } }
  }
}

export function saveState({ bpm, tsIdx, subIdx, vol, tr }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ bpm, tsIdx, subIdx, vol, tr }))
  } catch {
    // localStorage unavailable — fail silently
  }
}
