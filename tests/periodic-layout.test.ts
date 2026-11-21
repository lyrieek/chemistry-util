import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCsv } from '../src/utils/csv-utils'
import { ACTINIDE_ROW, LANTHANIDE_ROW, layoutOf } from '../src/utils/periodic-layout'

const rows = parseCsv(readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8'))

function bySymbol(symbol: string) {
  const row = rows.find((item) => item.symbol === symbol)
  if (!row) throw new Error(`missing element: ${symbol}`)
  return row
}

describe('layoutOf', () => {
  it('places main-table elements by group and period', () => {
    expect(layoutOf(bySymbol('H'))).toEqual({ column: 1, row: 1 })
    expect(layoutOf(bySymbol('He'))).toEqual({ column: 18, row: 1 })
    expect(layoutOf(bySymbol('Fr'))).toEqual({ column: 1, row: 7 })
    expect(layoutOf(bySymbol('Og'))).toEqual({ column: 18, row: 7 })
  })

  it('moves lanthanides to their own row', () => {
    expect(layoutOf(bySymbol('La'))).toEqual({ column: 3, row: LANTHANIDE_ROW, series: 'lanthanide' })
    expect(layoutOf(bySymbol('Ce'))).toEqual({ column: 4, row: LANTHANIDE_ROW, series: 'lanthanide' })
    expect(layoutOf(bySymbol('Lu'))).toEqual({ column: 17, row: LANTHANIDE_ROW, series: 'lanthanide' })
  })

  it('moves actinides to their own row', () => {
    expect(layoutOf(bySymbol('Ac'))).toEqual({ column: 3, row: ACTINIDE_ROW, series: 'actinide' })
    expect(layoutOf(bySymbol('Lr'))).toEqual({ column: 17, row: ACTINIDE_ROW, series: 'actinide' })
  })

  it('places Uue in the eighth period', () => {
    expect(layoutOf(bySymbol('Uue'))).toEqual({ column: 1, row: 8 })
  })

  it('gives every element a coordinate and keeps main-table cells unique', () => {
    const occupied = new Map<string, string>()
    for (const row of rows) {
      const position = layoutOf(row)
      expect(position.column).toBeGreaterThanOrEqual(1)
      expect(position.column).toBeLessThanOrEqual(18)
      expect(position.row).toBeGreaterThanOrEqual(1)
      if (position.series) continue
      const key = `${position.row}:${position.column}`
      expect(occupied.has(key), key).toBe(false)
      occupied.set(key, row.symbol ?? '')
    }
    expect(rows).toHaveLength(119)
  })
})
