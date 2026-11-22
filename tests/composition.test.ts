import { describe, expect, it } from 'vitest'
import { ATOMIC_MASSES, calculatePercentages } from '../src/pages/material-cards/composition'
import { MATERIALS } from '../src/pages/material-cards/materials'

describe('atomic masses and composition percentages', () => {
  it('defines an atomic mass for every element used by the materials', () => {
    const symbols = new Set(MATERIALS.flatMap((material) => material.elements.map((element) => element.sym)))

    for (const symbol of symbols) {
      expect(ATOMIC_MASSES[symbol], `missing atomic mass for ${symbol}`).toBeGreaterThan(0)
    }
  })

  it('calculates UO2 mass percentages from standard atomic masses', () => {
    const pitchblende = MATERIALS.find((material) => material.name === 'Pitchblende')
    if (!pitchblende) throw new Error('missing Pitchblende material')

    const [uranium, oxygen] = calculatePercentages(pitchblende.elements, 'mass')
    expect(uranium.pct).toBeCloseTo(88.15, 1)
    expect(oxygen.pct).toBeCloseTo(11.85, 1)
  })

  it('calculates atomic percentages from atom counts', () => {
    const water = MATERIALS.find((material) => material.name === 'Water')
    if (!water) throw new Error('missing Water material')

    const [hydrogen, oxygen] = calculatePercentages(water.elements, 'atomic')
    expect(hydrogen.pct).toBeCloseTo(200 / 3, 10)
    expect(oxygen.pct).toBeCloseTo(100 / 3, 10)
  })

  it('normalizes every material to 100 percent for both bases', () => {
    for (const material of MATERIALS) {
      for (const basis of ['mass', 'atomic'] as const) {
        const total = calculatePercentages(material.elements, basis).reduce((sum, element) => sum + element.pct, 0)
        expect(total, `${material.name} (${basis})`).toBeCloseTo(100, 10)
      }
    }
  })

  it('fails clearly when a mass ratio needs an unknown atomic mass', () => {
    expect(() => calculatePercentages([{ sym: 'Xx', n: 1 }], 'mass')).toThrow('Unknown atomic mass for element: Xx')
  })
})
