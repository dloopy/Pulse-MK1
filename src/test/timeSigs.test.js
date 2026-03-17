import { TIME_SIGNATURES } from '../constants/timeSigs'

describe('TIME_SIGNATURES', () => {
  it('has exactly 8 entries', () => {
    expect(TIME_SIGNATURES).toHaveLength(8)
  })

  it('first entry is 4/4 with 4 beats', () => {
    expect(TIME_SIGNATURES[0]).toEqual({ n: 4, d: 4, beats: 4 })
  })

  it('cycle order matches spec: 4/4 3/4 6/8 2/4 5/4 7/8 12/8 9/8', () => {
    const keys = TIME_SIGNATURES.map(ts => `${ts.n}/${ts.d}`)
    expect(keys).toEqual(['4/4','3/4','6/8','2/4','5/4','7/8','12/8','9/8'])
  })

  it('beats field matches numerator for all entries', () => {
    expect(TIME_SIGNATURES[0].beats).toBe(4)
    expect(TIME_SIGNATURES[1].beats).toBe(3)
    expect(TIME_SIGNATURES[2].beats).toBe(6)
    expect(TIME_SIGNATURES[3].beats).toBe(2)
    expect(TIME_SIGNATURES[4].beats).toBe(5)
    expect(TIME_SIGNATURES[5].beats).toBe(7)
    expect(TIME_SIGNATURES[6].beats).toBe(12)
    expect(TIME_SIGNATURES[7].beats).toBe(9)
  })
})
