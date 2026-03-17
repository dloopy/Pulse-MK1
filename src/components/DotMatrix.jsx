export const DIGIT_WIDTH = 5
export const DIGIT_HEIGHT = 7

const BITMAPS = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ],
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,1,1,1,1],
  ],
  '3': [
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '4': [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
  ],
  '5': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '6': [
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '7': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  '8': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '9': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,1,1,0,0],
  ],
  ' ': Array(7).fill(Array(5).fill(0)),
}

export function getDigitBitmap(char) {
  return BITMAPS[char] || BITMAPS[' ']
}

const DOT_R = 1.8
const DOT_GAP = 5.2
const DIGIT_GAP = 8
const DIGIT_PX_W = DIGIT_WIDTH * DOT_GAP
const MATRIX_H = DIGIT_HEIGHT * DOT_GAP

const LIT = 'var(--display-lit)'
const UNLIT = 'var(--display-unlit)'

export function DotMatrix({ value, glowColor }) {
  const chars = String(Math.round(value)).split('')
  const numDigits = chars.length
  const totalW = numDigits * DIGIT_PX_W + (numDigits - 1) * DIGIT_GAP + 4

  const litColor = glowColor || LIT

  return (
    <svg
      width={totalW}
      height={MATRIX_H + 4}
      viewBox={`0 0 ${totalW} ${MATRIX_H + 4}`}
      style={{ display: 'block' }}
    >
      {chars.map((char, digitIdx) => {
        const bitmap = getDigitBitmap(char)
        const offsetX = digitIdx * (DIGIT_PX_W + DIGIT_GAP) + 2

        return bitmap.map((row, rowIdx) =>
          row.map((lit, colIdx) => (
            <circle
              key={`${digitIdx}-${rowIdx}-${colIdx}`}
              cx={offsetX + colIdx * DOT_GAP + DOT_GAP / 2}
              cy={rowIdx * DOT_GAP + DOT_GAP / 2 + 2}
              r={DOT_R}
              fill={lit ? litColor : UNLIT}
            />
          ))
        )
      })}
    </svg>
  )
}
