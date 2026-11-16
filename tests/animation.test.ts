import { describe, expect, it } from 'vitest'
import { mixPercentages, resolveDuration } from '../src/use-animated-percentages'
import type { ElementProportion } from '../src/composition'

function element(sym: string, pct: number): ElementProportion {
  return { sym, n: 1, pct, color: '#008fff' }
}

const from = [element('Fe', 70), element('O', 30)]
const to = [element('Fe', 40), element('O', 60)]

describe('mixPercentages', () => {
  it('returns the start and end compositions at the animation bounds', () => {
    expect(mixPercentages(from, to, 0).map((item) => item.pct)).toEqual([70, 30])
    expect(mixPercentages(from, to, 1).map((item) => item.pct)).toEqual([40, 60])
  })

  it('eases faster than linear so the switch settles quickly', () => {
    const mid = mixPercentages(from, to, 0.5)
    expect(mid[0].pct).toBeCloseTo(43.75, 10)
    expect(mid[1].pct).toBeCloseTo(56.25, 10)
  })

  it('keeps every intermediate frame summing to 100%', () => {
    for (let step = 0; step <= 20; step++) {
      const frame = mixPercentages(from, to, step / 20)
      const total = frame.reduce((sum, item) => sum + item.pct, 0)
      expect(total, `progress ${step / 20}`).toBeCloseTo(100, 10)
    }
  })

  it('keeps each wedge between its start and end share', () => {
    for (let step = 0; step <= 20; step++) {
      const [iron] = mixPercentages(from, to, step / 20)
      expect(iron.pct).toBeGreaterThanOrEqual(40)
      expect(iron.pct).toBeLessThanOrEqual(70)
    }
  })

  it('preserves element order and metadata while animating', () => {
    const frame = mixPercentages(from, to, 0.5)
    expect(frame.map((item) => item.sym)).toEqual(['Fe', 'O'])
    expect(frame[0]).toMatchObject({ sym: 'Fe', n: 1, color: '#008fff' })
    expect(frame[1]).toMatchObject({ sym: 'O', n: 1, color: '#008fff' })
  })

  it('clamps progress outside the 0..1 range', () => {
    expect(mixPercentages(from, to, -1).map((item) => item.pct)).toEqual([70, 30])
    expect(mixPercentages(from, to, 2).map((item) => item.pct)).toEqual([40, 60])
  })

  it('leaves an unchanged composition untouched', () => {
    expect(mixPercentages(from, from, 0.5).map((item) => item.pct)).toEqual([70, 30])
  })
})

describe('resolveDuration', () => {
  it('keeps the requested duration when motion is allowed', () => {
    expect(resolveDuration(520, false)).toBe(520)
  })

  it('shortens the animation when reduced motion is requested', () => {
    expect(resolveDuration(520, true)).toBe(160)
  })

  it('never lengthens an already short animation', () => {
    expect(resolveDuration(80, true)).toBe(80)
  })

  it('disables the animation when the requested duration is zero or negative', () => {
    expect(resolveDuration(0, false)).toBe(0)
    expect(resolveDuration(-10, true)).toBe(0)
  })
})
