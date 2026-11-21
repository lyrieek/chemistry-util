import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import csvText from '../../data/PeriodicTable.csv?raw'
import { LanguageButton } from '../components/language-button'
import { Popover, PopoverAction, PopoverHeading, PopoverItem, PopoverList } from '../components/popover'
import { Slider } from '../components/slider'
import { ORBITAL_SHAPES_NS, PERIODIC_TABLE_NS } from '../i18n-ns'
import { parseCsv } from '../utils/csv-utils'
import {
  DEFAULT_PALETTE_ID,
  ELEMENT_PALETTES,
  getElementPalette,
  MAX_TEMPERATURE_K,
  MIN_TEMPERATURE_K,
  ROOM_TEMPERATURE_K,
  TEMPERATURE_STEP_K,
  type PaletteId,
} from '../utils/element-palette'
import { elementMatches } from '../utils/element-search'
import { sortNumber } from '../utils/number-format'
import { isPeriodicElement } from '../utils/periodic-layout'
import { OrbitalShapes } from './orbital-shapes'
import { PeriodicView } from './periodic-view'
import { COLUMNS, DEFAULT_HIDDEN, TableView, type SortState } from './table-view'

type View = 'table' | 'periodic'

const VIEW_STORAGE_KEY = 'pt-view'

function storedView(): View {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY)
    if (saved === 'table' || saved === 'periodic') return saved
  } catch {
    /* file:// 或隐私模式下拿不到存储，回退默认视图 */
  }
  return 'table'
}

function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="2" y="2.5" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6h12M2 9.7h12M6.2 2.5v11M9.8 2.5v11" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
    </svg>
  )
}

function PeriodicIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="3" height="3" rx="0.8" fill="currentColor" />
      <rect x="11.5" y="1.5" width="3" height="3" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="5.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.78" />
      <rect x="6.5" y="5.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.78" />
      <rect x="11.5" y="5.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.78" />
      <rect x="1.5" y="9.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.56" />
      <rect x="6.5" y="9.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.56" />
      <rect x="11.5" y="9.5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.56" />
      <rect x="4.5" y="13.3" width="2.6" height="1.4" rx="0.6" fill="currentColor" opacity="0.42" />
      <rect x="8.9" y="13.3" width="2.6" height="1.4" rx="0.6" fill="currentColor" opacity="0.42" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" fill="currentColor" opacity="0.9" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.4" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

const VIEW_OPTIONS = [
  { value: 'table', icon: TableIcon, label: 'Data table' },
  { value: 'periodic', icon: PeriodicIcon, label: 'Periodic table' },
] as const

function OrbitalHelpPopover() {
  const { t } = useTranslation(ORBITAL_SHAPES_NS)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span className="pt-orb-help" ref={rootRef}>
      <button
        type="button"
        className="pt-orb-help-trigger"
        aria-label={t('helpLabel')}
        aria-expanded={open}
        aria-controls="pt-orb-help-panel"
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>
      {open ? (
        <span className="pt-orb-help-panel" id="pt-orb-help-panel" role="dialog" aria-label={t('helpLabel')}>
          <OrbitalShapes />
        </span>
      ) : null}
    </span>
  )
}

interface PhaseTemperatureBarProps {
  paletteId: PaletteId
  temperature: number
  onChange: (temperature: number) => void
}

