import type { CsvRow } from './csv-utils'
import { ACTINIDE_RANGE, LANTHANIDE_RANGE } from './periodic-layout'

/** 色盘点亮单元格时使用的色调令牌；新增色盘时按需扩展。 */
export type ElementTone = 's' | 'p' | 'd' | 'f' | 'solid' | 'liquid' | 'gas' | 'plasma' | 'unknown'

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
  private readonly resolveTone: (row: CsvRow, temperature?: number) => ElementTone

  constructor(
    id: PaletteId,
    labelKey: string,
    legend: readonly PaletteLegendItem[],
    resolveTone: (row: CsvRow, temperature?: number) => ElementTone,
  ) {
    this.id = id
    this.labelKey = labelKey
    this.legend = legend
    this.resolveTone = resolveTone
  }

  /** temperature 只对方温度敏感色盘（phase）生效，其余色盘忽略该参数。 */
  toneOf(row: CsvRow, temperature?: number): ElementTone {
    return this.resolveTone(row, temperature)
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
    case 'plasma':
      return 'plasma'
    default:
      return 'unknown'
  }
}

/** 温度滑块下限（K）。 */
export const MIN_TEMPERATURE_K = 0
/** 温度滑块上限（K），略高于已知最高沸点（约 6203 K）。 */
export const MAX_TEMPERATURE_K = 6500
/** 温度滑块步长（K）。 */
export const TEMPERATURE_STEP_K = 1
/** 常温（约 25 °C），与数据中的常温相态一致。 */
export const ROOM_TEMPERATURE_K = 298

function parseTemperature(value?: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** 玻尔兹曼常数（eV/K），用于把第一电离能换算成温标。 */
const KB_EV_PER_K = 8.617333262e-5
/** kJ/mol → eV。 */
const KJ_PER_MOL_TO_EV = 1 / 96.485332
/** 标准大气压（Pa），Saha 估算以此为参考压力。 */
const STANDARD_PRESSURE_PA = 101325
/** 电子质量（kg）。 */
const ELECTRON_MASS = 9.1093837015e-31
/** 玻尔兹曼常数（J/K）。 */
const BOLTZMANN = 1.380649e-23
/** 普朗克常数（J·s）。 */
const PLANCK = 6.62607015e-34
/** 电离度达到该比例即视为等离子体（弱电离等离子体）。 */
export const PLASMA_IONIZATION_FRACTION = 0.01

/**
 * 用 Saha 方程估算 1 atm 下的电离度（0–1）。
 * 只取第一电离能；电子自旋权重取 2，原子/离子配分函数近似为 1。数据缺失时返回 null。
 */
export function ionizationFraction(row: CsvRow, temperature: number): number | null {
  const ionization = parseTemperature(row.ionization_energy)
  if (ionization === null || temperature <= 0) return null

  const chiEv = ionization * KJ_PER_MOL_TO_EV
  const ktEv = KB_EV_PER_K * temperature
  const numberDensity = STANDARD_PRESSURE_PA / (BOLTZMANN * temperature)
  const quantumConcentration = 2 * ((2 * Math.PI * ELECTRON_MASS * BOLTZMANN * temperature) / (PLANCK * PLANCK)) ** 1.5
  const saha = (quantumConcentration / numberDensity) * Math.exp(-chiEv / ktEv)
  // x² / (1 - x) = saha
  return (Math.sqrt(saha * saha + 4 * saha) - saha) / 2
}

/**
 * 按给定温度（K）判断相态：
 * - 高于沸点且 Saha 电离度 ≥ 1%：等离子体。
 * - 低于熔点：固态；熔点与沸点之间：液态；高于沸点：气态。
 * - 缺少熔点或沸点时按已知的一侧推断；两者都缺失时，常温沿用数据相态，更高温度返回未知。
 */
export function phaseAtTemperature(row: CsvRow, temperature: number): ElementTone {
  const melt = parseTemperature(row.melt)
  const boil = parseTemperature(row.boil)

  const fraction = ionizationFraction(row, temperature)
  if (fraction !== null && fraction >= PLASMA_IONIZATION_FRACTION && (boil === null || temperature >= boil)) {
    return 'plasma'
  }

  if (melt !== null && boil !== null) {
    if (temperature < melt) return 'solid'
    if (temperature < boil) return 'liquid'
    return 'gas'
  }

  if (melt !== null) {
    if (temperature < melt) return 'solid'
    // 没有沸点数据时不把液态外推到任意高温。
    return 'unknown'
  }

  if (boil !== null) {
    return temperature < boil ? 'solid' : 'gas'
  }

  // 熔点、沸点都缺失：常温沿用数据相态，更高温度只能标未知。
  if (temperature <= ROOM_TEMPERATURE_K) return toneOfPhase(row.phase)
  return 'unknown'
}

/** 按常温相态上色：固态浅黄、液态浅蓝、气态浅绿、等离子体淡紫、未知灰色。 */
export const PHASE_PALETTE = new ElementPalette(
  'phase',
  'palette.phase.label',
  [
    { tone: 'solid', labelKey: 'palette.phase.solid' },
    { tone: 'liquid', labelKey: 'palette.phase.liquid' },
    { tone: 'gas', labelKey: 'palette.phase.gas' },
    { tone: 'plasma', labelKey: 'palette.phase.plasma' },
    { tone: 'unknown', labelKey: 'palette.phase.unknown' },
  ],
  (row, temperature) => (typeof temperature === 'number' ? phaseAtTemperature(row, temperature) : toneOfPhase(row.phase)),
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
