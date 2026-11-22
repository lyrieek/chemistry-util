import { describe, expect, it } from 'vitest'
import { MATERIALS } from '../src/pages/material-cards/materials'
import { materialMatches } from '../src/pages/material-cards/search'

function material(name: string) {
  const found = MATERIALS.find((item) => item.name === name)
  if (!found) throw new Error(`missing material: ${name}`)
  return found
}

const water = material('Water')
const ironOxide = material('Iron Oxide')

describe('materialMatches', () => {
  it('matches everything for an empty query', () => {
    expect(materialMatches(water, '', ['水', 'Water'])).toBe(true)
    expect(materialMatches(water, '   ', ['水', 'Water'])).toBe(true)
  })

  it('matches Chinese and English names case-insensitively', () => {
    expect(materialMatches(water, '水', ['水', 'Water'])).toBe(true)
    expect(materialMatches(water, 'wAtEr', ['水', 'Water'])).toBe(true)
    expect(materialMatches(water, '氧', ['水', 'Water'])).toBe(false)
  })

  it('matches partial names, formulas and element symbols', () => {
    expect(materialMatches(ironOxide, '氧化', ['氧化铁', 'Iron Oxide'])).toBe(true)
    expect(materialMatches(ironOxide, 'fe₂o', ['氧化铁', 'Iron Oxide'])).toBe(true)
    expect(materialMatches(ironOxide, 'fe2o3', ['氧化铁', 'Iron Oxide'])).toBe(true)
    expect(materialMatches(ironOxide, 'fe', ['氧化铁', 'Iron Oxide'])).toBe(true)
    expect(materialMatches(water, 'h₂o', ['水', 'Water'])).toBe(true)
  })

  it('matches formulas typed with plain digits', () => {
    expect(materialMatches(water, 'h2o', ['水', 'Water'])).toBe(true)
    expect(materialMatches(water, 'H2O', ['水', 'Water'])).toBe(true)
    expect(materialMatches(water, '2', ['水', 'Water'])).toBe(true)
  })

  it('rejects queries that hit nothing', () => {
    expect(materialMatches(water, 'gold', ['水', 'Water'])).toBe(false)
    expect(materialMatches(water, 'Au', ['水', 'Water'])).toBe(false)
  })
})
