import { SUBS, DEFAULT_SUB_IDX } from '../constants/subdivisions'

describe('SUBS', () => {
  it('has exactly 9 entries', () => expect(SUBS).toHaveLength(9))
  it('first entry is 1/32', () => expect(SUBS[0]).toBe('1/32'))
  it('last entry is whole note', () => expect(SUBS[8]).toBe('1'))
  it('DEFAULT_SUB_IDX is 6 (1/4)', () => {
    expect(DEFAULT_SUB_IDX).toBe(6)
    expect(SUBS[DEFAULT_SUB_IDX]).toBe('1/4')
  })
  it('includes all triplets', () => {
    expect(SUBS).toContain('1/16T')
    expect(SUBS).toContain('1/8T')
    expect(SUBS).toContain('1/4T')
  })
})
