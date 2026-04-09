// src/components/Display.jsx
import { TIME_SIGNATURES } from '../constants/timeSigs'
import { DotMatrix } from './DotMatrix'
import { SoundIcon } from './SoundIcon'

const AMBER = '#E8A020'

export function Display({ mode, running, ciActive, ciOn, bpm, tsIdx, tr, trRunning, trProgress, beatIdx, soundIdx }) {
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

        {/* BPM dot-matrix — always visible */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, opacity: running ? 1 : 0.6, transition: 'opacity 0.3s' }}>
          <DotMatrix value={bpm} glowColor={running ? bpmGlowColor : undefined} />
          <div className="bpm-unit" style={{ color: 'var(--display-dim)' }}>bpm</div>
        </div>

        {/* Train row — only in train mode */}
        {mode === 'train' && (
          <div className="train-row">
            <span className="tr-arrow" style={{ color: AMBER }}>→</span>
            <span className="tr-val"   style={{ color: AMBER }}>{tr.target}</span>
            <span className="tr-sep"   style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim"   style={{ color: 'var(--display-dim)' }}>+{tr.step} bpm</span>
            <span className="tr-sep"   style={{ color: 'var(--display-dim)' }}>·</span>
            <span className="tr-dim"   style={{ color: 'var(--display-dim)' }}>{tr.bars} bars</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="prog-track">
          <div className="prog-fill" style={{ width: progressWidth }} />
        </div>

      </div>
    </div>
  )
}
