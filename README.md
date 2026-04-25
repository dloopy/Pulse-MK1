# PULSE

> A precision metronome for musicians who care about how their tools look and feel.

---

```
┌──────────────────────────────────────┐
│  ·  ·                      P U L S E │
│  ● ○ ○ ○                             │
│ ┌────────────────────────────────┐   │
│ │ ▓▓  ▓  ▓▓▓  ▓▓▓            TS │   │
│ │ ▓   ▓  ▓    ▓    ──          ♩ │   │
│ │ ▓▓▓ ▓  ▓▓▓  ▓▓▓           4/4 │   │
│ └────────────────────────────────┘   │
│         [ PLAY  | TRAIN ]            │
│   [♪]        [4/4]       [◎]        │
│   ────────────────────────────────   │
│  TEMPO      VOLUME     SUBDIVISION   │
│   120        75%          ♩          │
│  (  O  )   (  O  )    (  O  )       │
│                                      │
│     (          STEP          )       │
└──────────────────────────────────────┘
```

---

## What it is

Pulse is a browser-based metronome built to feel like a piece of physical hardware — something between a Braun desk instrument and a Teenage Engineering OP-1. No ads, no accounts, no fluff. Just a very precise click and a UI that looks good on your screen while you practice.

It runs entirely in the browser. Zero backend. All sound is synthesised in real-time using the Web Audio API.

---

## Features

**Timing**
- BPM range: 30 – 240
- Audio-locked visual sync via Chris Wilson's two-loop scheduler — the LED fires at the exact same moment as the click, not 100ms later
- 9 subdivision modes: whole, half, quarter (default), eighth, eighth triplet, sixteenth, sixteenth triplet, thirty-second, quarter triplet

**Sound**
- 6 synthesised sounds — Click, Woodblock, Sine, Rim, Hi-hat, Beep
- All sounds are normalised to a consistent perceived loudness
- Downbeat is accented; subdivisions play at 30% volume

**Time signatures**
- 4/4 · 3/4 · 6/8 · 2/4 · 5/4 · 7/8 · 12/8 · 9/8

**Modes**
- **Play** — standard metronome with BPM display
- **Train** — BPM trainer that automatically advances tempo every N bars, with configurable step size and direction

**Count-in**
- One-bar count-in before playback begins, using a distinct high triangle click

**Visual**
- Dot-matrix BPM display (bitmap font, OLED-style dark surface)
- Beat LEDs that flash in time with audio
- Animated sound icon in the display — downbeat pulses larger and brighter
- Physical-feeling knobs with recessed well + proud body SVG architecture
- Knob labels flash in mode color (rust/teal) when switching Play↔Train, signaling that knob assignments have changed
- Sound button briefly shows the sound name on press before switching to its icon
- Inset mode switch slider with keyboard navigation and ARIA radio semantics
- Uniform button row — all three buttons (time sig, sound, count-in) are the same size
- Corner screws because of course

**Accessibility**

- Full keyboard navigation: Space to start/stop, T for tap tempo, Enter/Space on mode switch and footswitch
- ARIA roles on all interactive controls — footswitch (`button`, `aria-pressed`), mode switch (`radiogroup`), sound button announces current sound
- `prefers-reduced-motion` respected globally — all animations and transitions collapse for users who need it

**Persistence**
- All settings saved to `localStorage` — BPM, time sig, subdivision, volume, sound, trainer config

---

## Tech

| | |
|---|---|
| Framework | React 18 |
| Build | Vite 6 |
| Audio | Web Audio API (no dependencies) |
| Styling | Plain CSS + CSS custom properties |
| Tests | Vitest + Testing Library |
| Fonts | DM Sans, DM Mono |

No audio libraries. No UI component libraries. Sound synthesis is hand-written oscillators and filtered noise — triangle waves, bandpass noise, sine oscillators, highpass noise, square waves.

---

## Audio architecture

The scheduler uses the Chris Wilson two-loop pattern to decouple audio scheduling from visual rendering:

- A `setInterval` loop (25ms) runs ahead by 100ms, scheduling Web Audio events at precise future timestamps
- A `requestAnimationFrame` loop polls `audioCtx.currentTime` and fires visual state updates (LED, beat index) only when the scheduled time arrives

This means the click and the visual flash are locked to the same audio clock — not to `setTimeout` drift or React render timing.

---

## Getting started

```bash
npm install
npm run dev
```

```bash
npm test          # run tests
npm run test:ui   # Vitest UI
npm run build     # production build
```

---

## Keyboard / interaction

| Control | Action |
|---|---|
| Footswitch (large button) | Start / Stop |
| Sound button | Cycle through 6 sounds |
| Time sig button | Cycle through 8 time signatures |
| Count-in button | Toggle one-bar count-in |
| Tempo knob | Drag up/down or scroll |
| Volume knob | Drag up/down or scroll |
| Subdivision knob | Drag up/down or scroll (detented) |

---

## Project structure

```
src/
├── components/
│   ├── MetronomePedal.jsx   # root panel, all state
│   ├── Display.jsx          # OLED display area
│   ├── DotMatrix.jsx        # bitmap BPM renderer
│   ├── Knob.jsx             # SVG knobs (large + small)
│   ├── ModeSwitch.jsx       # play / train slider
│   ├── Footswitch.jsx       # main start/stop button
│   ├── SoundIcon.jsx        # animated beat icons
│   ├── SoundButton.jsx      # sound selector
│   ├── TimeSigButton.jsx
│   ├── CountInButton.jsx
│   └── LEDRow.jsx
├── hooks/
│   ├── useMetronome.js      # audio scheduler + trainer
│   ├── useKnobDrag.js       # pointer/touch/scroll → delta
│   └── useLocalStorage.js
├── utils/
│   └── soundSynth.js        # all 6 synthesised sounds
├── constants/
│   ├── sounds.js
│   ├── timeSigs.js
│   ├── subdivisions.js
│   └── animations.js
└── styles/
    └── panel.css
```

---

*Built with care. Use it daily.*
