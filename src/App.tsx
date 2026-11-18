import { type Material, MATERIALS } from './materials'
import { calculatePercentages, type CompositionBasis, type ElementProportion } from './composition'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Pie } from '@visx/shape'
import { Group } from '@visx/group'
import { Sector, SectorLabel } from './Sector'
import { Lattice } from './Lattice'
import { Slider } from './components/slider'
import { LanguageButton } from './components/language-button'
import { materialMatches } from './search'
import { useAnimatedPercentages } from './use-animated-percentages'

const C = 100
const R = 99.5
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const CELLS = [1, 6, 11]
const VIEW_OPTIONS = [
  { value: 'pie', label: 'Pie chart' },
  { value: 'lattice', label: 'Lattice' },
] as const
const COMPOSITION_BASIS_OPTIONS = [
  { value: 'mass', label: 'Mass ratio' },
  { value: 'atomic', label: 'Atomic ratio' },
] as const

type ViewMode = (typeof VIEW_OPTIONS)[number]['value']
type CompositionBasisOption = (typeof COMPOSITION_BASIS_OPTIONS)[number]['value']
type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {RAY_ANGLES.map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="2.6"
          x2="12"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <line x1="15.7" y1="15.7" x2="20.4" y2="20.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function PieIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 8V2a6 6 0 0 1 6 6Z" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function LatticeIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {CELLS.map((y) =>
        CELLS.map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="currentColor" opacity={(x + y) % 3 === 0 ? 0.55 : 1} />
        )),
      )}
    </svg>
  )
}

function PieChart({ elements, basisLabel }: { elements: ElementProportion[]; basisLabel: string }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const animatedElements = useAnimatedPercentages(elements)
  const outerRadius = R

  return (
    <svg viewBox="0 0 200 200" className="pie-chart" role="button" tabIndex={0}>
      <Group top={C} left={C}>
        <Pie
          data={animatedElements}
          outerRadius={outerRadius}
          innerRadius={0}
          startAngle={-Math.PI / 2}
          endAngle={(3 * Math.PI) / 2}
          pieValue={(d) => d.pct}
        >
          {({ arcs }) => (
            <>
              {arcs.map((arc, i) => {
                const element = arc.data as ElementProportion
                return (
                  <Sector
                    key={element.sym}
                    arc={arc}
                    element={element}
                    i={i}
                    outerRadius={outerRadius}
                    setHovered={setHovered}
                    basisLabel={basisLabel}
                  />
                )
              })}
              <g className="sector-labels" aria-hidden="true">
                {arcs.map((arc, i) => {
                  const element = arc.data as ElementProportion
                  return <SectorLabel key={element.sym} arc={arc} element={element} i={i} hovered={hovered} outerRadius={outerRadius} />
                })}
              </g>
            </>
          )}
        </Pie>
      </Group>
    </svg>
  )
}

function Card({ m, view, basis }: { m: Material; view: ViewMode; basis: CompositionBasis }) {
  const { t } = useTranslation()
  const elements = calculatePercentages(m.elements, basis)
  const basisLabel = t(basis === 'mass' ? 'Mass ratio' : 'Atomic ratio')
  return (
    <div className="composition-card">
      <h3>{t(`name.${m.name}`)}</h3>
      <p className="card-desc">{t(`desc.${m.name}`)}</p>
      <div className="card-formula">{m.formula}</div>
      <div className={m.smiles ? 'card-smiles' : 'card-smiles is-empty'}>
        <span className="card-smiles-label">SMILES</span>
        <span className="card-smiles-value">{m.smiles ?? '—'}</span>
      </div>
      <div className={view === 'pie' ? 'pie-wrap' : 'pie-wrap lattice-wrap'}>
        {view === 'pie' ? (
          <PieChart elements={elements} basisLabel={basisLabel} />
        ) : (
          <Lattice elements={elements} seedKey={m.name} basisLabel={basisLabel} />
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { t } = useTranslation()
  const [view, setView] = useState<ViewMode>('pie')
  const [basis, setBasis] = useState<CompositionBasisOption>('mass')
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [search, setSearch] = useState('')
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const materials = search.trim()
    ? MATERIALS.filter((m) => materialMatches(m, search, [m.name, t(`name.${m.name}`, { lng: 'zh' }), t(`name.${m.name}`, { lng: 'en' })]))
    : MATERIALS

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* 隐私模式下写入失败可以忽略 */
    }
  }, [theme])

  return (
    <>
      <div className="toolbar">
        <div className="search-box" role="search">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearch('')
            }}
            placeholder={t('Search')}
            aria-label={t('Search materials')}
            spellCheck={false}
            autoComplete="off"
          />
          {search ? (
            <button className="search-clear" type="button" onClick={() => setSearch('')} aria-label={t('Clear search')} title={t('Clear search')}>
              ×
            </button>
          ) : null}
        </div>
        <Slider
          className="composition-basis-switch"
          ariaLabel={t('Composition ratio')}
          value={basis}
          onChange={setBasis}
          options={COMPOSITION_BASIS_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
        />
        <Slider
          className="view-switch"
          ariaLabel={t('Chart view')}
          value={view}
          onChange={setView}
          options={VIEW_OPTIONS.map((option) => ({
            value: option.value,
            label: (
              <>
                {option.value === 'pie' ? <PieIcon /> : <LatticeIcon />}
                <span>{t(option.label)}</span>
              </>
            ),
          }))}
        />
        <button className="icon-button" type="button" onClick={toggleTheme} aria-label={t('Switch theme')} title={t('Switch theme')}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <LanguageButton className="lang-button" label={t('Switch language')} />
      </div>
      <h1>{t('Chemical Composition')}</h1>
      <h2>{t(view === 'pie' ? 'As pie chart' : 'As lattice')}</h2>
      {materials.length > 0 ? (
        <div className="composition-grid">
          {materials.map((m) => (
            <Card key={m.name} m={m} view={view} basis={basis} />
          ))}
        </div>
      ) : (
        <p className="empty-state" role="status">
          {t('No materials found')}
        </p>
      )}
    </>
  )
}
