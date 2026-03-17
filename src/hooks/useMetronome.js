// src/hooks/useMetronome.js
import { useRef, useState, useEffect, useCallback } from 'react'
import { TIME_SIGNATURES } from '../constants/timeSigs'

const LOOKAHEAD_SEC = 0.1   // schedule beats this far ahead
const SCHEDULER_MS  = 25    // scheduler tick interval
const MIN_BPM = 30
const MAX_BPM = 240

export function useMetronome({ bpm, tsIdx, vol, ciOn, mode, tr, running, onBpmChange, onTrainerComplete }) {
  // ── React state (drives rendering) ───────────────────────────────────────
  const [beatIdx, setBeatIdx] = useState(0)
  const [ciActive, setCiActive] = useState(false)
  const [trRunningState, setTrRunningState] = useState(false)
  const [trProgress, setTrProgress] = useState(0)

  // ── Audio and timing refs ─────────────────────────────────────────────────
  const audioCtxRef     = useRef(null)
  const schedulerTimer  = useRef(null)
  const nextBeatTimeRef = useRef(0)
  const nextVisualTimeRef = useRef(0)
  const beatCountRef    = useRef(0)
  const isRunningRef    = useRef(false)

  // ── Count-in refs ─────────────────────────────────────────────────────────
  const ciActiveRef  = useRef(false)
  const ciBeatRef    = useRef(0)

  // ── Trainer refs ──────────────────────────────────────────────────────────
  const trRunningRef   = useRef(false)
  const trBarCountRef  = useRef(0)
  const trDirectionRef = useRef(1)   // +1 ascending, -1 descending — fixed at startTrainer()
  const trStartBpmRef  = useRef(bpm)

  // ── Mirror props into refs so scheduler closure always sees current values ─
  const bpmRef    = useRef(bpm)
  const volRef    = useRef(vol)
  const tsIdxRef  = useRef(tsIdx)
  const modeRef   = useRef(mode)
  const trRef     = useRef(tr)
  const onBpmChangeRef          = useRef(onBpmChange)
  const onTrainerCompleteRef    = useRef(onTrainerComplete)

  useEffect(() => { bpmRef.current    = bpm    }, [bpm])
  useEffect(() => { volRef.current    = vol    }, [vol])
  useEffect(() => { tsIdxRef.current  = tsIdx  }, [tsIdx])
  useEffect(() => { modeRef.current   = mode   }, [mode])
  useEffect(() => { trRef.current     = tr     }, [tr])
  useEffect(() => { onBpmChangeRef.current         = onBpmChange         }, [onBpmChange])
  useEffect(() => { onTrainerCompleteRef.current   = onTrainerComplete   }, [onTrainerComplete])

  // ── AudioContext (lazy — created on first user interaction) ───────────────
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }

  // ── Click synthesis — fire-and-forget oscillator per beat ─────────────────
  // CRITICAL: create a NEW OscillatorNode for every beat. Do not reuse.
  function scheduleBeat(time, isDownbeat, isCi) {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = isCi ? 1100 : (isDownbeat ? 820 : 580)
    const amplitude = isDownbeat ? 0.12 : 0.06
    const v = (volRef.current / 100) * amplitude * (isCi ? 1.3 : 1)
    gain.gain.setValueAtTime(v, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
    osc.start(time)
    osc.stop(time + 0.05)
  }

  // ── Trainer advancement ───────────────────────────────────────────────────
  function advanceTrainer() {
    trBarCountRef.current = 0
    const { target, step } = trRef.current
    const dir  = trDirectionRef.current // fixed at startTrainer() — never recomputed
    const next = bpmRef.current + step * dir
    const done = dir > 0 ? next >= target : next <= target

    if (done) {
      bpmRef.current = target
      trRunningRef.current = false
      setTrRunningState(false) // triggers Display's trRunning false-edge → \o/ animation
      setTrProgress(1)
      onBpmChangeRef.current(target)
      onTrainerCompleteRef.current()
    } else {
      const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, next))
      bpmRef.current = clamped
      onBpmChangeRef.current(clamped)
      const total = Math.abs(trRef.current.target - trStartBpmRef.current)
      const done2 = Math.abs(clamped - trStartBpmRef.current)
      setTrProgress(total > 0 ? Math.min(1, done2 / total) : 0)
    }
  }

  // ── Scheduler tick — runs every 25ms ─────────────────────────────────────
  function schedulerTick() {
    const ctx = audioCtxRef.current
    if (!ctx || !isRunningRef.current) return
    const now = ctx.currentTime
    const { beats } = TIME_SIGNATURES[tsIdxRef.current]
    const spb = 60 / bpmRef.current // seconds per beat

    // 1. Schedule audio beats within lookahead window
    while (nextBeatTimeRef.current < now + LOOKAHEAD_SEC) {
      const beatTime   = nextBeatTimeRef.current
      const isDownbeat = beatCountRef.current % beats === 0
      scheduleBeat(beatTime, isDownbeat, ciActiveRef.current)
      beatCountRef.current += 1
      nextBeatTimeRef.current += spb
    }

    // 2. Fire visual update when the next scheduled beat arrives
    if (now >= nextVisualTimeRef.current) {
      const { beats: curBeats } = TIME_SIGNATURES[tsIdxRef.current]

      if (ciActiveRef.current) {
        // Count-in visual update
        const beatInBar = ciBeatRef.current % curBeats
        setBeatIdx(beatInBar)
        ciBeatRef.current += 1

        if (ciBeatRef.current >= curBeats) {
          // Count-in complete — transition to normal play
          ciActiveRef.current = false
          setCiActive(false)
          ciBeatRef.current  = 0
          beatCountRef.current = 0
        }
      } else {
        // Normal play/train visual update
        const newBeat = beatCountRef.current % curBeats
        setBeatIdx(newBeat)

        // Trainer bar tracking
        if (modeRef.current === 'train' && trRunningRef.current && newBeat === 0 && beatCountRef.current > 0) {
          trBarCountRef.current += 1
          if (trBarCountRef.current >= trRef.current.bars) {
            advanceTrainer()
          }
        }
      }

      // Advance visual timer UNCONDITIONALLY — outside both branches
      // so CI→play transition doesn't cause a double-advance or timing gap
      nextVisualTimeRef.current += 60 / bpmRef.current
    }
  }

  // ── ciOnRef — needed inside start() to read ciOn without stale closure ────
  const ciOnRef = useRef(ciOn)
  useEffect(() => { ciOnRef.current = ciOn }, [ciOn])

  // ── Start ─────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    const ctx = getAudioCtx()
    isRunningRef.current = true
    beatCountRef.current = 0
    setBeatIdx(0)

    const startTime = ctx.currentTime + 0.05
    nextBeatTimeRef.current  = startTime
    nextVisualTimeRef.current = startTime

    if (ciOnRef.current) {
      ciActiveRef.current = true
      ciBeatRef.current   = 0
      setCiActive(true)
    } else {
      ciActiveRef.current = false
      setCiActive(false)
    }

    clearInterval(schedulerTimer.current)
    schedulerTimer.current = setInterval(schedulerTick, SCHEDULER_MS)
  }, []) // no deps — reads everything via refs

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    isRunningRef.current   = false
    ciActiveRef.current    = false
    trRunningRef.current   = false
    setCiActive(false)
    setTrRunningState(false)
    clearInterval(schedulerTimer.current)
    setBeatIdx(0)
    setTrProgress(0)
  }, [])

  // ── startTrainer — direction fixed at call time ───────────────────────────
  const startTrainer = useCallback(() => {
    trDirectionRef.current  = trRef.current.target >= bpmRef.current ? 1 : -1
    trStartBpmRef.current   = bpmRef.current
    trBarCountRef.current   = 0
    trRunningRef.current    = true
    setTrRunningState(true)
    setTrProgress(0)
    if (!isRunningRef.current) start()
  }, [start])

  const stopTrainer = useCallback(() => {
    trRunningRef.current = false
    setTrRunningState(false)
  }, [])

  // Stop engine if running prop goes false externally
  useEffect(() => {
    if (!running && isRunningRef.current) stop()
  }, [running, stop])

  // Cleanup on unmount
  useEffect(() => () => clearInterval(schedulerTimer.current), [])

  return { beatIdx, ciActive, trRunning: trRunningState, trProgress, start, stop, startTrainer, stopTrainer }
}
