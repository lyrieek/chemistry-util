import { useTranslation } from 'react-i18next'
import { PERIODIC_TABLE_NS } from '../../i18n-ns'
import valueKeys from '../../locales/periodic-table/value-keys.json'
import type { CsvRow } from '../../utils/csv-utils'
import { formatNumericValue } from '../../utils/number-format'

type ValueNs = 'element' | 'category' | 'appearance' | 'valTypes'

export interface Column {
  key: string
  label: string
  numeric?: boolean
  valueNs?: ValueNs
  valueKeys?: Record<string, string>
}

const CATEGORY_KEYS: Record<string, string> = valueKeys.category
const APPEARANCE_KEYS: Record<string, string> = valueKeys.appearance

export const COLUMNS: readonly Column[] = [
  { key: 'number', label: 'Number', numeric: true },
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name', valueNs: 'element' },
  { key: 'phase', label: 'Phase', valueNs: 'valTypes' },
  { key: 'atomic_mass', label: 'Atomic Mass', numeric: true },
  { key: 'category', label: 'Category', valueNs: 'category', valueKeys: CATEGORY_KEYS },
  { key: 'group', label: 'Group', numeric: true },
  { key: 'period', label: 'Period', numeric: true },
  { key: 'appearance', label: 'Appearance', valueNs: 'appearance', valueKeys: APPEARANCE_KEYS },
  { key: 'density_g_cm3', label: 'Density (g/cm³)', numeric: true },
  { key: 'melt', label: 'Melting Point (K)', numeric: true },
  { key: 'boil', label: 'Boiling Point (K)', numeric: true },
  { key: 'electronegativity_pauling', label: 'Electronegativity', numeric: true },
  { key: 'electron_affinity', label: 'Electron Affinity (kJ/mol)', numeric: true },
  { key: 'electron_configuration_semantic', label: 'Electron Configuration' },
  { key: 'atomic_radii.empirical', label: 'Atomic Radius (pm)', numeric: true },
  { key: 'atomic_radii.covalent_single', label: 'Covalent Radius (pm)', numeric: true },
] satisfies readonly Column[]

export const DEFAULT_HIDDEN: readonly string[] = ['appearance', 'electronegativity_pauling', 'electron_configuration_semantic', 'density_g_cm3']

export type SortState = { key: string; dir: 'asc' | 'desc' } | null

export interface TableViewProps {
  columns: readonly Column[]
  rows: readonly CsvRow[]
  sort: SortState
  onSort: (key: string) => void
}

export function TableView({ columns, rows, sort, onSort }: TableViewProps) {
  const { t } = useTranslation(PERIODIC_TABLE_NS)

  const cellText = (column: Column, row: CsvRow): string => {
    const value = row[column.key] ?? ''
    if (value === '') return value
    if (column.valueNs === 'element') return t(`element.${row.symbol}`, { defaultValue: row.name })
    if (column.valueKeys) {
      const key = column.valueKeys[value]
      return key ? t(`${column.valueNs}.${key}`, { defaultValue: value }) : value
    }
    if (column.valueNs) return t(`${column.valueNs}.${value}`, { defaultValue: value })
    return column.numeric ? formatNumericValue(value) : value
  }

  return (
    <div className="pt-table-wrap">
      <table className="pt-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} onClick={() => onSort(column.key)} className={sort?.key === column.key ? `pt-sort-${sort.dir}` : ''}>
                {t(`fields.${column.label}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number}>
              {columns.map((column) => (
                <td key={column.key} className={column.numeric ? 'pt-numeric' : ''}>
                  {cellText(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
