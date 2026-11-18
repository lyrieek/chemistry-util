import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import csvText from '../../data/PeriodicTable.csv?raw'
import { LanguageButton } from '../components/language-button'
import { PERIODIC_TABLE_NS } from '../i18n'
import { parseCsv } from '../utils/csv-utils'

type Column = { key: string; label: string; numeric?: boolean; translateValue?: boolean }

const COLUMNS: readonly Column[] = [
  { key: 'number', label: 'Number', numeric: true },
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'atomic_mass', label: 'Atomic Mass', numeric: true },
  { key: 'category', label: 'Category' },
  { key: 'group', label: 'Group', numeric: true },
  { key: 'period', label: 'Period', numeric: true },
  { key: 'phase', label: 'Phase', translateValue: true },
  { key: 'appearance', label: 'Appearance' },
  { key: 'density_g_cm3', label: 'Density (g/cm³)', numeric: true },
  { key: 'melt', label: 'Melting Point (K)', numeric: true },
  { key: 'boil', label: 'Boiling Point (K)', numeric: true },
  { key: 'electronegativity_pauling', label: 'Electronegativity', numeric: true },
  { key: 'electron_affinity', label: 'Electron Affinity (kJ/mol)', numeric: true },
  { key: 'electron_configuration_semantic', label: 'Electron Configuration' },
  { key: 'atomic_radii.empirical', label: 'Atomic Radius (pm)', numeric: true },
  { key: 'atomic_radii.covalent_single', label: 'Covalent Radius (pm)', numeric: true },
] satisfies readonly Column[]

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

function formatNumber(value: string): string {
  if (value.trim() === '') return value
  const num = Number(value)
  if (!Number.isFinite(num)) return value
  if (Number.isInteger(num)) return String(num)
  const abs = Math.abs(num)
  if (abs >= 1000) return num.toFixed(1)
  if (abs >= 0.001) return num.toFixed(3)
  return num.toExponential(2)
}

function formatValue(column: Column, value: string): string {
  if (!column.numeric || value === '') return value
  return value.replaceAll('[', '').replaceAll(']', '').replaceAll(NUMBER_PATTERN, formatNumber)
}

function sortNumber(value: string): number {
  const match = value.match(NUMBER_PATTERN)
  return match === null || match.length === 0 ? Number.NaN : Number(match[0])
}

function Page() {
  const { t } = useTranslation(PERIODIC_TABLE_NS)
  const rows = useMemo(() => parseCsv(csvText), [])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>({
    key: 'number',
    dir: 'asc',
  })

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return rows.filter((row) => row.name.toLowerCase().includes(q) || row.symbol.toLowerCase().includes(q) || row.number.toLowerCase().includes(q))
  }, [rows, query])

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

  const cellText = (column: Column, value: string): string =>
    column.translateValue && value !== '' ? t(`valTypes.${value}`, { defaultValue: value }) : formatValue(column, value)

  return (
    <div className="pt-page">
      <h1>{t('Periodic Table')}</h1>
      <div className="pt-toolbar">
        <input className="pt-search" placeholder={t('Search elements')} value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
        <span className="pt-count">{t('Elements count', { n: sorted.length, total: rows.length })}</span>
        <LanguageButton className="pt-lang-button" label={t('Switch language')} />
      </div>
      <div className="pt-table-wrap">
        <table className="pt-table">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  onClick={() =>
                    setSort((prev) =>
                      prev && prev.key === column.key
                        ? { key: column.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                        : { key: column.key, dir: 'asc' },
                    )
                  }
                  className={sort?.key === column.key ? `pt-sort-${sort.dir}` : ''}
                >
                  {t(`fields.${column.label}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.number}>
                {COLUMNS.map((column) => (
                  <td key={column.key} className={column.numeric ? 'pt-numeric' : ''}>
                    {cellText(column, row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<Page />)
