import { Arc } from '@visx/shape'
import { formatPercentage, type ElementProportion } from './composition'

export interface SectorArc {
  startAngle: number
  endAngle: number
}

export interface SectorProps {
  arc: SectorArc
  element: ElementProportion
  i: number
  outerRadius: number
  setHovered: (v: number | null) => void
  basisLabel: string
}

export interface SectorLabelProps {
  arc: SectorArc
  element: ElementProportion
  i: number
  hovered: number | null
  outerRadius: number
}

export const LABEL_MIN_PCT = 10
const COUNT_FONT_SIZE = 10
const MAX_SYMBOL_FONT_SIZE = 18

export function sectorLabelText(element: ElementProportion) {
  return `${formatPercentage(element.pct)}%`
}

export function sectorSymbolFontSize(pct: number) {
  return Math.max(11, Math.min(MAX_SYMBOL_FONT_SIZE, 26 * Math.sqrt(pct / 100)))
}

export function layoutSectorLabel(arc: SectorArc, element: ElementProportion, outerRadius: number) {
  const half = Math.abs(arc.endAngle - arc.startAngle) / 2
  const mid = (arc.startAngle + arc.endAngle) / 2
  const fontSize = sectorSymbolFontSize(element.pct)
  if (element.pct >= 99.5) return { x: 0, y: 0, fontSize }
  const text = sectorLabelText(element)
  const width = Math.max(element.sym.length * fontSize * 0.65, text.length * COUNT_FONT_SIZE * 0.55) + 3
  const radius = outerRadius * (element.pct >= 50 ? 0.45 : 0.62)
  const available = half >= Math.PI / 2 ? radius * 2 : 2 * radius * Math.sin(half)
  const r = width <= available ? radius : outerRadius * 0.8
  return {
    x: Math.sin(mid) * r,
    y: -Math.cos(mid) * r,
    fontSize,
  }
}

export function Sector({ arc, element, i, outerRadius, setHovered, basisLabel }: SectorProps) {
  const label = `${element.sym}: ${element.n} atom${element.n > 1 ? 's' : ''} (${formatPercentage(element.pct)}% ${basisLabel})`
  return (
    <g>
      <title>{label}</title>
      <Arc
        className="seg"
        startAngle={arc.startAngle}
        endAngle={arc.endAngle}
        innerRadius={0}
        outerRadius={outerRadius}
        fill={element.color}
        stroke="white"
        strokeWidth={0.5}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
        aria-label={label}
      />
    </g>
  )
}

export function SectorLabel({ arc, element, i, hovered, outerRadius }: SectorLabelProps) {
  if (element.pct < LABEL_MIN_PCT && hovered !== i) return null
  const { x, y, fontSize } = layoutSectorLabel(arc, element, outerRadius)
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fill: '#111',
        fontSize: `${fontSize}px`,
        paintOrder: 'stroke',
        stroke: '#fff',
        strokeWidth: 3,
        strokeLinejoin: 'round',
        pointerEvents: 'none',
      }}
    >
      <tspan fontWeight="700">{element.sym}</tspan>
      <tspan x={x} dy={fontSize + 2} fontSize={`${COUNT_FONT_SIZE}px`}>
        {sectorLabelText(element)}
      </tspan>
    </text>
  )
}
