import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PERIODIC_TABLE_NS } from '../i18n-ns'
import valueKeys from '../locales/periodic-table/value-keys.json'
import type { CsvRow } from '../utils/csv-utils'
import { DEFAULT_PALETTE_ID, getElementPalette, type PaletteId } from '../utils/element-palette'
import { formatNumber } from '../utils/number-format'
import { isPeriodicElement, layoutOf, type Series } from '../utils/periodic-layout'

const CATEGORY_KEYS: Record<string, string> = valueKeys.category
const GROUPS = Array.from({ length: 18 }, (_, index) => index + 1)
const PERIODS = Array.from({ length: 7 }, (_, index) => index + 1)

interface PeriodicViewProps {
  rows: readonly CsvRow[]
  matchedNumbers: ReadonlySet<string>
  searchActive: boolean
  paletteId?: PaletteId
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

export function PeriodicView({ rows, matchedNumbers, searchActive, paletteId = DEFAULT_PALETTE_ID }: PeriodicViewProps) {
  const { t } = useTranslation(PERIODIC_TABLE_NS)
  const [selected, setSelected] = useState<string | null>(null)
  const [highlightedSeries, setHighlightedSeries] = useState<Series | null>(null)
  const palette = getElementPalette(paletteId)
  const visibleRows = useMemo(() => rows.filter((row) => isPeriodicElement(row)), [rows])

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
          const categoryKey = CATEGORY_KEYS[row.category]
          const category = categoryKey ? t(`category.${categoryKey}`, { defaultValue: row.category }) : row.category
          const ariaLabel = category
            ? `${name} ${row.symbol}, ${t('fields.Number')} ${row.number}, ${category}`
            : `${name} ${row.symbol}, ${t('fields.Number')} ${row.number}`

          return (
            <button
              key={row.number}
              type="button"
              className={cellClassName(isMatch, isDimmed, isSelected, isSeriesHighlighted)}
              style={{ gridColumn: position.column + 1, gridRow: position.row + 1 }}
              aria-label={ariaLabel}
              aria-pressed={isSelected}
              data-tone={palette.toneOf(row)}
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
      </div>
    </div>
  )
}
