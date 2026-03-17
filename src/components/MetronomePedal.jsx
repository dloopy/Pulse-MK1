// src/components/MetronomePedal.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMetronome } from '../hooks/useMetronome'
import { loadState, saveState } from '../hooks/useLocalStorage'
import { TIME_SIGNATURES } from '../constants/timeSigs'
import { SUBS } from '../constants/subdivisions'
import { SOUNDS } from '../constants/sounds'
import { Display } from './Display'
import { Knob } from './Knob'
import { LEDRow } from './LEDRow'
import { ModeSwitch } from './ModeSwitch'
import { TimeSigButton } from './TimeSigButton'
import { CountInButton } from './CountInButton'
import { SoundButton } from './SoundButton'
import { Footswitch } from './Footswitch'

const MIN_BPM = 30
const MAX_BPM = 240
const AMBER   = '#E8A020'

// Detent accumulator: adds delta to accumulator, steps value by 1 per threshold crossed
function applyDetent(accRef, delta, threshold, min, max, current) {
  accRef.current += delta
  let val = current
  while (accRef.current >= threshold)  { val = Math.min(max, val + 1); accRef.current -= threshold }
  while (accRef.current <= -threshold) { val = Math.max(min, val - 1); accRef.current += threshold }
  return val
}

// ── Corner screw ──────────────────────────────────────────────────────────────
function PanelScrew({ className }) {
  return <div className={`panel-screw ${className}`} />
}

