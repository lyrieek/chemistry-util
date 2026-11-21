import type { CsvRow } from './csv-utils'

export type RadiusKind = 'atomic' | 'covalent'

export interface RadiusRange {
  min: number
  max: number
}

export interface RadiusExtents {
  atomic: RadiusRange
  covalent: RadiusRange
}

const RADIUS_KEYS: Record<RadiusKind, string> = {
  atomic: 'atomic_radii.empirical',
  covalent: 'atomic_radii.covalent_single',
}

/** 数据里的半径可能带方括号（预测值），比较时先去掉。 */
export function parseRadius(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const parsed = Number(value.replaceAll('[', '').replaceAll(']', ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function radiusOf(row: CsvRow, kind: RadiusKind): number | null {
  return parseRadius(row[RADIUS_KEYS[kind]])
}

/** 遍历全部元素，得到原子半径 / 共价半径的最小值与最大值。 */
export function radiusExtentsOf(rows: readonly CsvRow[]): RadiusExtents {
  const extents: RadiusExtents = {
    atomic: { min: Number.POSITIVE_INFINITY, max: 0 },
    covalent: { min: Number.POSITIVE_INFINITY, max: 0 },
  }
  for (const row of rows) {
    for (const kind of ['atomic', 'covalent'] as const) {
      const value = radiusOf(row, kind)
      if (value === null) continue
      const range = extents[kind]
      if (value < range.min) range.min = value
      if (value > range.max) range.max = value
    }
  }
  return extents
}
