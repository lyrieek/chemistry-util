export type Series = 'lanthanide' | 'actinide'

export interface CellPosition {
  column: number
  row: number
  series?: Series
}

export const LANTHANIDE_RANGE = { start: 57, end: 71 } as const
export const ACTINIDE_RANGE = { start: 89, end: 103 } as const

/** 逻辑行：1–7 为主表周期，8 为间隔，9/10 为镧系/锕系。 */
export const LANTHANIDE_ROW = 9
export const ACTINIDE_ROW = 10
export const FALLBACK_ROW = 11

/** 119 号元素尚未被发现，周期表视图不展示。 */
export function isPeriodicElement(row: Record<string, string>): boolean {
  return row.number !== '119'
}

export function layoutOf(row: Record<string, string>): CellPosition {
  const atomicNumber = Number(row.number)

  if (atomicNumber >= LANTHANIDE_RANGE.start && atomicNumber <= LANTHANIDE_RANGE.end) {
    return {
      column: 3 + (atomicNumber - LANTHANIDE_RANGE.start),
      row: LANTHANIDE_ROW,
      series: 'lanthanide',
    }
  }

  if (atomicNumber >= ACTINIDE_RANGE.start && atomicNumber <= ACTINIDE_RANGE.end) {
    return {
      column: 3 + (atomicNumber - ACTINIDE_RANGE.start),
      row: ACTINIDE_ROW,
      series: 'actinide',
    }
  }

  const group = Number(row.group)
  const period = Number(row.period)

  if (Number.isInteger(group) && group >= 1 && group <= 18 && Number.isInteger(period) && period >= 1 && period <= 8) {
    return { column: group, row: period }
  }

  return { column: 1, row: FALLBACK_ROW }
}
