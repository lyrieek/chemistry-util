import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { Sector, SectorLabel, type SectorArc } from '../src/Sector'
import type { ElementProportion } from '../src/composition'

interface RenderOptions {
  element?: ElementProportion
  arc?: SectorArc
  hovered?: number | null
  outerRadius?: number
}

function render(options: RenderOptions = {}) {
  const element: ElementProportion = options.element ?? { sym: 'U', n: 1, pct: 100, color: '#008fff' }
  const arc: SectorArc = options.arc ?? { startAngle: -Math.PI / 2, endAngle: (3 * Math.PI) / 2 }
  const outerRadius = options.outerRadius ?? 99.5
  const hovered = options.hovered ?? null
  return renderToStaticMarkup(
    createElement(
      'g',
      null,
      createElement(Sector, { arc, element, i: 0, outerRadius, setHovered: () => 0, basisLabel: 'mass ratio' }),
      createElement(SectorLabel, { arc, element, i: 0, hovered, outerRadius }),
    ),
  )
}

function hasLabel(markup: string) {
  return markup.includes('<text')
}

describe('Sector', () => {
  it('renders the arc path and an accessible label', () => {
    const markup = render()
    mkdirSync('output', { recursive: true })
    writeFileSync(path.join('output', 'sector.svg'), `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`)

    expect(markup).toMatch(/^<g[\s>]/)
    expect(markup).toMatch(/<path\b[^>]*\bd="[^"]+"/)
    // visx 会给 Arc 追加 visx-arc 类，不能只断言 class="seg"
    expect(markup).toMatch(/<path\b[^>]*\bclass="[^"]*(?:^|\s)seg(?:\s|"|$)[^"]*"/)
    expect(markup).toContain('aria-label="U: 1 atom (100% mass ratio)"')
  })

  it('pluralizes the atom count in the aria-label', () => {
    const markup = render({ element: { sym: 'Na', n: 2, pct: 50, color: '#008fff' } })
    expect(markup).toContain('aria-label="Na: 2 atoms (50% mass ratio)"')
  })

  it('centers a full-circle label and renders it on two lines', () => {
    const markup = render()
    expect(markup).toContain('x="0"')
    expect(markup).toContain('y="0"')
    expect(markup).toContain('>U</tspan>')
    expect(markup).toContain('>100%</tspan>')
    expect(markup).toContain('font-size:18px')
  })

  it('hides slices below 10% unless hovered', () => {
    const small: ElementProportion = { sym: 'Ni', n: 8, pct: 8, color: '#f0c674' }
    expect(hasLabel(render({ element: small }))).toBe(false)
    expect(hasLabel(render({ element: small, hovered: 0 }))).toBe(true)
    expect(hasLabel(render({ element: { sym: 'Ni', n: 8, pct: 10, color: '#f0c674' } }))).toBe(true)
  })

  it('moves labels that do not fit their wedge towards the rim', () => {
    const markup = render({
      element: { sym: 'C', n: 1, pct: 1, color: '#a8d08d' },
      arc: { startAngle: -0.01, endAngle: 0.01 },
      hovered: 0,
    })
    expect(markup).toMatch(/y="-79\.60/)
  })

  it('keeps the label font size within 11px..18px', () => {
    expect(render({ element: { sym: 'C', n: 1, pct: 1, color: '#000' }, hovered: 0 })).toContain('font-size:11px')
    expect(render({ element: { sym: 'H', n: 1, pct: 25, color: '#000' } })).toContain('font-size:13px')
    expect(render({ element: { sym: 'U', n: 1, pct: 100, color: '#000' } })).toContain('font-size:18px')
  })

  it('adds a halo and keeps labels from stealing hover', () => {
    const markup = render()
    expect(markup).toContain('paint-order:stroke')
    expect(markup).toContain('pointer-events:none')
  })

  it('renders the percentage on its own line', () => {
    const markup = render({ element: { sym: 'Ni', n: 8, pct: 8, color: '#000' }, hovered: 0 })
    expect(markup).toContain('dy="13"')
    expect(markup).toContain('font-size="10px"')
  })
})
