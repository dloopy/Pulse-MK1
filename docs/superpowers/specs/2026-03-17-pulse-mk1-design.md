# Pulse · mk1 — Design Document

**Date:** 2026-03-17
**Status:** Approved — Final
**Stack:** Vite + React 18 + Tailwind v3
**Reference:** `pulse-mk1-prototype.html` (working visual reference)

---

## 1. Overview

Pulse mk1 is a bass guitar metronome web app. The visual language is Braun/Dieter Rams × Teenage Engineering OP-1 × UA hardware plugins. Tactility is the core feeling — knobs feel physical, interactions feel deliberate.

**Approach:** Hybrid. The prototype's SVG knob geometry, CSS design system, and ASCII animations are preserved as-is. A new React component structure and proper Web Audio engine are built around them.

**Scope for mk1:**
- All must-have core features (tempo, time sig, subdivision, count-in, volume)
- Ideal/v1 features: tempo trainer, Web Audio lookahead scheduler, LocalStorage persistence
- No dark mode, no neo-brutalist theme, no mk2 pro features

---

## 2. Design System

### Typography
- Display (BPM number): DM Mono 300
- Labels (knob labels, badges): DM Sans 600
- Body: DM Sans 400

### Colour Accents (CSS custom properties)
```css
--color-play: #C8501A      /* terracotta — play mode */
--color-train: #4A8FA8     /* steel blue — train mode */
--color-timesig: #7A9E5A   /* moss green — time sig button + badge */
--color-countin: #E8A020   /* amber — count-in button + badge + CI LEDs */
```

### Surface Palette
```css
--surface-panel: #F7F5F1   /* outer panel */
--surface-display: #EDEAE4 /* display inner */
--surface-stage: #E8E4DE   /* page background */
```

### Knob Geometry
- Concentric SVG rings (count differs by size — see Section 4 Knob)
- Arc: 135° → 405° (270° travel)
- Indicator: coloured line (large knob and vol knob), coloured dot (sub/bars knob)
- Sub/step knobs: detented (physical pop animation on step)

---

## 3. File Structure

```
mk1/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── tokens.css          ← CSS custom properties (colours, surfaces, radii)
│   │   └── panel.css           ← prototype CSS ported as-is (knobs, display, buttons)
│   ├── constants/
│   │   ├── timeSigs.js         ← TS array: [{n, d, beats}, …] in cycle order
│   │   ├── subdivisions.js     ← SUBS array: ['1/32','1/16T',…,'1']
│   │   └── animations.js       ← ANIM object (per-ts frames) + IDLE_FRAMES array
│   ├── hooks/
│   │   ├── useMetronome.js     ← Web Audio engine, beat scheduler, trainer logic
│   │   ├── useKnobDrag.js      ← drag/scroll/touch → raw delta via onChange
│   │   └── useLocalStorage.js  ← get/set with JSON serialisation
│   └── components/
│       ├── MetronomePedal.jsx  ← root, state owner, wires hooks → children
│       ├── Display.jsx         ← idle/play/train views + ASCII animations + badges
│       ├── Knob.jsx            ← reusable SVG knob, size/color/indicator/detented props
│       ├── LEDRow.jsx          ← beat LEDs, rebuilds on tsIdx change
│       ├── ModeSwitch.jsx      ← Play/Train pill toggle
│       ├── TimeSigButton.jsx   ← stacked fraction icon button (moss green)
│       ├── CountInButton.jsx   ← arc + bars icon, amber active state
│       └── Footswitch.jsx      ← circular button, press animation, mode-aware colour
```

---

## 4. Component Responsibilities

### `MetronomePedal` — root state owner

Owns all **config state**:
- `bpm` (30–240), `tsIdx` (0–7), `subIdx` (0–8), `vol` (0–100)
- `mode` ('play' | 'train'), `running` (boolean), `ciOn` (boolean)
- `tr: { target, step, bars }` — trainer config

Does **not** own runtime timing state (`ciActive`, `trRunning`, `trProgress`) — those live in `useMetronome`.

LocalStorage persistence: `bpm`, `tsIdx`, `subIdx`, `vol`, `tr`. Mode, `running`, and `ciOn` all reset to defaults on page load (`ciOn` resets to `false`).

