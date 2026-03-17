import { getAnimFrame, IDLE_FRAMES, CI_FRAMES, getTrainAnimChar } from '../constants/animations'

describe('getAnimFrame', () => {
  it('returns a string for all 8 time signatures at beat 0', () => {
    for (let i = 0; i < 8; i++) {
      expect(typeof getAnimFrame(i, 0)).toBe('string')
    }
  })

  it('cycles frames using modulo — beat 4 equals beat 0 for 4/4', () => {
    expect(getAnimFrame(0, 4)).toBe(getAnimFrame(0, 0))
  })

  it('3/4 has 3 distinct frames', () => {
    const frames = [0, 1, 2].map(b => getAnimFrame(1, b))
    expect(new Set(frames).size).toBe(3)
  })

  it('returns empty string for invalid tsIdx', () => {
    expect(getAnimFrame(99, 0)).toBe('')
  })
})

describe('IDLE_FRAMES', () => {
  it('has 4 frames', () => expect(IDLE_FRAMES).toHaveLength(4))
  it('each frame is non-empty', () => {
    IDLE_FRAMES.forEach(f => expect(f.length).toBeGreaterThan(0))
  })
})

describe('CI_FRAMES', () => {
  it('is [4, 3, 2, 1]', () => expect(CI_FRAMES).toEqual(['4', '3', '2', '1']))
})

describe('getTrainAnimChar', () => {
  it('returns lowest block at 0%', () => expect(getTrainAnimChar(0)).toBe('▁'))
  it('returns highest block at 100%', () => expect(getTrainAnimChar(1)).toBe('█'))
  it('clamps below 0', () => expect(getTrainAnimChar(-1)).toBe('▁'))
  it('clamps above 1', () => expect(getTrainAnimChar(2)).toBe('█'))
})
