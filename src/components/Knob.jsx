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

function GlowFilter({ id }) {
  return (
    <defs>
      <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="1 0.5 0 0 0
                  0.5 0.3 0 0 0
                  0   0   0 0 0
                  0   0   0 12 -3"
          result="amberGlow" />
        <feMerge>
          <feMergeNode in="amberGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

function LargeKnobSvg({ norm, color }) {
  const cx = 54, cy = 54
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  const x1 = (cx + 22 * Math.cos(rad)).toFixed(2)
  const y1 = (cy + 22 * Math.sin(rad)).toFixed(2)
  const x2 = (cx + 31 * Math.cos(rad)).toFixed(2)
  const y2 = (cy + 31 * Math.sin(rad)).toFixed(2)
  const filterId = 'knob-glow-large'

  return (
    <svg width="98" height="98" viewBox="0 0 108 108"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <GlowFilter id={filterId} />
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="#E0DBD4" strokeWidth="4"/>
      {norm > 0.005 && (
        <path d={arcPath(cx, cy, 50, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          filter={`url(#${filterId})`} />
      )}
      <circle cx={cx} cy={cy} r="40" fill="#EDEBE6"/>
      <circle cx={cx} cy={cy} r="40" fill="none" stroke="#F8F6F2" strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r="40" fill="none" stroke="#D8D3CC" strokeWidth="0.75"/>
      <circle cx={cx} cy={cy} r="31" fill="#F4F1EC"/>
      <circle cx={cx} cy={cy} r="31" fill="none" stroke="#E2DDD6" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r="18" fill="#F0EDE8"/>
      <circle cx={cx} cy={cy} r="18" fill="none" stroke="#DDD9D2" strokeWidth="0.75"/>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="3" strokeLinecap="round"
        filter={`url(#${filterId})`} />
      <circle cx={cx} cy={cy} r="5" fill="#E8E4DE"/>
      <circle cx={cx} cy={cy} r="5" fill="none" stroke="#CEC9C2" strokeWidth="0.75"/>
      <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#C8C3BC" strokeWidth="0.75"/>
    </svg>
  )
}

function SmallDotKnobSvg({ norm, color }) {
  const cx = 36, cy = 36
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  const dotCx = (cx + 14 * Math.cos(rad)).toFixed(2)
  const dotCy = (cy + 14 * Math.sin(rad)).toFixed(2)
  const filterId = 'knob-glow-dot'

  return (
    <svg width="62" height="62" viewBox="0 0 72 72"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <GlowFilter id={filterId} />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke="#E0DBD4" strokeWidth="3.5"/>
      {norm > 0.005 && (
        <path d={arcPath(cx, cy, 33, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          filter={`url(#${filterId})`} />
      )}
      <circle cx={cx} cy={cy} r="26" fill="#EDEAE5"/>
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="#F5F3EF" strokeWidth="2"/>
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="#D4CFC8" strokeWidth="0.75"/>
      <circle cx={cx} cy={cy} r="20" fill="#F2EFE9"/>
      <circle cx={dotCx} cy={dotCy} r="3.5" fill={color} filter={`url(#${filterId})`}/>
      <circle cx={cx} cy={cy} r="5" fill="#E8E4DE"/>
      <circle cx={cx} cy={cy} r="5" fill="none" stroke="#D0CBC3" strokeWidth="0.75"/>
    </svg>
  )
}

function SmallLineKnobSvg({ norm, color }) {
  const cx = 36, cy = 36
  const deg = normToDeg(norm)
  const rad = degToRad(deg)
  const x1 = (cx + 13 * Math.cos(rad)).toFixed(2)
  const y1 = (cy + 13 * Math.sin(rad)).toFixed(2)
  const x2 = (cx + 18 * Math.cos(rad)).toFixed(2)
  const y2 = (cy + 18 * Math.sin(rad)).toFixed(2)
  const filterId = 'knob-glow-line'

  return (
    <svg width="62" height="62" viewBox="0 0 72 72"
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'block' }}>
      <GlowFilter id={filterId} />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke="#E0DBD4" strokeWidth="3.5"/>
      {norm > 0.005 && (
        <path d={arcPath(cx, cy, 33, START_DEG, deg)}
          fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          filter={`url(#${filterId})`} />
      )}
      <circle cx={cx} cy={cy} r="26" fill="#EDEAE5"/>
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="#F5F3EF" strokeWidth="2"/>
      <circle cx={cx} cy={cy} r="26" fill="none" stroke="#D4CFC8" strokeWidth="0.75"/>
      <circle cx={cx} cy={cy} r="20" fill="#F2EFE9"/>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="2" strokeLinecap="round"
        filter={`url(#${filterId})`} />
      <circle cx={cx} cy={cy} r="5" fill="#E8E4DE"/>
      <circle cx={cx} cy={cy} r="5" fill="none" stroke="#D0CBC3" strokeWidth="0.75"/>
    </svg>
  )
}

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
      {/* svgRef on wrapper div — useKnobDrag attaches mouse/touch listeners here */}
      <div ref={svgRef} style={{ display: 'inline-block' }}>
        <SvgComponent norm={norm} color={color} />
      </div>
      <div className="knob-label" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  )
}
