// src/components/SoundButton.jsx
import { useState, useEffect, useRef } from 'react'
import { SOUNDS } from '../constants/sounds'
import { SoundSvg } from './SoundIcon'

export function SoundButton({ soundIdx, onClick }) {
  const [showLabel, setShowLabel] = useState(false)
  const timerRef = useRef(null)

  function handleClick() {
    onClick()
    clearTimeout(timerRef.current)
    setShowLabel(true)
    timerRef.current = setTimeout(() => setShowLabel(false), 900)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <button className="icon-btn sound-icon-btn" onClick={handleClick} aria-label="Change sound">
      {showLabel
        ? <span className="sound-label">{SOUNDS[soundIdx].label}</span>
        : <SoundSvg soundIdx={soundIdx} />
      }
    </button>
  )
}
