// src/components/SoundIcon.jsx
// Sound-type icons used in badge column (animated) and sound selector button (static).
import { useState, useEffect, useRef } from 'react'
import { SOUNDS } from '../constants/sounds'

const REST       = '#7A6892'  // resting
const HIT_DOWN   = '#C0A0E0'  // downbeat — vivid
const HIT_BEAT   = '#9880B8'  // regular beat — dimmer

// hit: null | 'down' | 'beat'
function hitColor(hit) {
  return hit === 'down' ? HIT_DOWN : hit === 'beat' ? HIT_BEAT : REST
}

// ── Per-sound SVG icons ───────────────────────────────────────────────────────

function ClickSvg({ hit, hitKey }) {
  const c = hitColor(hit)
  const animName = hit === 'down' ? 'clickPulse' : 'clickPulseSm'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ overflow: 'visible' }}>
      {hit && (
        <line key={hitKey}
          x1="7" y1={hit === 'down' ? 1.5 : 2.5} x2="7" y2={hit === 'down' ? 12.5 : 11.5}
          stroke={c} strokeWidth="1.5" strokeLinecap="round"
          style={{ animation: `${animName} 0.16s ease-out forwards` }} />
      )}
      <line x1="7" y1="4" x2="7" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="3" r="1.6" fill={c} />
    </svg>
  )
}

function WoodblockSvg({ hit, hitKey }) {
  const c = hitColor(hit)
  const rippleAnim = hit === 'down' ? 'soundRipple' : 'soundRippleSm'
  const rippleR    = hit === 'down' ? 4 : 3
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ overflow: 'visible' }}>
      {hit && (
        <circle key={hitKey} cx="7" cy="8" r={rippleR}
          fill="none" stroke={c} strokeWidth="1"
          style={{ animation: `${rippleAnim} 0.16s ease-out forwards` }} />
      )}
      <rect x="3" y="6" width="8" height="4" rx="1"
        fill="none" stroke={c} strokeWidth="1.2" />
      <line x1="5" y1="6" x2="4.5" y2="3.5" stroke={c} strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="6" x2="9.5" y2="3.5" stroke={c} strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function SineSvg({ hit }) {
  const c = hitColor(hit)
  const d = hit
    ? 'M1 7 C3 10.5, 5 10.5, 7 7 C9 3.5, 11 3.5, 13 7'
    : 'M1 7 C3 3.5,  5 3.5,  7 7 C9 10.5, 11 10.5, 13 7'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d={d} fill="none" stroke={c} strokeWidth={hit === 'down' ? 1.5 : 1.2} strokeLinecap="round" />
    </svg>
  )
}

function RimSvg({ hit, hitKey }) {
  const c = hitColor(hit)
  const s = hit === 'down' ? 5.5 : hit === 'beat' ? 5 : 4
  const rippleAnim = hit === 'down' ? 'soundRipple' : 'soundRippleSm'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ overflow: 'visible' }}>
      {hit && (
        <circle key={hitKey} cx="7" cy="7" r={hit === 'down' ? 4.5 : 3.5}
          fill="none" stroke={c} strokeWidth="0.8"
          style={{ animation: `${rippleAnim} 0.16s ease-out forwards` }} />
      )}
      <line x1={7 - s} y1={7 - s} x2={7 + s} y2={7 + s}
        stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1={7 + s} y1={7 - s} x2={7 - s} y2={7 + s}
        stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function HihatSvg({ hit }) {
  const c  = hitColor(hit)
  // downbeat: lines close together; beat: slightly closed; rest: open
  const y1 = hit === 'down' ? 6.5 : hit === 'beat' ? 6 : 5
  const y2 = hit === 'down' ? 7.5 : hit === 'beat' ? 8 : 9
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <line x1="2" y1={y1} x2="12" y2={y1} stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1={y2} x2="12" y2={y2} stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="9"  x2="7"  y2="12" stroke={c} strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

function BeepSvg({ hit }) {
  const c = hitColor(hit)
  // downbeat: steps jump highest; beat: medium; rest: low
  const d = hit === 'down'
    ? 'M2 9 L2 5.5 L5.5 5.5 L5.5 9 L8.5 9 L8.5 5.5 L12 5.5'
    : hit === 'beat'
    ? 'M2 9.5 L2 6.5 L5.5 6.5 L5.5 9.5 L8.5 9.5 L8.5 6.5 L12 6.5'
    : 'M2 10 L2 7 L5.5 7 L5.5 10 L8.5 10 L8.5 7 L12 7'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d={d} fill="none" stroke={c}
        strokeWidth={hit === 'down' ? 1.5 : 1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SVG_MAP = {
  click:     ClickSvg,
  woodblock: WoodblockSvg,
  sine:      SineSvg,
  rim:       RimSvg,
  hihat:     HihatSvg,
  beep:      BeepSvg,
}

// ── SoundSvg — static/animated icon, used in badge and button ────────────────
export function SoundSvg({ soundIdx, hit = null, hitKey = 0 }) {
  const id  = SOUNDS[soundIdx]?.id ?? 'click'
  const Cmp = SVG_MAP[id] ?? ClickSvg
  return <Cmp hit={hit} hitKey={hitKey} />
}

// ── SoundIcon — badge version: animates on every beat ────────────────────────
// Downbeat = 'down' (larger, brighter); other beats = 'beat' (smaller, dimmer)
export function SoundIcon({ soundIdx, running, beatIdx }) {
  const [hit, setHit]  = useState(null)
  const hitKeyRef      = useRef(0)

  useEffect(() => {
    if (!running) return
    hitKeyRef.current += 1
    setHit(beatIdx === 0 ? 'down' : 'beat')
    const t = setTimeout(() => setHit(null), 160)
    return () => clearTimeout(t)
  }, [beatIdx, running])

  return (
    <div className="badge-sound">
      <SoundSvg soundIdx={soundIdx} hit={hit} hitKey={hitKeyRef.current} />
    </div>
  )
}
