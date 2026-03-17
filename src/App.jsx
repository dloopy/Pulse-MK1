import { Display } from './components/Display'

export default function App() {
  return (
    <div style={{ padding: 40, background: '#E8E4DE', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Display mode="play" running={false} ciActive={false} ciOn={false}
        bpm={120} tsIdx={0} tr={{ target: 160, step: 2, bars: 4 }}
        trRunning={false} trProgress={0} beatIdx={0} />
      <Display mode="play" running={true} ciActive={false} ciOn={true}
        bpm={120} tsIdx={0} tr={{ target: 160, step: 2, bars: 4 }}
        trRunning={false} trProgress={0} beatIdx={2} />
      <Display mode="train" running={true} ciActive={false} ciOn={false}
        bpm={130} tsIdx={0} tr={{ target: 160, step: 2, bars: 4 }}
        trRunning={true} trProgress={0.33} beatIdx={0} />
    </div>
  )
}
