import type { CsvRow } from './csv-utils'
import { ACTINIDE_RANGE, LANTHANIDE_RANGE } from './periodic-layout'

/** 色盘点亮单元格时使用的色调令牌；新增色盘时按需扩展。 */
export type ElementTone = 's' | 'p' | 'd' | 'f' | 'solid' | 'liquid' | 'gas' | 'unknown'

export type PaletteId = 'phase' | 'block'

export interface PaletteLegendItem {
  readonly tone: ElementTone
  readonly labelKey: string
}

/**
 * 元素色盘：把一行元素数据映射成色调令牌。
 * 具体颜色写在 CSS 里（按 `data-palette` / `data-tone` 选择），
 * 这样明暗主题和后续新增色盘都不用改数据层。
 */
export class ElementPalette {
  readonly id: PaletteId
  readonly labelKey: string
  readonly legend: readonly PaletteLegendItem[]
  private readonly resolveTone: (row: CsvRow) => ElementTone

  constructor(id: PaletteId, labelKey: string, legend: readonly PaletteLegendItem[], resolveTone: (row: CsvRow) => ElementTone) {
    this.id = id
    this.labelKey = labelKey
    this.legend = legend
    this.resolveTone = resolveTone
  }

  toneOf(row: CsvRow): ElementTone {
    return this.resolveTone(row)
  }
}

export type ElementBlock = 's' | 'p' | 'd' | 'f'

function inRange(value: number, range: { start: number; end: number }): boolean {
  return value >= range.start && value <= range.end
}

/**
 * 按元素所在的区（block）分类：
 * - 57–71 / 89–103 的镧系、锕系放在 detached 行，归为 f 区
 * - He 虽然位于 18 族，但电子构型是 1s²，归为 s 区
 * - 1–2 族 s，3–12 族 d，13–18 族 p
 */
export function blockOf(row: CsvRow): ElementBlock | 'unknown' {
  const atomicNumber = Number(row.number)

  if (inRange(atomicNumber, LANTHANIDE_RANGE) || inRange(atomicNumber, ACTINIDE_RANGE)) {
    return 'f'
  }

  if (atomicNumber === 2) return 's'

  const group = Number(row.group)
  if (Number.isInteger(group) && group >= 1 && group <= 2) return 's'
  if (Number.isInteger(group) && group >= 3 && group <= 12) return 'd'
  if (Number.isInteger(group) && group >= 13 && group <= 18) return 'p'

  return 'unknown'
}

export function toneOfPhase(phase?: string): ElementTone {
  switch (phase?.toLowerCase()) {
    case 'solid':
      return 'solid'
    case 'liquid':
      return 'liquid'
    case 'gas':
      return 'gas'
    default:
      return 'unknown'
  }
}

/** 按常温相态上色：固态浅黄、液态浅蓝、气态浅绿。 */
export const PHASE_PALETTE = new ElementPalette(
  'phase',
  'palette.phase.label',
  [
    { tone: 'solid', labelKey: 'palette.phase.solid' },
    { tone: 'liquid', labelKey: 'palette.phase.liquid' },
    { tone: 'gas', labelKey: 'palette.phase.gas' },
  ],
  (row) => toneOfPhase(row.phase),
)

/** 按 s / p / d / f 区上色。 */
export const BLOCK_PALETTE = new ElementPalette(
  'block',
  'palette.block.label',
  [
    { tone: 's', labelKey: 'palette.block.s' },
    { tone: 'p', labelKey: 'palette.block.p' },
    { tone: 'd', labelKey: 'palette.block.d' },
    { tone: 'f', labelKey: 'palette.block.f' },
  ],
  blockOf,
)

export const ELEMENT_PALETTES: readonly ElementPalette[] = [PHASE_PALETTE, BLOCK_PALETTE]

export const DEFAULT_PALETTE_ID: PaletteId = 'block'

export function getElementPalette(id: PaletteId): ElementPalette {
  return ELEMENT_PALETTES.find((palette) => palette.id === id) ?? PHASE_PALETTE
}
