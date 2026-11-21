import valueKeys from '../locales/periodic-table/value-keys.json'
import type { CsvRow } from './csv-utils'

/** CSV 里的 category 值到 i18n key 的映射，周期表视图与详情卡片共用。 */
export const CATEGORY_KEYS: Record<string, string> = valueKeys.category

export function categoryKeyOf(row: CsvRow): string | undefined {
  return CATEGORY_KEYS[row.category]
}
