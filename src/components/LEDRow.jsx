import { TIME_SIGNATURES } from '../constants/timeSigs'

export function LEDRow({ tsIdx, beatIdx, mode, ciActive }) {
  const { beats } = TIME_SIGNATURES[tsIdx]
  const currentBeat = beatIdx % beats

  function ledClass(i) {
    const size = i === 0 ? 'b1' : 'bn'
    if (i === currentBeat) {
      if (ciActive) return `led ${size} ci`
      return `led ${size} ${mode === 'play' ? 'on-p' : 'on-t'}`
    }
    return `led ${size} ${mode === 'play' ? 'off-p' : 'off-t'}`
  }

  return (
    <div className="beat-row">
      {Array.from({ length: beats }, (_, i) => (
        <div key={i} className={ledClass(i)} />
      ))}
    </div>
  )
}