Owns the `keydown` event listener (on `window`). Tap tempo handler is gated to `mode === 'play'` only.

Handles detent accumulator logic for sub/bars/step knobs in the respective `onChange` handlers before updating state.

**Mode switch behaviour:** Switching mode does **not** stop the beat engine. `running` remains unchanged. The knobs, display, and colours remap to the new mode. `useMetronome` reacts to the new `mode` prop.

**Footswitch behaviour by mode:**

| Mode | Footswitch press | Effect |
|------|-----------------|--------|
| Play, not running | Start | Calls `start()`. If `ciOn=true`, count-in fires first. |
| Play, running | Stop | Calls `stop()`. `running → false`. |
| Train, not running | Start engine + trainer | Single press: calls `startTrainer()` which internally calls `start()`. One press = go. |
| Train, running, trainer running | Stop everything | Calls `stop()` and `stopTrainer()`. `running → false`, `trRunning → false`. |
| Train, running, trainer not running (completed) | Stop engine | Calls `stop()`. `running → false`. |

**Trainer completion:** When `onTrainerComplete` fires, `MetronomePedal` does nothing special — `trRunning` becomes false inside the hook, the beat engine keeps running. The user must manually stop via the footswitch.

### `Display`

Props: `mode`, `running`, `ciActive`, `ciOn`, `bpm`, `tsIdx`, `tr`, `trRunning`, `trProgress`, `beatIdx`

**Content views** — three mutually exclusive, driven by `running` and `ciActive`:

1. **Idle** — `!running && !ciActive`. Full display taken over by `IDLE_FRAMES` animation (two elements: cycling ASCII char + static `pulse` sub-label in DM Mono 9px, `#C8C3BC` below it).
2. **Play** — `running && mode === 'play'`. Small animation area (left) from `ANIM[tsKey][beatIdx % frames.length]` + large BPM number right (52px DM Mono).
3. **Train** — `running && mode === 'train'`. Smaller BPM (36px) + `→ target · +step bpm · N bars` status line + progress bar at bottom.

`ciActive` is a **modifier** applied on top of the current mode view, not a fourth view. The display view is determined solely by `running` and `mode`. `ciActive` only affects:
- **LED colour** — amber instead of mode colour
- **BPM number colour** — amber glow on the BPM element (applies to both play's large `bpm-big` and train's smaller `train-bpm`)
- **Animation area content** — countdown numbers instead of beat animation

When `ciActive` flips to false mid-beat, the display does not jump or transition. It simply starts rendering the normal beat animation from the next beat. No transition needed.

**Count-in countdown:** `IDLE_FRAMES` is 4 entries. For count-in across any number of beats, display the countdown using `Math.max(0, beats - 1 - beatInBar)` mapped through `['4','3','2','1']` — for time signatures with more than 4 beats, the first beats all show `4` (clamped). This matches the prototype behaviour and is intentional; the visual countdown is always a 4-3-2-1 feel regardless of time signature beat count.

**Always-visible overlay badges:**
- Top-right: time sig fraction in `--color-timesig` — always visible
- Bottom-right: `CI` in `--color-countin` — visible only when `ciOn === true`

**Progress bar:** Rendered at the bottom of the display in train mode. Width driven by `trProgress` prop (0–1 from `useMetronome`). Transitions smoothly at 0.5s. Background is `--color-train`. Hidden (width 0%) when not in train mode or when trainer is not running.

**Animation area after `\o/`:** After the 1-second celebration, the animation area reverts to the per-time-signature animation (`ANIM[tsKey]`) since the engine is still running. `Display` manages this transition internally via a `setTimeout`.

**Idle animation:** Uses its own internal `setInterval` at 600ms. This controls UI animation only, not audio — `setInterval` is acceptable here. Starts when idle state enters, clears when leaving.

**`Display` owns all animation frame logic.** It imports from `constants/animations.js`. `MetronomePedal` never touches frame arrays.

`animations.js` exports a function `getAnimFrame(tsIdx, beatIdx)` rather than the raw `ANIM` object. `Display` calls the function and receives back a string. Frame selection logic lives in one place and is easy to extend.

### `Knob`

