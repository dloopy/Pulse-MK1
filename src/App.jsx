// src/App.jsx
import { MetronomePedal } from './components/MetronomePedal'
import { BackLink } from './components/BackLink'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <BackLink />
      <MetronomePedal />
      <Analytics />
    </>
  )
}
