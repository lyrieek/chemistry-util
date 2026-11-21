import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCsv } from '../src/utils/csv-utils'
import {
  MAX_TEMPERATURE_K,
  MIN_TEMPERATURE_K,
  PHASE_PALETTE,
  ROOM_TEMPERATURE_K,
  TEMPERATURE_STEP_K,
  phaseAtTemperature,
  toneOfPhase,
} from '../src/utils/element-palette'

const rows = parseCsv(readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8'))
const bySymbol = new Map(rows.map((row) => [row.symbol, row]))

function rowOf(symbol: string) {
  const row = bySymbol.get(symbol)
  if (!row) throw new Error(`missing element: ${symbol}`)
  return row
}

function phaseOf(symbol: string, temperature: number) {
  return phaseAtTemperature(rowOf(symbol), temperature)
}

describe('phase at temperature', () => {
  it('matches the data phase at room temperature', () => {
    for (const row of rows) {
      expect(phaseAtTemperature(row, ROOM_TEMPERATURE_K), `${row.symbol} at ${ROOM_TEMPERATURE_K} K`).toBe(toneOfPhase(row.phase))
    }
  })

  it('walks an element through solid, liquid and gas at its transition points', () => {
    const hydrogen = rowOf('H')
    const melt = Number(hydrogen.melt)
    const boil = Number(hydrogen.boil)
    expect(phaseOf('H', melt - 1)).toBe('solid')
    expect(phaseOf('H', melt)).toBe('liquid')
    expect(phaseOf('H', boil - 1)).toBe('liquid')
    expect(phaseOf('H', boil)).toBe('gas')
  })

  it('keeps bromine and mercury liquid at room temperature', () => {
    expect(phaseOf('Br', ROOM_TEMPERATURE_K)).toBe('liquid')
    expect(phaseOf('Br', 200)).toBe('solid')
    expect(phaseOf('Br', 400)).toBe('gas')
    expect(phaseOf('Hg', ROOM_TEMPERATURE_K)).toBe('liquid')
    expect(phaseOf('Hg', 200)).toBe('solid')
  })

  it('falls back to the data phase when both transition points are missing', () => {
    const dubnium = rowOf('Db')
    expect(dubnium.melt).toBe('')
    expect(dubnium.boil).toBe('')
    expect(phaseOf('Db', 1000)).toBe(toneOfPhase(dubnium.phase))
    expect(phaseOf('Db', 1000)).toBe('solid')
  })

  it('exposes a slider range that covers room temperature and the hottest boiling point', () => {
    expect(MIN_TEMPERATURE_K).toBe(0)
    expect(MAX_TEMPERATURE_K).toBeGreaterThan(6203)
    expect(TEMPERATURE_STEP_K).toBeGreaterThan(0)
    expect(MIN_TEMPERATURE_K).toBeLessThan(ROOM_TEMPERATURE_K)
    expect(ROOM_TEMPERATURE_K).toBeLessThan(MAX_TEMPERATURE_K)
  })
})

describe('phase palette with temperature', () => {
  it('recolors cells from the temperature argument', () => {
    const iron = rowOf('Fe')
    expect(PHASE_PALETTE.toneOf(iron)).toBe(toneOfPhase(iron.phase))
    expect(PHASE_PALETTE.toneOf(iron, 1000)).toBe('solid')
    expect(PHASE_PALETTE.toneOf(iron, 2000)).toBe('liquid')
    expect(PHASE_PALETTE.toneOf(iron, 4000)).toBe('gas')
  })
})
