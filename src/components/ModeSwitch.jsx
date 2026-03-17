// src/components/ModeSwitch.jsx
export function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-track">
      {/* Sliding white pill */}
      <div className={`mode-pill${mode === 'train' ? ' right' : ''}`} />
      {/* Labels sit above the pill in z-order */}
      <div className="mode-labels">
        <span
          className={`mode-lbl${mode === 'play' ? ' on-play' : ''}`}
          onClick={() => onChange('play')}
        >Play</span>
        <span
          className={`mode-lbl${mode === 'train' ? ' on-train' : ''}`}
          onClick={() => onChange('train')}
        >Train</span>
      </div>
    </div>
  )
}
