import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { PeriodicView } from '../src/pages/periodic-view'
import { parseCsv } from '../src/utils/csv-utils'
import type { PaletteId } from '../src/utils/element-palette'
import zhPeriodicTable from '../src/locales/periodic-table/zh.json'
import enPeriodicTable from '../src/locales/periodic-table/en.json'

const rows = parseCsv(readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8'))

interface RenderOptions {
  matchedNumbers?: ReadonlySet<string>
  searchActive?: boolean
  paletteId?: PaletteId
  temperature?: number
}

async function render(lng: 'zh' | 'en', options: RenderOptions = {}): Promise<string> {
  const instance = i18n.createInstance()
  await instance.init({
    lng,
    fallbackLng: 'en',
    resources: {
      zh: { 'periodic-table': zhPeriodicTable.translation },
      en: { 'periodic-table': enPeriodicTable.translation },
    },
    interpolation: { escapeValue: false },
  })
  const matchedNumbers = options.matchedNumbers ?? new Set(rows.map((row) => row.number))
  return renderToStaticMarkup(
    <I18nextProvider i18n={instance}>
      <PeriodicView
        rows={rows}
        matchedNumbers={matchedNumbers}
        searchActive={options.searchActive ?? false}
        paletteId={options.paletteId}
        temperature={options.temperature}
      />
    </I18nextProvider>,
  )
}

function cell(markup: string, number: string): string {
  const match = markup.match(new RegExp(`<button[^>]*data-number="${number}"[^>]*>`))
  if (!match) throw new Error(`missing cell: ${number}`)
  return match[0]
}

describe('PeriodicView', () => {
  it('renders the 118 discovered elements, two series placeholders and both series rows', async () => {
    const markup = await render('zh')
    expect(markup.match(/class="pt-cell(?:\s|")/g) ?? []).toHaveLength(118)
    expect(markup).not.toContain('data-number="119"')
    expect(markup.match(/class="pt-placeholder(?:\s|")/g) ?? []).toHaveLength(2)
    expect(markup.match(/data-series="lanthanide"/g) ?? []).toHaveLength(15)
    expect(markup.match(/data-series="actinide"/g) ?? []).toHaveLength(15)
    expect(markup).toContain('aria-label="镧系元素"')
    expect(markup).toContain('aria-label="锕系元素"')
  })

  it('skips the undiscovered element 119 and builds localized accessible labels', async () => {
    const markup = await render('zh')
    expect(markup).not.toContain('data-number="119"')
    expect(cell(markup, '1')).toContain('aria-label="氢 H')
    expect(cell(markup, '1')).toContain('双原子非金属')
  })

  it('switches accessible labels to English', async () => {
    const markup = await render('en')
    expect(cell(markup, '1')).toContain('aria-label="Hydrogen H')
    expect(cell(markup, '1')).toContain('diatomic nonmetal')
    expect(markup).toContain('aria-label="Lanthanides"')
  })

  it('highlights matches and dims the rest without changing the layout', async () => {
    const markup = await render('zh', { matchedNumbers: new Set(['1']), searchActive: true })
    expect(cell(markup, '1')).toContain('is-match')
    expect(cell(markup, '2')).toContain('is-dimmed')
    expect(markup.match(/class="pt-cell(?:\s|")/g) ?? []).toHaveLength(118)
  })

  it('recolors the phase palette from the temperature', async () => {
    const cold = await render('zh', { paletteId: 'phase', temperature: 100 })
    const hot = await render('zh', { paletteId: 'phase', temperature: 5000 })
    expect(cell(cold, '26')).toContain('data-tone="solid"')
    expect(cell(cold, '26')).toContain('固态')
    expect(cell(hot, '26')).toContain('data-tone="gas"')
    expect(cell(hot, '26')).toContain('气态')
  })

  it('uses the data phase when no temperature is given', async () => {
    const markup = await render('zh', { paletteId: 'phase' })
    expect(cell(markup, '35')).toContain('data-tone="liquid"')
    expect(cell(markup, '35')).toContain('液态')
  })

  it('renders the detail card placeholder inside the grid', async () => {
    const markup = await render('zh')
    expect(markup).toContain('class="pt-card pt-card--empty"')
    expect(markup).toContain('点击元素查看详情')
  })
})
