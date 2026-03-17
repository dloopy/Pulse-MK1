// src/components/Display.jsx
import { useState, useEffect, useRef } from 'react'
import { IDLE_FRAMES } from '../constants/animations'
import { TIME_SIGNATURES } from '../constants/timeSigs'
import { DotMatrix } from './DotMatrix'
import { SoundIcon } from './SoundIcon'

const AMBER = '#E8A020'
const CREAM = 'var(--display-lit)'

export function Display({ mode, running, ciActive, ciOn, bpm, tsIdx, tr, trRunning, trProgress, beatIdx, soundIdx }) {
  const [idleFrame, setIdleFrame] = useState(0)
  const idleTimerRef = useRef(null)

  const isIdle = !running && !ciActive

  // Idle breathing animation
  useEffect(() => {
    if (isIdle) {
      idleTimerRef.current = setInterval(() => {
        setIdleFrame(f => (f + 1) % IDLE_FRAMES.length)
      }, 600)
    } else {
      clearInterval(idleTimerRef.current)
    }
    return () => clearInterval(idleTimerRef.current)
  }, [isIdle])

  const { n, d } = TIME_SIGNATURES[tsIdx]
  const bpmGlowColor = ciActive ? AMBER : undefined

  const progressWidth = (running && mode === 'train' && trRunning)
    ? `${Math.min(100, trProgress * 100)}%`
    : '0%'

  return (
    <div className="disp-outer">
      <div className="disp-inner">

        {/* Right badge column: time sig / sound icon / CI */}
        <div className="badge-col">
          <div className="badge-ts">
            <div className="ts-n">{n}</div>
            <div className="ts-line" />
            <div className="ts-d">{d}</div>
          </div>
          <SoundIcon soundIdx={soundIdx} running={running} beatIdx={beatIdx} />
          <div className={`badge-ci${ciOn ? ' on' : ''}`} style={{ position: 'static' }}>CI</div>
        </div>

        {/* ── Idle view ── */}
        <div className={`d-idle${isIdle ? ' active' : ''}`}>
          <div className="idle-char" style={{ color: CREAM }}>{IDLE_FRAMES[idleFrame]}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: 'var(--display-dim)', letterSpacing: '0.2em', marginTop: 2
          }}>
            pulse
          </div>
        </div>

        {/* ── Play view — BPM only ── */}
        <div className={`d-play${!isIdle && mode === 'play' ? ' active' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <DotMatrix value={bpm} glowColor={bpmGlowColor} />
            <div className="bpm-unit" style={{ color: 'var(--display-dim)' }}>bpm</div>
          </div>
        </div>

        {/* ── Train view — BPM + target/step/bars ── */}
        <div className={`d-train${!isIdle && mode === 'train' ? ' active' : ''}`}>
          <DotMatrix value={bpm} glowColor={bpmGlowColor} />
          <div className="train-row">
            <span className="tr-arrow" style={{ color: 'var(--color-train)' }}>→</span>
            <span className="tr-val"   style={{ color: 'var(--color-train)' }}>{tr.target}</span>
            <span className="tr-sep"   style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim"   style={{ color: 'var(--display-dim)' }}>+{tr.step} bpm</span>
            <span className="tr-sep"   style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim"   style={{ color: 'var(--display-dim)' }}>{tr.bars} bars</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="prog-track">
          <div className="prog-fill" style={{ width: progressWidth }} />
        </div>

      </div>
    </div>
  )
}
