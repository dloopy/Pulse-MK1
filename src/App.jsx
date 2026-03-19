// src/App.jsx
import { MetronomePedal } from './components/MetronomePedal'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <MetronomePedal />
      <Analytics />
    </>
  )
}
