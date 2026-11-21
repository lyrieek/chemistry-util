import { useTranslation } from 'react-i18next'
import { PERIODIC_TABLE_NS } from '../i18n-ns'
import type { CsvRow } from '../utils/csv-utils'
import { categoryKeyOf } from '../utils/element-labels'
import { ionizationFraction, phaseAtTemperature, toneOfPhase, type ElementTone } from '../utils/element-palette'
import { radiusOf, type RadiusExtents } from '../utils/element-radii'
import { formatNumber, formatNumericValue } from '../utils/number-format'

interface PeriodicTableCardProps {
  row: CsvRow | null
  temperature?: number
  radiusExtents: RadiusExtents
  onClose: () => void
}

interface RadiusMeterProps {
  label: string
  value: number | null
  min: number
  max: number
  minLabel: string
  maxLabel: string
  missingLabel: string
}

const EMPTY = '—'

function displayNumber(value: string | undefined): string {
  if (value === undefined || value.trim() === '') return EMPTY
  return formatNumericValue(value)
}

function displayText(value: string | undefined): string {
  return value !== undefined && value.trim() !== '' ? value : EMPTY
}

function phaseToneOf(row: CsvRow, temperature?: number): ElementTone {
  return typeof temperature === 'number' ? phaseAtTemperature(row, temperature) : toneOfPhase(row.phase)
}

function formatIonization(fraction: number | null, temperature?: number): string {
  if (typeof temperature !== 'number' || fraction === null) return EMPTY
  const percent = fraction * 100
  if (percent < 0.01) return '0%'
  return `${percent.toFixed(percent < 1 ? 2 : 1)}%`
}

/** 甜甜圈：浅色固定外圈 = 全体元素的最大半径，深色内圈 = 当前元素半径。 */
function RadiusMeter({ label, value, min, max, minLabel, maxLabel, missingLabel }: RadiusMeterProps) {
  const ratio = value === null || max <= 0 ? 0 : Math.min(1, value / max)
  const badge = value === null ? missingLabel : value >= max ? maxLabel : value <= min ? minLabel : null

  return (
    <div className="pt-radius">
      <svg className="pt-radius-donut" viewBox="0 0 40 40" width="38" height="38" aria-hidden="true" focusable="false">
        <circle className="pt-radius-track" cx="20" cy="20" r="18" />
        <circle className="pt-radius-fill" cx="20" cy="20" r="18" style={{ transform: `scale(${ratio})` }} />
      </svg>
      <span className="pt-radius-text">
        <span className="pt-radius-label">{label}</span>
        <span className="pt-radius-value">{value === null ? EMPTY : `${formatNumber(String(value))} pm`}</span>
      </span>
      {badge && <span className="pt-radius-badge">{badge}</span>}
    </div>
  )
}

export function PeriodicTableCard({ row, temperature, radiusExtents, onClose }: PeriodicTableCardProps) {
  const { t } = useTranslation(PERIODIC_TABLE_NS)

  if (row === null) {
    return (
      <aside className="pt-card pt-card--empty" aria-live="polite">
        <span className="pt-card-empty-title">{t('Select an element')}</span>
        <span className="pt-card-empty-hint">{t('Click an element to see details')}</span>
      </aside>
    )
  }

  const name = t(`element.${row.symbol}`, { defaultValue: row.name })
  const categoryKey = categoryKeyOf(row)
  const category = categoryKey ? t(`category.${categoryKey}`, { defaultValue: row.category }) : row.category
  const tone = phaseToneOf(row, temperature)
  const fraction = typeof temperature === 'number' ? ionizationFraction(row, temperature) : null
  const ionizationLabel = formatIonization(fraction, temperature)
  const phase = tone === 'solid' || tone === 'liquid' || tone === 'gas' || tone === 'plasma' ? t(`palette.phase.${tone}`) : t('palette.phase.unknown')
  const missingRadiusLabel = Number(row.number) >= 97 ? t('no bulk crystal') : t('no radius data')

  return (
    <aside className="pt-card" aria-live="polite" aria-label={`${name} ${row.symbol}`}>
      <header className="pt-card-head">
        <div className="pt-card-identity">
          <span className="pt-card-symbol" aria-hidden="true">
            {row.symbol}
          </span>
          <span className="pt-card-titles">
            <span className="pt-card-name">{name}</span>
            <span className="pt-card-category">{category || EMPTY}</span>
          </span>
        </div>
        <span className="pt-card-number">
          {t('fields.Number')} {row.number}
        </span>
        <button type="button" className="pt-card-close" aria-label={t('Close')} onClick={onClose}>
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <dl className="pt-card-grid">
        <div className="pt-card-field">
          <dt>{t('fields.Group')}</dt>
          <dd>{displayNumber(row.group)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Period')}</dt>
          <dd>{displayNumber(row.period)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Phase')}</dt>
          <dd className="pt-card-phase">
            <span className="pt-card-phase-dot" data-tone={tone} aria-hidden="true" />
            {phase}
          </dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Atomic Mass')}</dt>
          <dd>{displayNumber(row.atomic_mass)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Melting Point (K)')}</dt>
          <dd>{displayNumber(row.melt)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Boiling Point (K)')}</dt>
          <dd>{displayNumber(row.boil)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Density (g/cm³)')}</dt>
          <dd>{displayNumber(row.density_g_cm3)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Electronegativity')}</dt>
          <dd>{displayNumber(row.electronegativity_pauling)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.First Ionization Energy (kJ/mol)')}</dt>
          <dd>{displayNumber(row.ionization_energy)}</dd>
        </div>
        <div className="pt-card-field">
          <dt>{t('fields.Ionization (est.)')}</dt>
          <dd>{ionizationLabel}</dd>
        </div>
      </dl>

      <div className="pt-card-radii">
        <RadiusMeter
          label={t('Atomic radius')}
          value={radiusOf(row, 'atomic')}
          min={radiusExtents.atomic.min}
          max={radiusExtents.atomic.max}
          minLabel={t('smallest atomic radius')}
          maxLabel={t('largest atomic radius')}
          missingLabel={missingRadiusLabel}
        />
        <RadiusMeter
          label={t('Covalent radius')}
          value={radiusOf(row, 'covalent')}
          min={radiusExtents.covalent.min}
          max={radiusExtents.covalent.max}
          minLabel={t('smallest covalent radius')}
          maxLabel={t('largest covalent radius')}
          missingLabel={missingRadiusLabel}
        />
      </div>

      <div className="pt-card-foot">
        <span className="pt-card-foot-label">{t('fields.Electron Configuration')}</span>
        <span className="pt-card-mono">{displayText(row.electron_configuration_semantic)}</span>
        <span className="pt-card-foot-sep" aria-hidden="true">
          ·
        </span>
        <span className="pt-card-foot-label">{t('fields.Electron Affinity (kJ/mol)')}</span>
        <span className="pt-card-mono">{displayNumber(row.electron_affinity)}</span>
      </div>
    </aside>
  )
}
