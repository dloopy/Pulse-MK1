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

  return (
    <div
      className={`footswitch${stateClass ? ` ${stateClass}` : ''}${pressed ? ' pressed' : ''}`}
      onClick={handleClick}
    >
      <div className="fs-dot" />
      <div className="fs-lbl">{label}</div>
    </div>
  )
}