Props:
- `value`, `min`, `max` — current value and range
- `color` — CSS custom property string (e.g. `'var(--color-play)'`)
- `size` — `'large'` | `'small'`
- `indicator` — `'dot'` | `'line'` — which type of position indicator to render
- `detented` — boolean; triggers pop animation on step change
- `sensitivity` — number (e.g. `0.9`, `0.6`); forwarded to `useKnobDrag`
- `label` — string, rendered below knob (resolved by `MetronomePedal`, not by `Knob`)
- `displayValue` — string shown above knob (e.g. `'1/4'`, `'120'`, `'75%'`)
- `onChange(delta)` — raw delta callback, `MetronomePedal` handles accumulation/clamping

**SVG ring count per size:**
- `large` (centre knob): track ring (r=50) + 3 inner rings (r=40, r=31, r=18) + centre nub (r=5) = 5 rings
- `small` (left/right knobs): track ring (r=33) + 1 inner ring (r=26) + inner cap (r=20) + centre nub (r=5) = 4 rings

The geometry proportions are similar but not numerically identical between sizes. The `size` prop controls which SVG structure to render.

**Indicator per knob — explicit mapping:**
- Left knob (sub/bars) → `indicator='dot'`: coloured circle orbiting the inner face
- Centre knob (tempo/target) → `indicator='line'`: coloured radial line rotating within the rings
- Right knob (vol/step) → `indicator='line'`: short line (neutral/dimmed colour in play mode, `--color-train` in train mode)

Rule: left=dot, centre=line, right=line. The `size` prop alone does not determine indicator type.

Uses `useKnobDrag` internally. Knob creates its own `ref` for the SVG element and passes it to the hook.

Pop animation on detent: CSS `@keyframes dp` class toggled on step change (remove → force reflow via `offsetWidth` read → re-add).

### `LEDRow`

Props: `tsIdx`, `beatIdx`, `mode`, `ciActive`

Renders N LEDs where N = `TIME_SIGNATURES[tsIdx].beats`. Rebuilds on `tsIdx` change. Beat 0 LED is larger. Colours:
- Play mode, not CI: terracotta on=`#C8501A`, off=`#D8D3CC`
- Train mode, not CI: steel blue on=`#4A8FA8`, off=`#C8D8E4`
- Count-in active (any mode): amber `#E8A020`

### `ModeSwitch`

Props: `mode`, `onChange`

Pill toggle. Switching mode does not stop or restart the beat engine — `onChange` only updates `mode` state in `MetronomePedal`. Play option: terracotta active state. Train option: filled steel blue active state.

### `TimeSigButton`

Props: `tsIdx`, `onClick`

Renders stacked `n / d` fraction as icon. Cycles through 8 signatures on click. Brief green flash on click (130ms background transition).

### `CountInButton`

Props: `ciOn`, `onClick`

Arc + bars icon. When `ciOn=true`: amber background tint, amber arc and bars. Toggles `ciOn` in `MetronomePedal`.

### `Footswitch`

Props: `mode`, `running`, `ciActive`, `trRunning`, `onClick`

Circular button. Press animation: `translateY(2px)` + remove shadow (local state, 100ms timeout to reset). Border/dot colour and label text:
- Idle: neutral, label "start"
- Running, play mode: terracotta, label "stop"
- Running, train mode, `trRunning=true`: steel blue, label "stop"
- Running, train mode, `trRunning=false`: neutral, label "start" (trainer not advancing)
- Count-in active: amber, label "stop"

---

## 5. Hooks

### `useMetronome`

**Signature:**
```js
useMetronome({
  bpm, tsIdx, vol, ciOn, mode, tr, running,
  onBpmChange,       // (newBpm: number) => void — called when trainer advances BPM
  onTrainerComplete, // () => void — called when trainer reaches target
})
// Returns:
{ beatIdx, ciActive, trRunning, trProgress, start, stop, startTrainer, stopTrainer }
```

**Web Audio engine — lookahead scheduler (Chris Wilson pattern):**

`AudioContext` is created lazily on first user interaction (browser autoplay policy). All beat timing uses `AudioContext.currentTime`.

