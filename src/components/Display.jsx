// src/components/Display.jsx
import { useState, useEffect, useRef } from 'react'
import { getAnimFrame, getTrainAnimChar, IDLE_FRAMES, CI_FRAMES } from '../constants/animations'
import { TIME_SIGNATURES } from '../constants/timeSigs'
import { DotMatrix } from './DotMatrix'

const AMBER = '#E8A020'
const CREAM = 'var(--display-lit)'

export function Display({ mode, running, ciActive, ciOn, bpm, tsIdx, tr, trRunning, trProgress, beatIdx }) {
  const [idleFrame, setIdleFrame] = useState(0)
  const idleTimerRef = useRef(null)
  const [celebrating, setCelebrating] = useState(false)

  const isIdle = !running && !ciActive

  // Idle breathing animation — setInterval is OK here (UI animation, not audio timing)
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

  // Detect trainer completion (trRunning false-edge while engine still running)
  // trRunning false-edge → 1-second \o/ celebration
  const prevTrRunning = useRef(trRunning)
  useEffect(() => {
    const prev = prevTrRunning.current
    prevTrRunning.current = trRunning // always update unconditionally BEFORE the check
    if (prev && !trRunning && running) {
      setCelebrating(true)
      const t = setTimeout(() => setCelebrating(false), 1000)
      return () => clearTimeout(t)
    }
  }, [trRunning, running])

  // Animation area content — used in both play and train views
  function getAnimContent() {
    if (ciActive) {
      const { beats } = TIME_SIGNATURES[tsIdx]
      const beatInBar = beatIdx % beats
      // Countdown: always 4-3-2-1; early beats clamp to '4' for time sigs with >4 beats
      return CI_FRAMES[Math.max(0, Math.min(3, beats - 1 - beatInBar))]
    }
    if (celebrating) return '\\o/'
    if (mode === 'train' && trRunning) return getTrainAnimChar(trProgress)
    return getAnimFrame(tsIdx, beatIdx)
  }

  const { n, d } = TIME_SIGNATURES[tsIdx]
  const animContent = getAnimContent()
  // BPM dot-matrix glows amber during count-in
  const bpmGlowColor = ciActive ? AMBER : undefined

  const progressWidth = (running && mode === 'train' && trRunning)
    ? `${Math.min(100, trProgress * 100)}%`
    : '0%'

  return (
    <div className="disp-outer">
      <div className="disp-inner">

        {/* Top-right: time sig badge — always visible */}
        <div className="badge-ts">
          <div className="ts-n">{n}</div>
          <div className="ts-line" />
          <div className="ts-d">{d}</div>
        </div>

        {/* Bottom-right: CI badge — only when ciOn enabled */}
        <div className={`badge-ci${ciOn ? ' on' : ''}`}>CI</div>

        {/* ── Idle view — full display taken over ── */}
        <div className={`d-idle${isIdle ? ' active' : ''}`}>
          <div className="idle-char" style={{ color: CREAM }}>{IDLE_FRAMES[idleFrame]}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: 'var(--display-dim)', letterSpacing: '0.2em', marginTop: 2
          }}>
            pulse
          </div>
        </div>

        {/* ── Play view ── */}
        <div className={`d-play${!isIdle && mode === 'play' ? ' active' : ''}`}>
          <div className="disp-content">
            <div className="anim-area" style={{ color: CREAM }}>{animContent}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <DotMatrix value={bpm} glowColor={bpmGlowColor} />
              <div className="bpm-unit" style={{ color: 'var(--display-dim)' }}>bpm</div>
            </div>
          </div>
        </div>

        {/* ── Train view ── */}
        <div className={`d-train${!isIdle && mode === 'train' ? ' active' : ''}`}>
          {/* anim-area present in train view — shows climbing block or \o/ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="anim-area" style={{ color: CREAM, fontSize: 13 }}>{animContent}</div>
            <DotMatrix value={bpm} glowColor={bpmGlowColor} />
          </div>
          <div className="train-row">
            <span className="tr-arrow" style={{ color: 'var(--color-train)' }}>→</span>
            <span className="tr-val" style={{ color: 'var(--color-train)' }}>{tr.target}</span>
            <span className="tr-sep" style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim" style={{ color: 'var(--display-dim)' }}>+{tr.step} bpm</span>
            <span className="tr-sep" style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim" style={{ color: 'var(--display-dim)' }}>{tr.bars} bars</span>
          </div>
        </div>

        {/* Progress bar at display bottom */}
        <div className="prog-track">
          <div className="prog-fill" style={{ width: progressWidth }} />
        </div>

      </div>
    </div>
  )
}
