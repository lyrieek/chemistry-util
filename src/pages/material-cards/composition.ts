import type { Element } from './materials'

export const ATOMIC_MASSES: Readonly<Record<string, number>> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Li: 6.94,
  Na: 22.99,
  Al: 26.9815385,
  Si: 28.085,
  P: 30.973761998,
  Cl: 35.45,
  Ca: 40.078,
  V: 50.9415,
  Cr: 51.9961,
  Mn: 54.938044,
  Fe: 55.845,
  Co: 58.933194,
  Ni: 58.6934,
  Cu: 63.546,
  Nb: 92.90637,
  Mo: 95.95,
  Sn: 118.71,
  Ta: 180.94788,
  W: 183.84,
  U: 238.02891,
}

export type CompositionBasis = 'mass' | 'atomic'

export interface ElementProportion extends Element {
  pct: number
}

export function calculatePercentages(elements: Element[], basis: CompositionBasis): ElementProportion[] {
  const weightedElements = elements.map((element) => {
    if (!Number.isFinite(element.n) || element.n <= 0) {
      throw new Error(`Invalid atom count for ${element.sym}: ${element.n}`)
    }

    if (basis === 'atomic') return { element, weight: element.n }

    if (!Object.hasOwn(ATOMIC_MASSES, element.sym)) throw new Error(`Unknown atomic mass for element: ${element.sym}`)
    return { element, weight: element.n * ATOMIC_MASSES[element.sym] }
  })
  const totalWeight = weightedElements.reduce((total, item) => total + item.weight, 0)

  if (totalWeight === 0) return []
  return weightedElements.map(({ element, weight }) => ({
    sym: element.sym,
    n: element.n,
    color: element.color,
    pct: (weight / totalWeight) * 100,
  }))
}

export function formatPercentage(pct: number) {
  return String(Number(pct.toFixed(1)))
}
