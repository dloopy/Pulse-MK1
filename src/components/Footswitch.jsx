import { useState } from 'react'

export function Footswitch({ mode, running, ciActive, trRunning, onClick }) {
  const [pressed, setPressed] = useState(false)

  function handleClick() {
    setPressed(true)
    setTimeout(() => setPressed(false), 100)
    onClick()
  }

  let stateClass = ''
  let label = 'start'

  if (ciActive) {
    stateClass = 'run-ci'; label = 'stop'
  } else if (running && mode === 'play') {
    stateClass = 'run-play'; label = 'stop'
  } else if (running && mode === 'train' && trRunning) {
    stateClass = 'run-train'; label = 'stop'
  }

  const ariaLabel = running
    ? `Stop metronome (currently running at ${mode} mode)`
    : `Start metronome in ${mode} mode`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={running}
      aria-label={ariaLabel}
      className={`footswitch${stateClass ? ` ${stateClass}` : ''}${pressed ? ' pressed' : ''}`}
      onClick={handleClick}
      onKeyDown={e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleClick() } }}
    >
      <div className="fs-dot" />
      <div className="fs-lbl" aria-hidden="true">{label}</div>
    </div>
  )
}