export function MetronomePedal() {
  // ── Config state (persisted to localStorage) ──────────────────────────────
  const [bpm, setBpm]         = useState(() => loadState().bpm)
  const [tsIdx, setTsIdx]     = useState(() => loadState().tsIdx)
  const [subIdx, setSubIdx]   = useState(() => loadState().subIdx)
  const [vol, setVol]         = useState(() => loadState().vol)
  const [soundIdx, setSoundIdx] = useState(() => loadState().soundIdx)
  const [tr, setTr]           = useState(() => loadState().tr)

  // ── Runtime state (not persisted) ─────────────────────────────────────────
  const [mode, setMode]       = useState('play')
  const [running, setRunning] = useState(false)
  const [ciOn, setCiOn]       = useState(false)

  // ── Detent accumulators ────────────────────────────────────────────────────
  const subAccRef  = useRef(0)
  const barsAccRef = useRef(0)
  const stepAccRef = useRef(0)

  // ── Tap tempo ─────────────────────────────────────────────────────────────
  const tapTimesRef = useRef([])

  // ── Persist config on change ───────────────────────────────────────────────
  useEffect(() => {
    saveState({ bpm, tsIdx, subIdx, vol, soundIdx, tr })
  }, [bpm, tsIdx, subIdx, vol, soundIdx, tr])

  // ── useMetronome callbacks ────────────────────────────────────────────────
  const handleBpmChange       = useCallback((newBpm) => setBpm(newBpm), [])
  const handleTrainerComplete = useCallback(() => {}, [])

  // ── Hook ─────────────────────────────────────────────────────────────────
  const {
    beatIdx, ciActive, trRunning, trProgress,
    start, stop, startTrainer, stopTrainer
  } = useMetronome({
    bpm, tsIdx, subIdx, vol, ciOn, mode, tr, running, soundIdx,
    onBpmChange: handleBpmChange,
    onTrainerComplete: handleTrainerComplete,
  })

  // ── Footswitch handler ────────────────────────────────────────────────────
  const handleFootswitch = useCallback(() => {
    if (mode === 'play') {
      if (running) { setRunning(false); stop() }
      else         { setRunning(true);  start() }
    } else {
      if (!running) {
        setRunning(true)
        startTrainer()
      } else if (trRunning) {
        setRunning(false)
        stop()
      } else {
        setRunning(false)
        stop()
      }
    }
  }, [mode, running, trRunning, start, stop, startTrainer])

  // ── Keyboard handler ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT') return

      if (e.code === 'Space') {
        e.preventDefault()
        handleFootswitch()
      }

      if (e.code === 'KeyT' && mode === 'play') {
        const now = Date.now()
        tapTimesRef.current = tapTimesRef.current.filter(t => now - t < 3000)
        tapTimesRef.current.push(now)
        if (tapTimesRef.current.length >= 2) {
          const intervals = tapTimesRef.current.slice(1).map((t, i) => t - tapTimesRef.current[i])
          const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
          setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(60000 / avg))))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, handleFootswitch])

  // ── Knob onChange handlers ────────────────────────────────────────────────
  function handleCentreChange(delta) {
    if (mode === 'play') {
      setBpm(v => Math.min(MAX_BPM, Math.max(MIN_BPM, v + delta)))
    } else {
      setTr(t => ({ ...t, target: Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(t.target + delta))) }))
    }
  }

  function handleLeftChange(delta) {
    if (mode === 'play') {
      const next = applyDetent(subAccRef, delta, 18, 0, SUBS.length - 1, subIdx)
      if (next !== subIdx) setSubIdx(next)
    } else {
      const next = applyDetent(barsAccRef, delta, 14, 1, 16, tr.bars)
      if (next !== tr.bars) setTr(t => ({ ...t, bars: next }))
    }
  }

  function handleRightChange(delta) {
    if (mode === 'play') {
      setVol(v => Math.min(100, Math.max(0, v + delta)))
    } else {
      const next = applyDetent(stepAccRef, delta, 14, 1, 20, tr.step)
      if (next !== tr.step) setTr(t => ({ ...t, step: next }))
    }
  }

  // ── Mode switch ───────────────────────────────────────────────────────────
  function handleModeChange(newMode) {
    if (newMode === mode) return
    setMode(newMode)
    subAccRef.current  = 0
    barsAccRef.current = 0
    stepAccRef.current = 0
  }

  // ── Sound selector ────────────────────────────────────────────────────────
  function handleSoundChange() {
    setSoundIdx(i => (i + 1) % SOUNDS.length)
  }

  // ── Knob props resolved by mode ───────────────────────────────────────────
  const leftKnob = mode === 'play'
    ? { value: subIdx,   min: 0,       max: SUBS.length - 1, label: 'sub',    displayValue: SUBS[subIdx],        detented: true,  indicator: 'dot'  }
    : { value: tr.bars,  min: 1,       max: 16,              label: 'bars',   displayValue: `${tr.bars}b`,       detented: true,  indicator: 'dot'  }

  const centreKnob = mode === 'play'
    ? { value: bpm,      min: MIN_BPM, max: MAX_BPM,         label: 'tempo',  displayValue: `${Math.round(bpm)}` }
    : { value: tr.target,min: MIN_BPM, max: MAX_BPM,         label: 'target', displayValue: `${tr.target}`       }

  const rightKnob = mode === 'play'
    ? { value: vol,      min: 0,       max: 100,             label: 'vol',    displayValue: `${Math.round(vol)}%`, detented: false, indicator: 'line' }
    : { value: tr.step,  min: 1,       max: 20,              label: 'step',   displayValue: `+${tr.step}`,         detented: true,  indicator: 'line' }

  return (
    <div className={`panel${mode === 'train' ? ' train-mode' : ''}`}>

      {/* Corner screws */}
      <PanelScrew className="tl" />
      <PanelScrew className="tr" />
      <PanelScrew className="bl" />
      <PanelScrew className="br" />

      {/* Top bar: wordmark + LEDs */}
      <div className="topbar">
        <div className="wordmark">Pulse · mk1</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <LEDRow tsIdx={tsIdx} beatIdx={beatIdx} mode={mode} ciActive={ciActive} />
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 7, letterSpacing: '0.2em', color: '#C8C3BC', textTransform: 'uppercase' }}>
            beat
          </div>
        </div>
      </div>

      {/* OLED display */}
      <Display
        mode={mode} running={running} ciActive={ciActive} ciOn={ciOn}
        bpm={bpm} tsIdx={tsIdx} tr={tr} trRunning={trRunning}
        trProgress={trProgress} beatIdx={beatIdx} soundIdx={soundIdx}
      />

      {/* Mode switch */}
      <ModeSwitch mode={mode} onChange={handleModeChange} />

      {/* Button row: time sig · sound · count-in */}
      <div className="btn-row">
        <TimeSigButton tsIdx={tsIdx} onClick={() => setTsIdx(i => (i + 1) % TIME_SIGNATURES.length)} />
        <SoundButton soundIdx={soundIdx} onClick={handleSoundChange} />
        <CountInButton ciOn={ciOn} onClick={() => setCiOn(v => !v)} />
      </div>

      <div className="divider" />

      {/* Knob row */}
      <div className="knobs-row">
        <Knob {...leftKnob}   color={AMBER} size="small"  sensitivity={1}                         onChange={handleLeftChange} />
        <Knob {...centreKnob} color={AMBER} size="large"  sensitivity={0.9} indicator="line"      onChange={handleCentreChange} />
        <Knob {...rightKnob}  color={AMBER} size="small"  sensitivity={mode === 'play' ? 0.6 : 1} onChange={handleRightChange} />
      </div>

      {/* Footswitch + keyboard hints */}
      <div className="foot-row">
        <Footswitch
          mode={mode} running={running} ciActive={ciActive}
          trRunning={trRunning} onClick={handleFootswitch}
        />
        <div className="foot-hints">
          <div className="foot-hint">start / stop <span>space</span></div>
          <div className="foot-hint">tap tempo <span>t</span></div>
        </div>
      </div>

    </div>
  )
}
