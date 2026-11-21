import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import zhMaterialCards from '../src/locales/material-cards/zh.json'
import enMaterialCards from '../src/locales/material-cards/en.json'
import zhPeriodicTable from '../src/locales/periodic-table/zh.json'
import enPeriodicTable from '../src/locales/periodic-table/en.json'
import valueKeys from '../src/locales/periodic-table/value-keys.json'
import { MATERIALS } from '../src/materials'

const translation = (locale: Record<string, unknown>) => locale.translation as Record<string, unknown>

function flatten(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    child !== null && typeof child === 'object' ? flatten(child as Record<string, unknown>, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

function expectSameKeys(zh: Record<string, unknown>, en: Record<string, unknown>) {
  const zhKeys = flatten(zh)
  const enKeys = flatten(en)
  expect(enKeys).toHaveLength(zhKeys.length)
  expect(enKeys.filter((key) => !zhKeys.includes(key))).toEqual([])
  expect(zhKeys.filter((key) => !enKeys.includes(key))).toEqual([])
}

function csvRows(): Record<string, string>[] {
  const text = readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') cell += char
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  const [header, ...body] = rows as [string[], ...string[][]]
  return body.map((cells) => Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ''])))
}

const zhPt = translation(zhPeriodicTable)
const enPt = translation(enPeriodicTable)
const rows = csvRows()
const categoryKeys = valueKeys.category as Record<string, string>
const appearanceKeys = valueKeys.appearance as Record<string, string>

describe('locale files', () => {
  it('keeps both languages in sync for material-cards', () => {
    expectSameKeys(translation(zhMaterialCards), translation(enMaterialCards))
  })

  it('keeps both languages in sync for periodic-table', () => {
    expectSameKeys(zhPt, enPt)
  })

  it('covers every material name and description', () => {
    const names = translation(zhMaterialCards).name as Record<string, string>
    const descs = translation(zhMaterialCards).desc as Record<string, string>
    for (const material of MATERIALS) {
      expect(names[material.name], material.name).toBeTruthy()
      expect(descs[material.name], material.name).toBeTruthy()
      expect((translation(enMaterialCards).name as Record<string, string>)[material.name], material.name).toBeTruthy()
      expect((translation(enMaterialCards).desc as Record<string, string>)[material.name], material.name).toBeTruthy()
    }
  })

  it('covers every element in the periodic table data', () => {
    const zhElements = zhPt.element as Record<string, string>
    const enElements = enPt.element as Record<string, string>
    for (const row of rows) {
      expect(zhElements[row.symbol!], row.name).toBeTruthy()
      expect(enElements[row.symbol!], row.name).toBeTruthy()
    }
  })

  it('covers every category, appearance and phase value', () => {
    const zhCategory = zhPt.category as Record<string, string>
    const enCategory = enPt.category as Record<string, string>
    const zhAppearance = zhPt.appearance as Record<string, string>
    const enAppearance = enPt.appearance as Record<string, string>
    const zhPhase = zhPt.valTypes as Record<string, string>
    for (const row of rows) {
      if (row.category) {
        const key = categoryKeys[row.category]
        expect(key, row.category).toBeTruthy()
        expect(zhCategory[key!], row.category).toBeTruthy()
        expect(enCategory[key!], row.category).toBeTruthy()
      }
      if (row.appearance) {
        const key = appearanceKeys[row.appearance]
        expect(key, row.appearance).toBeTruthy()
        expect(zhAppearance[key!], row.appearance).toBeTruthy()
        expect(enAppearance[key!], row.appearance).toBeTruthy()
      }
      expect(zhPhase[row.phase], row.phase).toBeTruthy()
    }
  })

  it('keeps category and appearance keys short and fully mapped', () => {
    const categoryLocaleKeys = Object.keys(zhPt.category as Record<string, string>)
    const appearanceLocaleKeys = Object.keys(zhPt.appearance as Record<string, string>)
    expect(categoryLocaleKeys.filter((key) => !Object.values(categoryKeys).includes(key))).toEqual([])
    expect(appearanceLocaleKeys.filter((key) => !Object.values(appearanceKeys).includes(key))).toEqual([])
    expect([...categoryLocaleKeys, ...appearanceLocaleKeys].filter((key) => /[\s,]/.test(key))).toEqual([])
  })

  it('provides plural forms for the atom count label', () => {
    expect(translation(zhMaterialCards).atom_other).toBeTruthy()
    expect(translation(enMaterialCards).atom_one).toBeTruthy()
    expect(translation(enMaterialCards).atom_other).toBeTruthy()
  })

  it('provides the periodic table view labels in both languages', () => {
    for (const key of ['View', 'Data table', 'Periodic table', 'Lanthanides', 'Actinides']) {
      expect(zhPt[key], key).toBeTruthy()
      expect(enPt[key], key).toBeTruthy()
    }
  })
})
