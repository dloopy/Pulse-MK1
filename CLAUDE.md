# Pulse — Claude Code Memory

> Browser-based precision metronome. Skeuomorphic hardware pedal aesthetic. React 18 + Vite 6 + Tailwind + Web Audio API.

## Build & Test

```bash
npm install            # Install deps (Node 18+)
npm run dev            # Vite dev server
npm run build          # Production build -> dist/
npm run preview        # Preview production build
npm test               # Vitest (jsdom env)
npm run test:ui        # Vitest UI
```

## Architecture

- Entry: `index.html` -> `src/main.jsx` -> `src/App.jsx`
- `src/components/` — UI components (skeuomorphic pedal pieces)
- `src/hooks/` — Custom hooks (audio scheduling, knob drag, etc.)
- `src/utils/` — Pure helpers
- `src/constants/` — BPM ranges, subdivision defs, color tokens
- `src/styles/` — Tailwind + custom CSS
- `src/test/` — Vitest setup + component tests

## Design Principles

See `docs/design-context.md` for the full brief. Non-negotiables:

1. The device metaphor is sacred — every decision reinforces "this is a piece of gear"
2. Legibility at arm's length — users glance while playing an instrument
3. Amber = alive — amber accent is reserved exclusively for active/running states
4. Boutique personality — the brand has voice; wordmark, idle, and empty states should not whisper

Anti-references: Generic SaaS dashboards, neon dark mode, flat icon apps.

## Audio / Timing

- All sound synthesized in real-time via Web Audio API — zero assets
- BPM range: 30–240
- Timing must stay rock-solid; use `AudioContext.currentTime` for scheduling, never `setInterval` for beat playback
- Visual beat indicator is allowed to drift; audio must not

## Conventions

- JSX over TSX (current codebase is JS). Don't introduce TS without reason.
- Tailwind utility-first; custom CSS only for non-tokenizable pedal textures
- Fonts: DM Mono (values/readouts), DM Sans (labels/wordmark)
- Component files are PascalCase, hooks are `useSomething.js`
- Tests colocated under `src/test/` with `.test.jsx` suffix

## Known Traps

- Vitest config is inside `vite.config.js` (not a separate `vitest.config`). Don't duplicate.
- `private: true` in package.json — do not `npm publish`
- Large critique PNGs live in `docs/critiques/` — don't re-add them at project root

## Docs

- `docs/design-context.md` — design brief (source of truth for aesthetic decisions)
- `docs/pulse-mk1-spec.html` — original spec (named for the historical "mk1" iteration; product is now just "Pulse")
- `docs/pulse-mk1-prototype.html` — original standalone HTML prototype
- `docs/animation-idea.txt` — loose animation notes