The scheduler runs on a `setInterval` at ~25ms (this is the *scheduling* timer, not the beat timer). On each tick:
1. While `nextBeatTime < audioContext.currentTime + 0.1` (100ms lookahead): schedule the next beat audio at `nextBeatTime`, advance `nextBeatTime += 60 / bpm`.
2. Check whether `audioContext.currentTime >= nextVisualBeatTime`. If so: call `setBeatIdx(i => i + 1)`, advance `nextVisualBeatTime`. This drives LED flash and animation frame updates in React.

`setBeatIdx` is the only React state update in the scheduler tick. All other timing values (`nextBeatTime`, `nextVisualBeatTime`, `beatCount`) are refs.

**Click synthesis — fire-and-forget pattern (critical):**

Create a fresh `OscillatorNode` for every single beat. Do not reuse oscillators — Web Audio oscillators are one-shot. The pattern:

```js
function scheduleBeat(time, isDownbeat) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = isDownbeat ? 820 : 580
  gain.gain.setValueAtTime(scaledVolume, time)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
  osc.start(time)
  osc.stop(time + 0.05)
}
```

- Downbeat (beat 0): 820Hz
- Upbeat: 580Hz
- Count-in tick: 1100Hz
- `scaledVolume = (vol / 100) * amplitude` — amplitude is ~0.12 for downbeat, ~0.06 for upbeat
- All times passed to `osc.start(time)` and `osc.stop(time)` use `audioCtx.currentTime`, not wall-clock time
- No external audio files or libraries

**Count-in logic:**
- When `start()` is called with `ciOn=true`: enter count-in phase. Set `ciActive=true`. Play one full bar (N beats of the current time signature) with amber LEDs and countdown animation.
- Count-in applies in both play mode and train mode.
- After the bar completes, `ciActive=false`, and normal play/train begins.
- Count-in pitch is ~1100Hz for all beats in the count-in bar.

**Trainer logic (all internal to hook):**

`trRunning`, `trBarCount`, `trDirection`, and `trStartBpm` are **refs** (not React state). They do not trigger re-renders.

- `startTrainer()`: set `trDirection = tr.target >= bpm ? 1 : -1` (fixed at start, stored in ref). Set `trStartBpm = bpm`. Reset `trBarCount = 0`. Set `trRunning.current = true`. If not already running, call `start()`.
- `stopTrainer()`: set `trRunning.current = false`. Beat engine keeps playing.
- On each bar completion (beat index resets to 0, mode='train', `trRunning.current=true`): `trBarCount++`. If `trBarCount >= tr.bars`: call `advanceTrainer()`.
- `advanceTrainer()`: `trBarCount = 0`. Compute `nextBpm = bpm + tr.step * trDirection`. Check if done: `trDirection > 0 ? nextBpm >= tr.target : nextBpm <= tr.target`. If done: `bpm = tr.target`, `trRunning.current = false`, call `onTrainerComplete()`, trigger `\o/` animation (1s, managed in Display via prop signal). If not done: clamp `nextBpm` to [MIN, MAX], call `onBpmChange(nextBpm)`. Restart scheduler immediately with new BPM — do not wait for debounce.
- `trProgress` is computed on each scheduler tick as `Math.min(1, Math.abs(bpm - trStartBpm) / Math.abs(tr.target - trStartBpm))`. `trStartBpm` is a **ref**, not React state — do not put it in state or it will trigger re-renders on every advancement. `trProgress` is exposed as React state (updated via `setTrProgress`) so Display can read it as a prop.

**BPM drag while trainer running:** Allowed. The knob updates `bpm` via `onBpmChange` as normal. Direction (`trDirection`) remains fixed from `startTrainer()` call — it does not recompute on each advance. This means dragging past the target mid-session could cause the trainer to keep advancing; this is acceptable prototype behaviour.

**Debounce on drag (play mode):** When `bpm` changes via knob drag in play mode, debounce beat engine restart 260ms after the last change using a ref-held timeout. Prevents audio glitching. In train mode, BPM changes from trainer advancement restart the scheduler immediately (no debounce — the advance is intentional and timed).

### `useKnobDrag`

**Signature:**
```js
useKnobDrag(elementRef, { onChange, sensitivity = 1 })
// onChange(delta: number) called on every movement
// Returns nothing — side-effect only
```

