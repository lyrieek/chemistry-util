const MATERIAL_SEGMENTS = [
  { pct: 55, offset: 0, strokeClass: 'tool-art__seg tool-art__seg--a', fillClass: 'tool-art__swatch tool-art__swatch--a' },
  { pct: 30, offset: -55, strokeClass: 'tool-art__seg tool-art__seg--b', fillClass: 'tool-art__swatch tool-art__swatch--b' },
  { pct: 15, offset: -85, strokeClass: 'tool-art__seg tool-art__seg--c', fillClass: 'tool-art__swatch tool-art__swatch--c' },
]

const PT_COLUMNS = 18
const PT_ROWS = 7

function blockOf(row: number, col: number) {
  if (row === 6) return 'f'
  if (col < 2) return 's'
  if (col > 11) return 'p'
  return 'd'
}

function MaterialCardsArt() {
  return (
    <svg viewBox="0 0 320 180" className="tool-art" role="img" aria-label="材料组成环形图">
      <g transform="translate(160 88) rotate(-90)">
        {MATERIAL_SEGMENTS.map((segment) => (
          <circle
            key={segment.offset}
            r="46"
            fill="none"
            strokeWidth="20"
            pathLength={100}
            strokeDasharray={`${segment.pct} ${100 - segment.pct}`}
            strokeDashoffset={segment.offset}
            className={segment.strokeClass}
          />
        ))}
      </g>
      <text x="160" y="84" textAnchor="middle" className="tool-art__center">
        H·O
      </text>
      <text x="160" y="102" textAnchor="middle" className="tool-art__sub">
        MASS RATIO
      </text>
      <g transform="translate(52 150)">
        <rect width="9" height="9" rx="2" className={MATERIAL_SEGMENTS[0]?.fillClass} />
        <text x="15" y="8" className="tool-art__legend-text">
          H
        </text>
        <rect x="46" width="9" height="9" rx="2" className={MATERIAL_SEGMENTS[1]?.fillClass} />
        <text x="61" y="8" className="tool-art__legend-text">
          O
        </text>
      </g>
    </svg>
  )
}

function PeriodicTableArt() {
  const cells: { row: number; col: number; block: string }[] = []
  for (let row = 0; row < PT_ROWS; row += 1) {
    for (let col = 0; col < PT_COLUMNS; col += 1) {
      if (row === 6 && col > 2 && col < 14) continue
      cells.push({ row, col, block: blockOf(row, col) })
    }
  }

  return (
    <svg viewBox="0 0 320 180" className="tool-art" role="img" aria-label="元素周期表缩略图">
      {cells.map((cell) => (
        <rect
          key={`${cell.row}-${cell.col}`}
          x={16 + cell.col * 16}
          y={24 + cell.row * 16}
          width="13"
          height="13"
          rx="2.5"
          className={`tool-art__cell tool-art__cell--${cell.block}`}
        />
      ))}
      <rect x={16 + 7 * 16 - 2} y={24 + 3 * 16 - 2} width="17" height="17" rx="4" className="tool-art__cell-ring" />
      <text x="160" y="166" textAnchor="middle" className="tool-art__sub">
        118 ELEMENTS · 17 GROUPS
      </text>
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export interface ToolCardProps {
  href: string
  tag: string
  title: string
  desc: string
  points: readonly string[]
  art: 'materials' | 'periodic'
  cta: string
}

export function ToolCard({ href, tag, title, desc, points, art, cta }: ToolCardProps) {
  return (
    <a className="tool-card" href={href}>
      <div className="tool-card__art">{art === 'materials' ? <MaterialCardsArt /> : <PeriodicTableArt />}</div>
      <div className="tool-card__body">
        <span className="tool-card__tag">{tag}</span>
        <h3 className="tool-card__title">{title}</h3>
        <p className="tool-card__desc">{desc}</p>
        <ul className="tool-card__points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <span className="tool-card__cta">
          {cta}
          <ArrowIcon />
        </span>
      </div>
    </a>
  )
}
