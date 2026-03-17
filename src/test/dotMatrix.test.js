import { getDigitBitmap, DIGIT_WIDTH, DIGIT_HEIGHT } from '../components/DotMatrix'

describe('getDigitBitmap', () => {
  it('returns a 7-row array for each digit 0-9', () => {
    for (let d = 0; d <= 9; d++) {
      const bitmap = getDigitBitmap(String(d))
      expect(bitmap).toHaveLength(DIGIT_HEIGHT)
      bitmap.forEach(row => expect(row).toHaveLength(DIGIT_WIDTH))
    }
  })

  it('returns empty bitmap for space character', () => {
    const bitmap = getDigitBitmap(' ')
    expect(bitmap).toHaveLength(DIGIT_HEIGHT)
    bitmap.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('digit 1 has at most 2 lit columns (narrow)', () => {
    const bitmap = getDigitBitmap('1')
    const litCols = new Set()
    bitmap.forEach(row => row.forEach((v, col) => { if (v) litCols.add(col) }))
    expect(litCols.size).toBeLessThanOrEqual(3)
  })
})
