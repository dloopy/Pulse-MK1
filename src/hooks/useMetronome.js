// src/hooks/useMetronome.js
import { useRef, useState, useEffect, useCallback } from 'react'
import { TIME_SIGNATURES } from '../constants/timeSigs'
import { synthesizeBeat } from '../utils/soundSynth'

const LOOKAHEAD_SEC = 0.1   // schedule beats this far ahead
const SCHEDULER_MS  = 25    // scheduler tick interval

// Subdivision multipliers: how many audio ticks per beat
const SUBS_MULT = [8, 16/3, 4, 8/3, 2, 3/2, 1, 1/2, 1/4]

const MIN_BPM = 30
const MAX_BPM = 240

export function useMetronome({ bpm, tsIdx, subIdx, vol, ciOn, mode, tr, running, soundIdx, onBpmChange, onTrainerComplete }) {
  // ── React state (drives rendering) ───────────────────────────────────────
  const [beatIdx, setBeatIdx]           = useState(0)
  const [ciActive, setCiActive]         = useState(false)
  const [trRunningState, setTrRunning]  = useState(false)
  const [trProgress, setTrProgress]     = useState(0)

  // ── Audio refs ────────────────────────────────────────────────────────────
  const audioCtxRef    = useRef(null)
  const noiseBufferRef = useRef(null)   // shared white-noise AudioBuffer

  // ── Scheduler refs ────────────────────────────────────────────────────────
  const schedulerTimer  = useRef(null)
  const rafRef          = useRef(null)
  const nextBeatTimeRef = useRef(0)
  const beatCountRef    = useRef(0)
  const isRunningRef    = useRef(false)

  // notesInQueue: [{beatIndex, time, isCi, ciComplete?, beatCount?}]
  const notesInQueue = useRef([])

  // ── Count-in refs ─────────────────────────────────────────────────────────
  const ciActiveRef = useRef(false)
  const ciBeatRef   = useRef(0)

  // ── Trainer refs ──────────────────────────────────────────────────────────
  const trRunningRef   = useRef(false)
  const trBarCountRef  = useRef(0)
  const trDirectionRef = useRef(1)
  const trStartBpmRef  = useRef(bpm)

  // ── Prop mirrors (refs so closures always see current values) ─────────────
  const bpmRef      = useRef(bpm)
  const volRef      = useRef(vol)
  const tsIdxRef    = useRef(tsIdx)
  const subIdxRef   = useRef(subIdx ?? 6)
  const modeRef     = useRef(mode)
  const trRef       = useRef(tr)
  const soundIdxRef = useRef(soundIdx ?? 0)
  const onBpmChangeRef         = useRef(onBpmChange)
  const onTrainerCompleteRef   = useRef(onTrainerComplete)
  const ciOnRef                = useRef(ciOn)

  useEffect(() => { bpmRef.current      = bpm    }, [bpm])
  useEffect(() => { volRef.current      = vol    }, [vol])
  useEffect(() => { tsIdxRef.current    = tsIdx  }, [tsIdx])
  useEffect(() => { subIdxRef.current   = subIdx ?? 6 }, [subIdx])
  useEffect(() => { modeRef.current     = mode   }, [mode])
  useEffect(() => { trRef.current       = tr     }, [tr])
  useEffect(() => { soundIdxRef.current = soundIdx ?? 0 }, [soundIdx])
  useEffect(() => { onBpmChangeRef.current       = onBpmChange       }, [onBpmChange])
  useEffect(() => { onTrainerCompleteRef.current = onTrainerComplete }, [onTrainerComplete])
  useEffect(() => { ciOnRef.current              = ciOn              }, [ciOn])

  // ── AudioContext (lazy, created on first user interaction) ────────────────
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }

  // ── White-noise buffer (created once per AudioContext) ────────────────────
  function getNoiseBuffer() {
    if (!noiseBufferRef.current) {
      const ctx  = audioCtxRef.current
      const size = Math.ceil(ctx.sampleRate * 0.3) // 300ms, long enough for any sound
      const buf  = ctx.createBuffer(1, size, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
      noiseBufferRef.current = buf
    }
    return noiseBufferRef.current
  }

  // ── Trainer advancement ───────────────────────────────────────────────────
  function advanceTrainer() {
    trBarCountRef.current = 0
    const { target, step } = trRef.current
    const dir  = trDirectionRef.current
    const next = bpmRef.current + step * dir
    const done = dir > 0 ? next >= target : next <= target

    if (done) {
      bpmRef.current = target
      trRunningRef.current = false
      setTrRunning(false)
      setTrProgress(1)
      onBpmChangeRef.current(target)
      onTrainerCompleteRef.current()
    } else {
      const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, next))
      bpmRef.current = clamped
      onBpmChangeRef.current(clamped)
      const total = Math.abs(trRef.current.target - trStartBpmRef.current)
      const prog  = Math.abs(clamped - trStartBpmRef.current)
      setTrProgress(total > 0 ? Math.min(1, prog / total) : 0)
    }
  }

  // ── Scheduler tick — runs every 25ms ─────────────────────────────────────
  // Only schedules Web Audio events and pushes visual notes to notesInQueue.
  // No React state updates here.
  function schedulerTick() {
    const ctx = audioCtxRef.current
    if (!ctx || !isRunningRef.current) return

    const now  = ctx.currentTime
    const { beats } = TIME_SIGNATURES[tsIdxRef.current]
    const spb  = 60 / bpmRef.current  // seconds per beat

    const mult      = SUBS_MULT[subIdxRef.current] ?? 1
    const skipEvery = mult < 1 ? Math.round(1 / mult) : 1

    while (nextBeatTimeRef.current < now + LOOKAHEAD_SEC) {
      const beatTime = nextBeatTimeRef.current
      const isCi     = ciActiveRef.current

      if (isCi) {
        // ── Count-in beat ──
        const beatIndex  = ciBeatRef.current % beats
        const isDownbeat = beatIndex === 0
        synthesizeBeat(ctx, beatTime, isDownbeat, true, false, volRef.current, soundIdxRef.current, getNoiseBuffer())

        const ciComplete = (ciBeatRef.current + 1 >= beats)
        notesInQueue.current.push({ beatIndex, time: beatTime, isCi: true, ciComplete })

        ciBeatRef.current += 1
        if (ciBeatRef.current >= beats) {
          // Transition to normal play (audio side)
          ciActiveRef.current  = false
          ciBeatRef.current    = 0
          beatCountRef.current = 0
        }
      } else {
        // ── Normal beat ──
        const beatIndex  = beatCountRef.current % beats
        const isDownbeat = beatIndex === 0

        if (skipEvery === 1 || beatCountRef.current % skipEvery === 0) {
          synthesizeBeat(ctx, beatTime, isDownbeat, false, false, volRef.current, soundIdxRef.current, getNoiseBuffer())
        }

        if (mult > 1) {
          const numExtra = Math.round(mult) - 1
          for (let k = 1; k <= numExtra; k++) {
            synthesizeBeat(ctx, beatTime + k * (spb / Math.round(mult)), false, false, true, volRef.current, soundIdxRef.current, getNoiseBuffer())
          }
        }

        notesInQueue.current.push({ beatIndex, time: beatTime, isCi: false, beatCount: beatCountRef.current })
        beatCountRef.current += 1
      }

      nextBeatTimeRef.current += spb
    }
  }

  // ── Visual tick — rAF loop, fires LED updates locked to audio clock ───────
  function visualTick() {
    const ctx = audioCtxRef.current
    if (!ctx || !isRunningRef.current) return

    const now = ctx.currentTime
    while (notesInQueue.current.length && notesInQueue.current[0].time <= now) {
      const note = notesInQueue.current.shift()
      setBeatIdx(note.beatIndex)

      if (note.isCi) {
        if (note.ciComplete) setCiActive(false)
      } else {
        // Trainer bar tracking: advance after each full bar, skip the very first downbeat
        if (modeRef.current === 'train' && trRunningRef.current && note.beatIndex === 0 && note.beatCount > 0) {
          trBarCountRef.current += 1
          if (trBarCountRef.current >= trRef.current.bars) {
            advanceTrainer()
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(visualTick)
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    const ctx = getAudioCtx()
    isRunningRef.current  = true
    beatCountRef.current  = 0
    notesInQueue.current  = []
    setBeatIdx(0)

    const startTime = ctx.currentTime + 0.05
    nextBeatTimeRef.current = startTime

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

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(visualTick)
  }, []) // no deps — reads everything via refs

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    isRunningRef.current  = false
    ciActiveRef.current   = false
    trRunningRef.current  = false
    clearInterval(schedulerTimer.current)
    cancelAnimationFrame(rafRef.current)
    notesInQueue.current  = []
    setCiActive(false)
    setTrRunning(false)
    setBeatIdx(0)
    setTrProgress(0)
  }, [])

  // ── startTrainer — direction fixed at call time ───────────────────────────
  const startTrainer = useCallback(() => {
    trDirectionRef.current = trRef.current.target >= bpmRef.current ? 1 : -1
    trStartBpmRef.current  = bpmRef.current
    trBarCountRef.current  = 0
    trRunningRef.current   = true
    setTrRunning(true)
    setTrProgress(0)
    if (!isRunningRef.current) start()
  }, [start])

  const stopTrainer = useCallback(() => {
    trRunningRef.current = false
    setTrRunning(false)
  }, [])

  // Stop engine if running prop goes false externally
  useEffect(() => {
    if (!running && isRunningRef.current) stop()
  }, [running, stop])

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(schedulerTimer.current)
    cancelAnimationFrame(rafRef.current)
  }, [])

  return { beatIdx, ciActive, trRunning: trRunningState, trProgress, start, stop, startTrainer, stopTrainer }
}
