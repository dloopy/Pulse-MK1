import { useState } from 'react'
import { useMetronome } from './hooks/useMetronome'

export default function App() {
  const [bpm, setBpm] = useState(120)
  const [running, setRunning] = useState(false)
  const { beatIdx, ciActive, start, stop } = useMetronome({
    bpm, tsIdx: 0, vol: 75, ciOn: false, mode: 'play',
    tr: { target: 160, step: 2, bars: 4 }, running,
    onBpmChange: setBpm, onTrainerComplete: () => {},
  })

  return (
    <div style={{ padding: 40 }}>
      <div>BPM: {bpm} | Beat: {beatIdx} | CI: {String(ciActive)}</div>
      <button onClick={() => { setRunning(true); start() }}>Start</button>
      <button onClick={() => { setRunning(false); stop() }}>Stop</button>
    </div>
  )
}
