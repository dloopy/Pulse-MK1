import { useState } from 'react'
import { TIME_SIGNATURES } from '../constants/timeSigs'

export function TimeSigButton({ tsIdx, onClick }) {
  const [flashing, setFlashing] = useState(false)
  const { n, d } = TIME_SIGNATURES[tsIdx]

  function handleClick() {
    onClick()
    setFlashing(true)
    setTimeout(() => setFlashing(false), 130)
  }

  return (
    <div
      className="icon-btn ts-icon-btn"
      onClick={handleClick}
      aria-label={`Time signature ${n}/${d} — click to change`}
      style={flashing ? { background: '#EEF4E8', borderColor: '#A8CC88' } : {}}
    >
      <div className="ts-num">{n}</div>
      <div className="ts-bar" />
      <div className="ts-num">{d}</div>
    </div>
  )
}
