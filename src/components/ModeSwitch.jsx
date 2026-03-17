export function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch">
      <div
        className={`mode-opt${mode === 'play' ? ' active-play' : ''}`}
        onClick={() => onChange('play')}
      >
        Play
      </div>
      <div
        className={`mode-opt${mode === 'train' ? ' active-train' : ''}`}
        onClick={() => onChange('train')}
      >
        Train
      </div>
    </div>
  )
}
