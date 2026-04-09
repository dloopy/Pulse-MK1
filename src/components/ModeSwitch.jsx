// src/components/ModeSwitch.jsx
export function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-track" role="group" aria-label="Mode">
      {/* Sliding white pill */}
      <div className={`mode-pill${mode === 'train' ? ' right' : ''}`} aria-hidden="true" />
      {/* Labels sit above the pill in z-order */}
      <div className="mode-labels" role="radiogroup" aria-label="Select mode">
        <span
          role="radio"
          aria-checked={mode === 'play'}
          tabIndex={mode === 'play' ? 0 : -1}
          className={`mode-lbl${mode === 'play' ? ' on-play' : ''}`}
          onClick={() => onChange('play')}
          onKeyDown={e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); onChange('play') } }}
        >Play</span>
        <span
          role="radio"
          aria-checked={mode === 'train'}
          tabIndex={mode === 'train' ? 0 : -1}
          className={`mode-lbl${mode === 'train' ? ' on-train' : ''}`}
          onClick={() => onChange('train')}
          onKeyDown={e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); onChange('train') } }}
        >Train</span>
      </div>
    </div>
  )
}
