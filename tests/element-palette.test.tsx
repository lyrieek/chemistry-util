import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { PeriodicView } from '../src/pages/periodic-table/periodic-view'
import { parseCsv } from '../src/utils/csv-utils'
import {
  BLOCK_PALETTE,
  DEFAULT_PALETTE_ID,
  ELEMENT_PALETTES,
  PHASE_PALETTE,
  blockOf,
  getElementPalette,
  toneOfPhase,
} from '../src/utils/element-palette'
import zhPeriodicTable from '../src/locales/periodic-table/zh.json'
import enPeriodicTable from '../src/locales/periodic-table/en.json'

const rows = parseCsv(readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8'))

async function renderView(options: { paletteId?: 'phase' | 'block'; temperature?: number } = {}): Promise<string> {
  const instance = i18n.createInstance()
  await instance.init({
    lng: 'zh',
    fallbackLng: 'en',
    resources: {
      zh: { 'periodic-table': zhPeriodicTable.translation },
      en: { 'periodic-table': enPeriodicTable.translation },
    },
    interpolation: { escapeValue: false },
  })
  return renderToStaticMarkup(
    <I18nextProvider i18n={instance}>
      <PeriodicView
        rows={rows}
        matchedNumbers={new Set(rows.map((row) => row.number))}
        searchActive={false}
        paletteId={options.paletteId}
        temperature={options.temperature}
      />
    </I18nextProvider>,
  )
}

function blockOfSymbol(symbol: string) {
  const row = rows.find((item) => item.symbol === symbol)
  if (!row) throw new Error(`missing element: ${symbol}`)
  return blockOf(row)
}

function cell(markup: string, number: string): string {
  const match = markup.match(new RegExp(`<button[^>]*data-number="${number}"[^>]*>`))
  if (!match) throw new Error(`missing cell: ${number}`)
  return match[0]
}

describe('element palette', () => {
  it('maps a phase value to a tone', () => {
    expect(toneOfPhase('Solid')).toBe('solid')
    expect(toneOfPhase('Liquid')).toBe('liquid')
    expect(toneOfPhase('Gas')).toBe('gas')
    expect(toneOfPhase('gas')).toBe('gas')
    expect(toneOfPhase('Plasma')).toBe('plasma')
    expect(toneOfPhase('plasma')).toBe('plasma')
    expect(toneOfPhase('')).toBe('unknown')
    expect(toneOfPhase()).toBe('unknown')
  })

  it('classifies elements into s / p / d / f blocks', () => {
    expect(blockOfSymbol('H')).toBe('s')
    expect(blockOfSymbol('He')).toBe('s')
    expect(blockOfSymbol('C')).toBe('p')
    expect(blockOfSymbol('Fe')).toBe('d')
    expect(blockOfSymbol('La')).toBe('f')
    expect(blockOfSymbol('U')).toBe('f')
    expect(blockOfSymbol('Og')).toBe('p')
    expect(blockOfSymbol('Uue')).toBe('s')
    expect(blockOf({})).toBe('unknown')
  })

  it('registers both palettes and uses the block palette by default', () => {
    expect(DEFAULT_PALETTE_ID).toBe('block')
    expect(getElementPalette('block')).toBe(BLOCK_PALETTE)
    expect(getElementPalette('phase')).toBe(PHASE_PALETTE)
    expect(ELEMENT_PALETTES).toContain(PHASE_PALETTE)
    expect(ELEMENT_PALETTES).toContain(BLOCK_PALETTE)
  })

  it('exposes a legend entry for each tone it paints', () => {
    expect(PHASE_PALETTE.legend.map((item) => item.tone)).toEqual(['solid', 'liquid', 'gas', 'plasma', 'unknown'])
    for (const item of PHASE_PALETTE.legend) {
      expect(item.labelKey).toBe(`palette.phase.${item.tone}`)
    }

    expect(BLOCK_PALETTE.legend.map((item) => item.tone)).toEqual(['s', 'p', 'd', 'f'])
    for (const item of BLOCK_PALETTE.legend) {
      expect(item.labelKey).toBe(`palette.block.${item.tone}`)
    }
  })

  it('assigns a phase tone to every element', () => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      const tone = PHASE_PALETTE.toneOf(row)
      expect(['solid', 'liquid', 'gas']).toContain(tone)
      counts.set(tone, (counts.get(tone) ?? 0) + 1)
    }
    expect(counts.get('solid')).toBe(105)
    expect(counts.get('liquid')).toBe(3)
    expect(counts.get('gas')).toBe(11)
  })

  it('assigns a block to every element', () => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      const tone = BLOCK_PALETTE.toneOf(row)
      expect(['s', 'p', 'd', 'f']).toContain(tone)
      counts.set(tone, (counts.get(tone) ?? 0) + 1)
    }
    expect(counts.get('s')).toBe(15)
    expect(counts.get('p')).toBe(36)
    expect(counts.get('d')).toBe(38)
    expect(counts.get('f')).toBe(30)
  })

  it('tags each rendered cell with the block tone', async () => {
    const markup = await renderView()
    expect(markup).toContain('data-palette="block"')
    expect(cell(markup, '1')).toContain('data-tone="s"')
    expect(cell(markup, '6')).toContain('data-tone="p"')
    expect(cell(markup, '26')).toContain('data-tone="d"')
    expect(cell(markup, '57')).toContain('data-tone="f"')
  })

  it('paints plasma cells with an ionization gradient at high temperature', async () => {
    const markup = await renderView({ paletteId: 'phase', temperature: 6500 })
    expect(cell(markup, '55')).toContain('data-tone="plasma"')
    expect(cell(markup, '55')).toContain('--pt-ionization')
    expect(cell(markup, '2')).toContain('data-tone="gas"')
    expect(cell(markup, '105')).toContain('data-tone="unknown"')
  })
})
