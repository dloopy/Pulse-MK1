import { loadState, saveState, DEFAULT_STATE } from '../hooks/useLocalStorage'

const VALID = {
  bpm: 120, tsIdx: 0, subIdx: 6, vol: 75,
  tr: { target: 160, step: 2, bars: 4 },
}

describe('DEFAULT_STATE', () => {
  it('bpm is 120', () => expect(DEFAULT_STATE.bpm).toBe(120))
  it('tsIdx is 0', () => expect(DEFAULT_STATE.tsIdx).toBe(0))
  it('subIdx is 6', () => expect(DEFAULT_STATE.subIdx).toBe(6))
  it('vol is 75', () => expect(DEFAULT_STATE.vol).toBe(75))
  it('tr has target/step/bars', () => {
    expect(DEFAULT_STATE.tr).toMatchObject({ target: 160, step: 2, bars: 4 })
  })
})

describe('loadState', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when empty', () => {
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns defaults for malformed JSON', () => {
    localStorage.setItem('pulse-mk1-state', 'not-json{{{')
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns stored values when valid', () => {
    localStorage.setItem('pulse-mk1-state', JSON.stringify(VALID))
    expect(loadState().bpm).toBe(120)
    expect(loadState().tsIdx).toBe(0)
  })

  it('falls back to default for out-of-range bpm', () => {
    localStorage.setItem('pulse-mk1-state', JSON.stringify({ ...VALID, bpm: 999 }))
    expect(loadState().bpm).toBe(DEFAULT_STATE.bpm)
  })

  it('falls back to default for out-of-range tsIdx', () => {
    localStorage.setItem('pulse-mk1-state', JSON.stringify({ ...VALID, tsIdx: 99 }))
    expect(loadState().tsIdx).toBe(DEFAULT_STATE.tsIdx)
  })

  it('falls back to default for negative vol', () => {
    localStorage.setItem('pulse-mk1-state', JSON.stringify({ ...VALID, vol: -5 }))
    expect(loadState().vol).toBe(DEFAULT_STATE.vol)
  })

  it('falls back to default for out-of-range tr.target', () => {
    localStorage.setItem('pulse-mk1-state', JSON.stringify({ ...VALID, tr: { ...VALID.tr, target: 999 } }))
    expect(loadState().tr.target).toBe(DEFAULT_STATE.tr.target)
  })
})

describe('saveState', () => {
  beforeEach(() => localStorage.clear())

  it('saves and reads back correctly', () => {
    saveState(VALID)
    expect(JSON.parse(localStorage.getItem('pulse-mk1-state'))).toMatchObject(VALID)
  })
})