Attaches event listeners on mount (mousedown on element, mousemove/mouseup on document, wheel on element, touchstart/touchmove/touchend). Removes on unmount.

Three input methods:
- **Mouse drag (vertical):** `mousedown` captures start Y. `mousemove` on document: `delta = (prevY - currentY) * sensitivity`. Calls `onChange(delta)` on every pixel moved.
- **Scroll wheel:** `deltaY < 0 ? onChange(+2 * sensitivity) : onChange(-2 * sensitivity)`. `preventDefault()` to stop page scroll.
- **Touch drag:** Same as mouse drag. Touch sensitivity is 0.6× of base sensitivity (applied inside the hook for touch events only, before calling `onChange`).

Raw delta emitted — no clamping, no accumulation, no detent. Caller handles all of that.

### `useLocalStorage`

Single key: `pulse-mk1-state`. Stores one JSON object with all persisted fields: `{ bpm, tsIdx, subIdx, vol, tr }`.

On load: parse the JSON, validate each field is within its valid range before applying. If the JSON is malformed or missing, silently fall back to all defaults. Never let a bad `localStorage` value crash the app.

`MetronomePedal` reads the stored object once on mount and seeds its initial state from it. Writes back the full object on every state change that affects a persisted field.

---

## 6. State Ownership Summary

| State | Owner | Notes |
|-------|-------|-------|
| `bpm` | MetronomePedal | Updated by drag, tap tempo, or `onBpmChange` callback from trainer |
| `tsIdx` | MetronomePedal | 0–7, cycles on TimeSigButton click |
| `subIdx` | MetronomePedal | 0–8 (9 steps: SUBS[0]–SUBS[8]), detented |
| `vol` | MetronomePedal | 0–100, continuous |
| `mode` | MetronomePedal | 'play' \| 'train'; engine continues running on change |
| `running` | MetronomePedal | boolean, toggled by Footswitch; stays true on mode switch |
| `ciOn` | MetronomePedal | boolean; resets to `false` on page load (not persisted) |
| `tr` | MetronomePedal | `{target, step, bars}`, updated by train-mode knobs |
| `ciActive` | useMetronome (state) | Runtime: true during count-in bar |
| `trRunning` | useMetronome (ref + state) | Runtime: true while trainer is advancing |
| `trProgress` | useMetronome (state) | 0–1, progress toward target BPM |
| `beatIdx` | useMetronome (state) | Current beat position for LEDs + animations |
| `trBarCount` | useMetronome (ref) | Internal bar counter, never triggers re-render |
| `trDirection` | useMetronome (ref) | +1 or -1, fixed at `startTrainer()` call |
| `trStartBpm` | useMetronome (ref) | BPM at `startTrainer()` call, for progress calculation |
| `nextBeatTime` | useMetronome (ref) | AudioContext time of next scheduled beat |
| `nextVisualBeatTime` | useMetronome (ref) | Wall-clock time of next visual beat update |

---

## 7. Time Signatures

In cycle order (matches prototype):

| Index | Sig | Beats | Character |
|-------|-----|-------|-----------|
| 0 | 4/4 | 4 | default, most common |
| 1 | 3/4 | 3 | waltz, triple |
| 2 | 6/8 | 6 | compound, funk |
| 3 | 2/4 | 2 | march, half-time |
| 4 | 5/4 | 5 | odd, Brubeck |
| 5 | 7/8 | 7 | odd, Balkan |
| 6 | 12/8 | 12 | compound, blues |
| 7 | 9/8 | 9 | compound triple |

LED count = `beats` field. Beat 0 LED is larger (`b1` class).

---

## 8. Knob Configuration

### Play Mode

| Position | Label | Type | Range | Sensitivity | Threshold | Indicator |
|----------|-------|------|-------|-------------|-----------|-----------|
| Left | sub | detented | 9 steps (SUBS[0]–SUBS[8]) | — | 18px/step | dot |
| Centre | tempo | continuous | 30–240 BPM | 0.9× | — | line |
| Right | vol | continuous | 0–100% | 0.6× | — | line |

### Train Mode

