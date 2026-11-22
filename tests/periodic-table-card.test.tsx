import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { PeriodicTableCard } from '../src/pages/periodic-table/card'
import { parseCsv } from '../src/utils/csv-utils'
import { radiusExtentsOf } from '../src/utils/element-radii'
import zhPeriodicTable from '../src/locales/periodic-table/zh.json'
import enPeriodicTable from '../src/locales/periodic-table/en.json'

const rows = parseCsv(readFileSync(new URL('../data/PeriodicTable.csv', import.meta.url), 'utf8'))
const bySymbol = new Map(rows.map((row) => [row.symbol, row]))
const radiusExtents = radiusExtentsOf(rows)

function noop() {
  /* 测试环境不触发关闭行为 */
}

interface RenderOptions {
  lng?: 'zh' | 'en'
  temperature?: number
}

async function renderCard(symbol: string | null, options: RenderOptions = {}): Promise<string> {
  const instance = i18n.createInstance()
  await instance.init({
    lng: options.lng ?? 'zh',
    fallbackLng: 'en',
    resources: {
      zh: { 'periodic-table': zhPeriodicTable.translation },
      en: { 'periodic-table': enPeriodicTable.translation },
    },
    interpolation: { escapeValue: false },
  })
  const row = symbol === null ? null : (bySymbol.get(symbol) ?? null)
  return renderToStaticMarkup(
    <I18nextProvider i18n={instance}>
      <PeriodicTableCard row={row} temperature={options.temperature} radiusExtents={radiusExtents} onClose={noop} />
    </I18nextProvider>,
  )
}

describe('PeriodicTableCard', () => {
  it('prompts to select an element when nothing is selected', async () => {
    const markup = await renderCard(null)
    expect(markup).toContain('pt-card--empty')
    expect(markup).toContain('选择元素')
    expect(markup).toContain('点击元素查看详情')
  })

  it('shows the selected element details', async () => {
    const markup = await renderCard('Fe')
    expect(markup).toContain('铁')
    expect(markup).toContain('过渡金属')
    expect(markup).toContain('data-tone="solid"')
    expect(markup).toContain('固态')
    expect(markup).toContain('1811')
    expect(markup).toContain('3134')
    expect(markup).toContain('[Ar] 3d6 4s2')
  })

  it('shows the phase at the given temperature', async () => {
    const markup = await renderCard('Fe', { temperature: 2000 })
    expect(markup).toContain('data-tone="liquid"')
    expect(markup).toContain('液态')
  })

  it('falls back to a dash for missing values', async () => {
    const markup = await renderCard('Db')
    expect(markup).toContain('熔点 (K)')
    expect(markup).toContain('—')
  })

  it('uses English labels', async () => {
    const markup = await renderCard('Fe', { lng: 'en' })
    expect(markup).toContain('Iron')
    expect(markup).toContain('transition metal')
    expect(markup).toContain('Melting Point (K)')
  })

  it('draws one radius donut per radius with the element value', async () => {
    const markup = await renderCard('Fe')
    expect(markup.match(/class="pt-radius"/g) ?? []).toHaveLength(2)
    expect(markup).toContain('原子半径')
    expect(markup).toContain('共价半径')
    expect(markup).toContain('140 pm')
    expect(markup).toContain('116 pm')
    expect(markup).not.toContain('pt-radius-badge')
  })

  it('marks the element with the largest atomic and covalent radius', async () => {
    const markup = await renderCard('Cs')
    expect(markup).toContain('260 pm')
    expect(markup).toContain('232 pm')
    expect(markup.match(/class="pt-radius-badge"/g) ?? []).toHaveLength(2)
    expect(markup).toContain('这是原子半径最大的元素')
    expect(markup).toContain('这是共价半径最大的元素')
  })

  it('marks the element with the smallest atomic and covalent radius', async () => {
    const markup = await renderCard('H')
    expect(markup).toContain('25 pm')
    expect(markup).toContain('32 pm')
    expect(markup.match(/class="pt-radius-badge"/g) ?? []).toHaveLength(2)
    expect(markup).toContain('这是原子半径最小的元素')
    expect(markup).toContain('这是共价半径最小的元素')
  })

  it('explains missing radii for elements beyond curium', async () => {
    const markup = await renderCard('Bk')
    expect(markup.match(/class="pt-radius-badge"/g) ?? []).toHaveLength(2)
    expect(markup).toContain('无宏观样品，暂无实测数据')
  })

  it('uses a neutral label for missing radii of lighter elements', async () => {
    const markup = await renderCard('Fr')
    expect(markup.match(/class="pt-radius-badge"/g) ?? []).toHaveLength(2)
    expect(markup).toContain('暂无数据')
  })
})
