// src/constants/animations.js

const ANIM = {
  '4/4':  ['▏', '▎', '▍', '▌'],
  '3/4':  ['╲', '│', '╱'],
  '6/8':  ['···', '···', '···', '▪▪▪', '▪▪▪', '▪▪▪'],
  '2/4':  ['◄', '►'],
  '5/4':  ['███', '██□', '□□□', '██□', '□□□'],
  '7/8':  ['████', '███□', '□□□□', '██□□', '□□□□', '███□', '□□□□'],
  '12/8': ['∙∙∙','●∙∙','∙●∙','∙∙●','∙∙∙','●∙∙','∙●∙','∙∙●','∙∙∙','●∙∙','∙●∙','∙∙●'],
  '9/8':  ['∙∙∙','●∙∙','∙●∙','∙∙●','∙∙∙','●∙∙','∙●∙','∙∙●','∙∙∙'],
}

const TS_KEYS = ['4/4','3/4','6/8','2/4','5/4','7/8','12/8','9/8']

export const IDLE_FRAMES = [
  '── ○ ──',
  '── ◌ ──',
  '── ◎ ──',
  '── ◌ ──',
]

export const CI_FRAMES = ['4', '3', '2', '1']

const TRAIN_BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']

export function getAnimFrame(tsIdx, beatIdx) {
  const key = TS_KEYS[tsIdx]
  if (!key) return ''
  const frames = ANIM[key]
  if (!frames) return ''
  return frames[beatIdx % frames.length]
}

export function getTrainAnimChar(progress) {
  const clamped = Math.max(0, Math.min(1, progress))
  const idx = Math.floor(clamped * (TRAIN_BLOCKS.length - 1))
  return TRAIN_BLOCKS[idx]
}