function PhaseTemperatureBar({ paletteId, temperature, onChange }: PhaseTemperatureBarProps) {
  const { t } = useTranslation(PERIODIC_TABLE_NS)
  const progress = ((temperature - MIN_TEMPERATURE_K) / (MAX_TEMPERATURE_K - MIN_TEMPERATURE_K)) * 100
  const value = t('Temperature value', { value: temperature })
  const palette = getElementPalette(paletteId)

  return (
    <div className="pt-phase-bar">
      <label className="pt-phase-bar-label" htmlFor="pt-temperature">
        {t('Temperature')}
      </label>
      <input
        id="pt-temperature"
        className="pt-temperature-range"
        type="range"
        min={MIN_TEMPERATURE_K}
        max={MAX_TEMPERATURE_K}
        step={TEMPERATURE_STEP_K}
        value={temperature}
        aria-valuetext={value}
        style={{ '--pt-temperature-progress': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <output className="pt-temperature-value" htmlFor="pt-temperature">
        {value}
      </output>
      {temperature !== ROOM_TEMPERATURE_K && (
        <button type="button" className="pt-temperature-reset" onClick={() => onChange(ROOM_TEMPERATURE_K)}>
          {t('Room temperature')}
        </button>
      )}
      <div className="pt-phase-bar-legend">
        {palette.legend.map((item) => (
          <span key={item.tone} className="pt-phase-swatch">
            <span className="pt-phase-swatch-color" data-tone={item.tone} aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </span>
        ))}
        {palette.id === 'block' && <OrbitalHelpPopover />}
      </div>
    </div>
  )
}

function Page() {
  const { t, i18n } = useTranslation(PERIODIC_TABLE_NS)
  const rows = useMemo(() => parseCsv(csvText), [])
  const periodicRows = useMemo(() => rows.filter((row) => isPeriodicElement(row)), [rows])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>({ key: 'number', dir: 'asc' })
  const [hidden, setHidden] = useState<readonly string[]>(DEFAULT_HIDDEN)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [view, setView] = useState<View>(storedView)
  const [paletteId, setPaletteId] = useState<PaletteId>(DEFAULT_PALETTE_ID)
  const [temperature, setTemperature] = useState(ROOM_TEMPERATURE_K)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const viewRows = view === 'periodic' ? periodicRows : rows

  const columns = useMemo(() => COLUMNS.filter((column) => !hidden.includes(column.key)), [hidden])
  const allShown = hidden.length === 0

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view)
    } catch {
      /* 隐私模式下写入失败可以忽略 */
    }
  }, [view])

  const toggleColumn = (key: string) => {
    const next = hidden.includes(key) ? hidden.filter((hiddenKey) => hiddenKey !== key) : [...hidden, key]
    if (next.length >= COLUMNS.length) return
    setHidden(next)
    if (sort && next.includes(sort.key)) {
      const fallback = COLUMNS.find((column) => !next.includes(column.key))
      setSort(fallback ? { key: fallback.key, dir: 'asc' } : null)
    }
  }

  const filtered = useMemo(() => {
    if (query.trim() === '') return viewRows
    return viewRows.filter((row) =>
      elementMatches(row, query, [t(`element.${row.symbol}`, { lng: 'zh' }), t(`element.${row.symbol}`, { lng: 'en' })]),
    )
  }, [viewRows, query, t])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    // eslint-disable-next-line unicorn/no-array-sort — sorted below operates on a fresh copy
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      const an = sortNumber(av)
      const bn = sortNumber(bv)
      if (Number.isFinite(an) && Number.isFinite(bn)) {
        return sort.dir === 'asc' ? an - bn : bn - an
      }
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [filtered, sort])

  const matchedNumbers = useMemo(() => new Set(filtered.map((row) => row.number)), [filtered])
  const searchActive = query.trim() !== ''

  const handleSort = (key: string) => {
    setSort((previous): SortState => (previous && previous.key === key ? { key, dir: previous.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const changeView = (next: View) => {
    setView(next)
    if (next !== 'table') setColumnsOpen(false)
  }

  useEffect(() => {
    document.title = t('Periodic Table')
  }, [t, i18n.language])

  const viewOptions = VIEW_OPTIONS.map((option) => {
    const Icon = option.icon
    return {
      value: option.value,
      label: (
        <>
          <Icon />
          <span>{t(option.label)}</span>
        </>
      ),
    }
  })

  return (
    <div className="pt-page">
      <h1>{t('Periodic Table')}</h1>
      <div className={view === 'table' ? 'pt-toolbar' : 'pt-toolbar pt-toolbar--periodic'}>
        <input className="pt-search" placeholder={t('Search elements')} value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
        {view === 'table' && (
          <Popover
            open={columnsOpen}
            onOpenChange={setColumnsOpen}
            label={t('Columns')}
            className="pt-filter"
            trigger={(triggerProps) => (
              <button
                type="button"
                className={allShown ? 'pt-filter-button' : 'pt-filter-button is-active'}
                aria-label={t('Columns')}
                {...triggerProps}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                  <path d="M2 3h12l-4.6 5.4v3.9L6.6 14V8.4L2 3Z" fill="currentColor" />
                </svg>
              </button>
            )}
          >
            <PopoverHeading title={t('Columns')} action={<PopoverAction onClick={() => setHidden(DEFAULT_HIDDEN)}>{t('Reset')}</PopoverAction>} />
            <PopoverList>
              {COLUMNS.map((column) => {
                const checked = !hidden.includes(column.key)
                const lastOne = checked && columns.length === 1
                return (
                  <PopoverItem key={column.key}>
                    <input type="checkbox" checked={checked} disabled={lastOne} onChange={() => toggleColumn(column.key)} />
                    <span>{t(`fields.${column.label}`)}</span>
                  </PopoverItem>
                )
              })}
            </PopoverList>
          </Popover>
        )}
        <span className="pt-count">{t('Elements count', { n: filtered.length, total: viewRows.length })}</span>
        <Slider className="pt-view-switch" ariaLabel={t('View')} value={view} onChange={changeView} options={viewOptions} />
        {view === 'periodic' && (
          <Popover
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            label={t('palette.label')}
            trigger={(triggerProps) => (
              <button type="button" className="pt-filter-button" aria-label={t('palette.label')} {...triggerProps}>
                <PaletteIcon />
              </button>
            )}
          >
            <PopoverHeading title={t('palette.label')} />
            <PopoverList>
              {ELEMENT_PALETTES.map((palette) => (
                <PopoverItem key={palette.id}>
                  <input
                    type="radio"
                    name="chem-palette"
                    value={palette.id}
                    checked={palette.id === paletteId}
                    onChange={() => setPaletteId(palette.id)}
                  />
                  <span>{t(palette.labelKey)}</span>
                </PopoverItem>
              ))}
            </PopoverList>
          </Popover>
        )}
        <LanguageButton className="pt-lang-button" label={t('Switch language')} />
      </div>
      {view === 'periodic' && (
        <PhaseTemperatureBar
          paletteId={paletteId}
          temperature={temperature}
          onChange={(next) => {
            setTemperature(next)
            // 温度只对相态色盘有意义，拖动时自动切过去，避免出现「拖了没反应」。
            setPaletteId('phase')
          }}
        />
      )}
      {view === 'table' ? (
        <TableView columns={columns} rows={sorted} sort={sort} onSort={handleSort} />
      ) : (
        <PeriodicView rows={rows} matchedNumbers={matchedNumbers} searchActive={searchActive} paletteId={paletteId} temperature={temperature} />
      )}
    </div>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<Page />)
