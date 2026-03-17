import { useEffect, useRef } from 'react'

/**
 * Attaches drag/scroll/touch listeners to a DOM element ref.
 * Emits raw delta values via onChange — no clamping, no accumulation, no detent.
 * Touch events apply an additional 0.6× factor on top of sensitivity.
 *
 * @param {React.RefObject} elementRef - ref to the element receiving events
 * @param {{ onChange: (delta: number) => void, sensitivity?: number }} options
 */
export function useKnobDrag(elementRef, { onChange, sensitivity = 1 }) {
  const activeRef = useRef(false)
  const prevYRef = useRef(0)
  // Keep callback current without re-subscribing listeners on every render
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    function onMouseDown(e) {
      activeRef.current = true
      prevYRef.current = e.clientY
      e.preventDefault()
      document.body.style.cursor = 'ns-resize'
    }
    function onMouseMove(e) {
      if (!activeRef.current) return
      const delta = (prevYRef.current - e.clientY) * sensitivity
      prevYRef.current = e.clientY
      if (delta !== 0) onChangeRef.current(delta)
    }
    function onMouseUp() {
      activeRef.current = false
      document.body.style.cursor = ''
    }
    function onWheel(e) {
      e.preventDefault()
      onChangeRef.current(e.deltaY < 0 ? 2 * sensitivity : -2 * sensitivity)
    }
    function onTouchStart(e) {
      activeRef.current = true
      prevYRef.current = e.touches[0].clientY
      e.preventDefault()
    }
    function onTouchMove(e) {
      if (!activeRef.current) return
      const delta = (prevYRef.current - e.touches[0].clientY) * sensitivity * 0.6
      prevYRef.current = e.touches[0].clientY
      if (delta !== 0) onChangeRef.current(delta)
    }
    function onTouchEnd() { activeRef.current = false }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [elementRef, sensitivity])
}
