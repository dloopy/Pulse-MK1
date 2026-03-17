// src/components/Knob.jsx
import { useRef, useEffect } from 'react'
import { useKnobDrag } from '../hooks/useKnobDrag'

const START_DEG = 135
const TOTAL_DEG = 270

function degToRad(deg) { return (deg - 90) * (Math.PI / 180) }

function polarToXY(cx, cy, r, deg) {
  const rad = degToRad(deg)
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  if (endDeg - startDeg < 0.5) return ''
  const [x1, y1] = polarToXY(cx, cy, r, startDeg)
  const [x2, y2] = polarToXY(cx, cy, r, endDeg)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function normToDeg(norm) { return START_DEG + TOTAL_DEG * norm }

// ── Large knob (centre/tempo): 108×108 viewBox ────────────────────────────────
function LargeKnobSvg({ norm, color }) {
  const cx = 54, cy = 54
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  // Indicator: short line on the knob body
  const x1 = (cx + 26 * Math.cos(rad)).toFixed(2)
  const y1 = (cy + 26 * Math.sin(rad)).toFixed(2)
  const x2 = (cx + 34 * Math.cos(rad)).toFixed(2)
  const y2 = (cy + 34 * Math.sin(rad)).toFixed(2)

  return (
    <svg width="98" height="98" viewBox="0 0 108 108"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <defs>
        <filter id="lg-arc-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
        </filter>
        <filter id="lg-body-shadow" x="-25%" y="-25%" width="150%" height="175%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#6A5840" floodOpacity="0.18" />
        </filter>
        <linearGradient id="lg-well-grad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>

      {/* ── Recessed well ── */}
      <circle cx={cx} cy={cy} r="50" fill="#D4D0C8" />
      <circle cx={cx} cy={cy} r="50" fill="url(#lg-well-grad)" />
      {/* Top-left highlight edge */}
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Bottom-right shadow edge */}
      <circle cx={cx} cy={cy} r="49.2" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

      {/* ── Arc track on well ring ── */}
      <path d={arcPath(cx, cy, 46, START_DEG, START_DEG + TOTAL_DEG)}
        fill="none" stroke="#B8B3AB" strokeWidth="2.5" strokeLinecap="round" />

      {/* ── Active arc: glow copy + solid ── */}
      {norm > 0.005 && (<>
        <path d={arcPath(cx, cy, 46, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round"
          opacity="0.3" filter="url(#lg-arc-glow)" />
        <path d={arcPath(cx, cy, 46, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </>)}

      {/* ── Knob body (sits proud) ── */}
      <circle cx={cx} cy={cy} r="38" fill="#F0EDE8" filter="url(#lg-body-shadow)" />
      {/* Highlight edge top-left */}
      <circle cx={cx} cy={cy} r="38" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      {/* Shadow edge bottom-right */}
      <circle cx={cx} cy={cy} r="37.2" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />

      {/* ── Indicator ── */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* ── Centre hub ── */}
      <circle cx={cx} cy={cy} r="5.5" fill="#E2DDD7" />
      <circle cx={cx} cy={cy} r="5.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" />
      <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#C0BBB4" strokeWidth="0.75" />
    </svg>
  )
}

// ── Small knob with dot indicator ─────────────────────────────────────────────
function SmallDotKnobSvg({ norm, color }) {
  const cx = 36, cy = 36
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  const dotCx = (cx + 15 * Math.cos(rad)).toFixed(2)
  const dotCy = (cy + 15 * Math.sin(rad)).toFixed(2)

  return (
    <svg width="62" height="62" viewBox="0 0 72 72"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <defs>
        <filter id="sm-d-arc-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
        </filter>
        <filter id="sm-d-body-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#6A5840" floodOpacity="0.18" />
        </filter>
        <linearGradient id="sm-d-well-grad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>

      {/* Well */}
      <circle cx={cx} cy={cy} r="33" fill="#D4D0C8" />
      <circle cx={cx} cy={cy} r="33" fill="url(#sm-d-well-grad)" />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="32.3" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />

      {/* Arc track */}
      <path d={arcPath(cx, cy, 29.5, START_DEG, START_DEG + TOTAL_DEG)}
        fill="none" stroke="#B8B3AB" strokeWidth="2" strokeLinecap="round" />

      {/* Active arc */}
      {norm > 0.005 && (<>
        <path d={arcPath(cx, cy, 29.5, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          opacity="0.3" filter="url(#sm-d-arc-glow)" />
        <path d={arcPath(cx, cy, 29.5, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </>)}

      {/* Knob body */}
      <circle cx={cx} cy={cy} r="24" fill="#F0EDE8" filter="url(#sm-d-body-shadow)" />
      <circle cx={cx} cy={cy} r="24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="23.3" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" />

      {/* Dot indicator */}
      <circle cx={dotCx} cy={dotCy} r="3.5" fill={color} opacity="0.3" filter="url(#sm-d-arc-glow)" />
      <circle cx={dotCx} cy={dotCy} r="2.5" fill={color} />

      {/* Centre hub */}
      <circle cx={cx} cy={cy} r="4" fill="#E2DDD7" />
      <circle cx={cx} cy={cy} r="4" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" />
    </svg>
  )
}

// ── Small knob with line indicator ────────────────────────────────────────────
function SmallLineKnobSvg({ norm, color }) {
  const cx = 36, cy = 36
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  const x1 = (cx + 15 * Math.cos(rad)).toFixed(2)
  const y1 = (cy + 15 * Math.sin(rad)).toFixed(2)
  const x2 = (cx + 20 * Math.cos(rad)).toFixed(2)
  const y2 = (cy + 20 * Math.sin(rad)).toFixed(2)

  return (
    <svg width="62" height="62" viewBox="0 0 72 72"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <defs>
        <filter id="sm-l-arc-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
        </filter>
        <filter id="sm-l-body-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#6A5840" floodOpacity="0.18" />
        </filter>
        <linearGradient id="sm-l-well-grad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>

      {/* Well */}
      <circle cx={cx} cy={cy} r="33" fill="#D4D0C8" />
      <circle cx={cx} cy={cy} r="33" fill="url(#sm-l-well-grad)" />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="32.3" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />

      {/* Arc track */}
      <path d={arcPath(cx, cy, 29.5, START_DEG, START_DEG + TOTAL_DEG)}
        fill="none" stroke="#B8B3AB" strokeWidth="2" strokeLinecap="round" />

      {/* Active arc */}
      {norm > 0.005 && (<>
        <path d={arcPath(cx, cy, 29.5, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          opacity="0.3" filter="url(#sm-l-arc-glow)" />
        <path d={arcPath(cx, cy, 29.5, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </>)}

      {/* Knob body */}
      <circle cx={cx} cy={cy} r="24" fill="#F0EDE8" filter="url(#sm-l-body-shadow)" />
      <circle cx={cx} cy={cy} r="24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="23.3" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" />

      {/* Line indicator */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="2.2" strokeLinecap="round" />

      {/* Centre hub */}
      <circle cx={cx} cy={cy} r="4" fill="#E2DDD7" />
      <circle cx={cx} cy={cy} r="4" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" />
    </svg>
  )
}

// ── Knob wrapper ──────────────────────────────────────────────────────────────
export function Knob({ value, min, max, color, size, indicator, detented, sensitivity = 1, label, displayValue, onChange }) {
  const svgRef = useRef(null)
  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)))

  useKnobDrag(svgRef, { onChange, sensitivity })

  const prevValueRef = useRef(value)
  useEffect(() => {
    if (detented && value !== prevValueRef.current) {
      const el = svgRef.current
      if (el) {
        el.classList.remove('dp')
        void el.offsetWidth
        el.classList.add('dp')
      }
    }
    prevValueRef.current = value
  }, [value, detented])

  const SvgComponent = size === 'large'
    ? LargeKnobSvg
    : indicator === 'dot'
      ? SmallDotKnobSvg
      : SmallLineKnobSvg

  return (
    <div className="knob-unit">
      <div className="knob-val" style={{ color }}>{displayValue}</div>
      <div ref={svgRef} style={{ display: 'inline-block' }}>
        <SvgComponent norm={norm} color={color} />
      </div>
      <div className="knob-label" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  )
}
