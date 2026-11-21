import { useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { PERIODIC_TABLE_NS } from '../i18n-ns'
import type { CsvRow } from '../utils/csv-utils'
import { categoryKeyOf } from '../utils/element-labels'
import { DEFAULT_PALETTE_ID, getElementPalette, ionizationFraction, type PaletteId } from '../utils/element-palette'
import { radiusExtentsOf } from '../utils/element-radii'
import { formatNumber } from '../utils/number-format'
import { isPeriodicElement, layoutOf, type Series } from '../utils/periodic-layout'
import { PeriodicTableCard } from './periodic-table-card'

const GROUPS = Array.from({ length: 18 }, (_, index) => index + 1)
const PERIODS = Array.from({ length: 7 }, (_, index) => index + 1)

interface PeriodicViewProps {
  rows: readonly CsvRow[]
  matchedNumbers: ReadonlySet<string>
  searchActive: boolean
  paletteId?: PaletteId
  /** 相态色盘按该温度（K）上色；不传则使用数据中的常温相态。 */
  temperature?: number
}

function cellClassName(match: boolean, dimmed: boolean, selected: boolean, seriesHighlighted: boolean): string {
  return [
    'pt-cell',
    match ? 'is-match' : '',
    dimmed ? 'is-dimmed' : '',
    selected ? 'is-selected' : '',
    seriesHighlighted ? 'is-series-highlighted' : '',
  ]
    .filter((name) => name !== '')
    .join(' ')
}

export function PeriodicView({ rows, matchedNumbers, searchActive, paletteId = DEFAULT_PALETTE_ID, temperature }: PeriodicViewProps) {
  const { t } = useTranslation(PERIODIC_TABLE_NS)
  const [selected, setSelected] = useState<string | null>(null)
  const [highlightedSeries, setHighlightedSeries] = useState<Series | null>(null)
  const palette = getElementPalette(paletteId)
  const visibleRows = useMemo(() => rows.filter((row) => isPeriodicElement(row)), [rows])
  const radiiExtents = useMemo(() => radiusExtentsOf(rows), [rows])
  const selectedRow = useMemo(
    () => (selected === null ? null : (visibleRows.find((row) => row.number === selected) ?? null)),
    [selected, visibleRows],
  )
  const phasePalette = palette.id === 'phase'

  const toggleSeries = (series: Series) => {
    setHighlightedSeries((previous) => (previous === series ? null : series))
  }

  const selectElement = (number: string) => {
    // 已有系列高亮时，点击元素只切换选中项并清掉系列高亮，不把元素本身取消掉。
    setSelected((previous) => (previous === number && highlightedSeries === null ? null : number))
    setHighlightedSeries(null)
  }

  return (
    <div className="pt-grid-wrap">
      <div className="pt-grid" role="group" aria-label={t('Periodic table')} data-palette={palette.id}>
        <div className="pt-corner" style={{ gridColumn: 1, gridRow: 1 }} title={`${t('fields.Group')} →`}>
          <span>{t('fields.Group')}</span>
          <span className="pt-corner-arrow" aria-hidden="true">
            →
          </span>
        </div>
        {GROUPS.map((group) => (
          <div
            key={`group-${group}`}
            className="pt-axis pt-axis-group"
            style={{ gridColumn: group + 1, gridRow: 1 }}
            title={`${t('fields.Group')} ${group}`}
          >
            {group}
          </div>
        ))}
        {PERIODS.map((period) => (
          <div
            key={`period-${period}`}
            className="pt-axis pt-axis-period"
            style={{ gridColumn: 1, gridRow: period + 1 }}
            title={`${t('fields.Period')} ${period}`}
          >
            {period}
          </div>
        ))}

        <button
          type="button"
          className={highlightedSeries === 'lanthanide' ? 'pt-placeholder is-highlighted' : 'pt-placeholder'}
          style={{ gridColumn: 4, gridRow: 7 }}
          aria-label={t('Lanthanides')}
          aria-pressed={highlightedSeries === 'lanthanide'}
          title={t('Lanthanides')}
          onClick={() => toggleSeries('lanthanide')}
        >
          57-71
        </button>
        <button
          type="button"
          className={highlightedSeries === 'actinide' ? 'pt-placeholder is-highlighted' : 'pt-placeholder'}
          style={{ gridColumn: 4, gridRow: 8 }}
          aria-label={t('Actinides')}
          aria-pressed={highlightedSeries === 'actinide'}
          title={t('Actinides')}
          onClick={() => toggleSeries('actinide')}
        >
          89-103
        </button>

        {visibleRows.map((row) => {
          const position = layoutOf(row)
          const isMatch = searchActive && matchedNumbers.has(row.number)
          const isDimmed = searchActive && !isMatch
          const isSelected = selected === row.number
          const isSeriesHighlighted = highlightedSeries !== null && position.series === highlightedSeries
          const name = t(`element.${row.symbol}`, { defaultValue: row.name })
          const categoryKey = categoryKeyOf(row)
          const category = categoryKey ? t(`category.${categoryKey}`, { defaultValue: row.category }) : row.category
          const tone = palette.toneOf(row, temperature)
          const fraction = phasePalette && typeof temperature === 'number' ? ionizationFraction(row, temperature) : null
          // 用平方根放大低电离度，让弱电离也能在渐变里看出来。
          const ionization = fraction === null ? 0 : Math.sqrt(Math.min(1, Math.max(0, fraction)))
          const phaseLabel =
            phasePalette && (tone === 'solid' || tone === 'liquid' || tone === 'gas' || tone === 'plasma' || tone === 'unknown')
              ? t(`palette.phase.${tone}`)
              : ''
          const ariaLabel = [`${name} ${row.symbol}`, `${t('fields.Number')} ${row.number}`, category, phaseLabel]
            .filter((part) => part !== '')
            .join(', ')

          return (
            <button
              key={row.number}
              type="button"
              className={cellClassName(isMatch, isDimmed, isSelected, isSeriesHighlighted)}
              style={
                {
                  gridColumn: position.column + 1,
                  gridRow: position.row + 1,
                  '--pt-ionization': ionization,
                } as CSSProperties
              }
              aria-label={ariaLabel}
              aria-pressed={isSelected}
              data-tone={tone}
              data-number={row.number}
              data-symbol={row.symbol}
              {...(position.series ? { 'data-series': position.series } : {})}
              onClick={() => selectElement(row.number)}
            >
              <span className="pt-cell-number">{row.number}</span>
              <span className="pt-cell-symbol">{row.symbol}</span>
              <span className="pt-cell-name">{name}</span>
              <span className="pt-cell-mass">{formatNumber(row.atomic_mass)}</span>
            </button>
          )
        })}

        <PeriodicTableCard row={selectedRow} temperature={temperature} radiusExtents={radiiExtents} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}
