// src/utils/soundSynth.js
// All synthesised metronome clicks.
// noiseBuffer: shared AudioBuffer of white noise (created once, reused per ctx).

function makeNoiseSource(ctx, noiseBuffer) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  return src
}

// soundIdx: 0=click  1=woodblock  2=sine  3=rim  4=hihat  5=beep
export function synthesizeBeat(ctx, time, isDownbeat, isCi, isSubdiv, vol, soundIdx, noiseBuffer) {
  const v = vol / 100

  // ── Count-in: always a high triangle click ───────────────────────────────
  if (isCi) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 1100
    gain.gain.setValueAtTime(v * 0.156, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(time); osc.stop(time + 0.05)
    return
  }

  // Scale: downbeat = 1.0, regular beat = 0.55, subdivision = 0.30
  const scale = isSubdiv ? 0.30 : (isDownbeat ? 1.0 : 0.55)

  switch (soundIdx) {
    case 0: { // Click — triangle ~1000/1200 Hz, 20ms  target: 0.18
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = isDownbeat ? 1200 : 1000
      gain.gain.setValueAtTime(v * 0.18 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(time); osc.stop(time + 0.025)
      break
    }
    case 1: { // Woodblock — bandpass noise ~400/500 Hz, 50ms  target: 0.55
      const src  = makeNoiseSource(ctx, noiseBuffer)
      const bp   = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = isDownbeat ? 500 : 400
      bp.Q.value = 6
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(v * 0.55 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
      src.connect(bp); bp.connect(gain); gain.connect(ctx.destination)
      src.start(time); src.stop(time + 0.055)
      break
    }
    case 2: { // Sine — sine oscillator ~880/1046 Hz, 60ms  target: 0.22
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = isDownbeat ? 1046 : 880
      gain.gain.setValueAtTime(v * 0.22 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(time); osc.stop(time + 0.065)
      break
    }
    case 3: { // Rim — highpass noise ~2/2.5 kHz, 25ms  target: 0.45
      const src  = makeNoiseSource(ctx, noiseBuffer)
      const hp   = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = isDownbeat ? 2500 : 2000
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(v * 0.45 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025)
      src.connect(hp); hp.connect(gain); gain.connect(ctx.destination)
      src.start(time); src.stop(time + 0.03)
      break
    }
    case 4: { // Hi-hat — highpass noise ~7/8 kHz, 22ms  target: 0.50
      const src  = makeNoiseSource(ctx, noiseBuffer)
      const hp   = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = isDownbeat ? 8000 : 7000
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(v * 0.50 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.022)
      src.connect(hp); hp.connect(gain); gain.connect(ctx.destination)
      src.start(time); src.stop(time + 0.025)
      break
    }
    case 5: { // Beep — square oscillator ~660/880 Hz, 40ms  target: 0.12
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = isDownbeat ? 880 : 660
      gain.gain.setValueAtTime(v * 0.12 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(time); osc.stop(time + 0.045)
      break
    }
    default: { // Fallback: same as click
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = isDownbeat ? 820 : 580
      gain.gain.setValueAtTime(v * 0.18 * scale, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(time); osc.stop(time + 0.05)
    }
  }
}