| Position | Label | Type | Range | Sensitivity | Threshold | Indicator |
|----------|-------|------|-------|-------------|-----------|-----------|
| Left | bars | detented | 1–16 bars | — | 14px/step | dot |
| Centre | target | continuous | 30–240 BPM | 0.9× | — | line |
| Right | step | detented | 1–20 BPM | — | 14px/step | line |

Knob arcs and indicators shift from terracotta to steel blue when `mode='train'`. Labels update to match. `MetronomePedal` passes resolved `label`, `displayValue`, `color`, `sensitivity`, and `indicator` props to each `Knob`.

---

## 9. ASCII Animations

Defined in `constants/animations.js`. Ported directly from prototype.

**Per-time-signature animations** (`ANIM` object, indexed by `beatIdx % frames.length`):
- `4/4`: bar block grows each beat
- `3/4`: pendulum `\ | /`
- `6/8`: `· · ·` vs `▪ ▪ ▪` groups
- `5/4`: asymmetric block `███□□`
- `7/8`: asymmetric 4+3 grouping
- `12/8`: rolling dot across three groups
- `9/8`: rolling dot across three groups
- `2/4`: `◄ ►` alternating

**Idle animation** (`IDLE_FRAMES`): `── ○ ──` variants (4 frames) cycling at 600ms. Displayed in two elements: (1) cycling character, (2) static `pulse` label in DM Mono 9px, `#C8C3BC`. Takes over full display when stopped.

**Count-in countdown:** Shows `4 3 2 1` mapped from `CI_FRAMES = ['4','3','2','1']` using `CI_FRAMES[Math.max(0, beats - 1 - beatInBar)]`. For time signatures with more than 4 beats, early beats all show `'4'` (clamped). Intentional — always feels like a 4-3-2-1 count-in.

**Special states:**
- Train running: climbing block character proportional to `trProgress`
- Target reached: `\o/` for 1 second, then reverts to per-time-signature animation (engine still running)
- Count-in: countdown numbers in animation area; BPM number glows amber

---

## 10. Interactions & Keyboard

| Input | Action | Notes |
|-------|--------|-------|
| `Space` | Start / stop | Active in both modes |
| `T` | Tap tempo | **Play mode only.** 3s window, averages last taps, clamps 30–240 |
| Knob drag (vertical) | Adjust value | `useKnobDrag` → raw delta → `MetronomePedal` handler |
| Scroll wheel on knob | Adjust value | Fixed ±2 step × sensitivity |
| Touch drag on knob | Adjust value | 0.6× additional factor applied in hook |
| TimeSigButton click | Cycle time signature | Rebuilds LED row |
| CountInButton click | Toggle count-in | Takes effect on next start |
| ModeSwitch click | Toggle play/train | Engine continues if running |
| Footswitch click | See footswitch table | Section 4 |

`MetronomePedal` owns the `window.addEventListener('keydown', …)` listener. Tap tempo handler checks `mode === 'play'` before processing. Space handler calls the same logic as Footswitch `onClick`.

---

## 11. Technical Requirements

- **Audio timing:** Web Audio API `AudioContext.currentTime` exclusively. Lookahead scheduler with ~100ms lookahead, ~25ms scheduler tick. No `setInterval` for beats.
- **Click synthesis:** `OscillatorNode` + `GainNode` only. No audio files, no external libraries.
- **UI sounds:** Zero. Only the metronome beat produces audio.
- **Mobile:** Touch drag on all knobs. Responsive layout — pedal fits phone screens.
- **Persistence:** `localStorage` for `bpm`, `tsIdx`, `subIdx`, `vol`, `tr`. Mode, `running`, and `ciOn` reset to defaults on load.
- **No dark mode for mk1.** Light/cream surface only.
- **React 18**, **Vite**, **Tailwind v3**. No router. No state library.
- **Tailwind scope:** Layout and spacing only (flex, grid, gap, padding, margin, width). All colours, surface treatments, knob geometry, and custom visual tokens stay in `tokens.css` as CSS custom properties and inline SVG attributes. Do not fight Tailwind to replicate custom colour tokens — it is not worth it.

---

## 12. Out of Scope (mk2)

Gap click/mute training, setlist/presets, swing slider, accent editor, session timer, polyrhythm mode, click sound selector, backbeat mode, dark mode, neo-brutalist theme.
