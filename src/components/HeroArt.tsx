const ORBITS = [
  { radius: 86, duration: '30s', reverse: false, dashed: false },
  { radius: 132, duration: '40s', reverse: true, dashed: true },
  { radius: 180, duration: '52s', reverse: false, dashed: false },
  { radius: 228, duration: '64s', reverse: true, dashed: true },
]

const HEX_VERTICES = [
  { x: 0, y: -54 },
  { x: 46.8, y: -27 },
  { x: 46.8, y: 27 },
  { x: 0, y: 54 },
  { x: -46.8, y: 27 },
  { x: -46.8, y: -27 },
]

const LATTICE_DOTS = Array.from({ length: 16 }, (_, index) => ({
  x: (index % 4) * 12,
  y: Math.floor(index / 4) * 12,
}))

const TILES = [
  { x: 74, y: 108, symbol: 'H', number: '1' },
  { x: 438, y: 118, symbol: 'O', number: '8' },
  { x: 82, y: 414, symbol: 'C', number: '6' },
  { x: 420, y: 466, symbol: 'Fe', number: '26' },
]

export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 560 560" role="img" aria-label="原子轨道与苯环示意图">
      <defs>
        <radialGradient id="hero-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="hero-halo-inner" />
          <stop offset="68%" className="hero-halo-mid" />
          <stop offset="100%" className="hero-halo-outer" />
        </radialGradient>
        <radialGradient id="hero-core" cx="34%" cy="28%" r="72%">
          <stop offset="0%" className="hero-core-light" />
          <stop offset="58%" className="hero-core-mid" />
          <stop offset="100%" className="hero-core-dark" />
        </radialGradient>
      </defs>
      <circle cx="280" cy="270" r="244" fill="url(#hero-halo)" />
      <g>
        {ORBITS.map((orbit) => (
          <g
            key={orbit.radius}
            className="hero-art__orbit-group"
            style={{ animationDuration: orbit.duration, animationDirection: orbit.reverse ? 'reverse' : 'normal' }}
          >
            <circle cx="280" cy="270" r={orbit.radius} className={orbit.dashed ? 'hero-art__orbit hero-art__orbit--dash' : 'hero-art__orbit'} />
            <circle cx={280 + orbit.radius} cy="270" r="4.5" className="hero-art__electron" />
            <circle cx={280 - orbit.radius} cy="270" r="3" className="hero-art__electron hero-art__electron--soft" />
          </g>
        ))}
      </g>
      <g>
        <circle cx="280" cy="270" r="30" className="hero-art__core" />
        <circle cx="268" cy="260" r="9" className="hero-art__nucleus-soft" />
        <circle cx="292" cy="262" r="8" className="hero-art__nucleus-light" />
        <circle cx="284" cy="284" r="9" className="hero-art__nucleus-soft" />
        <circle cx="264" cy="282" r="7" className="hero-art__nucleus-light" />
        <circle cx="298" cy="282" r="6" className="hero-art__nucleus-soft" />
        <circle cx="280" cy="250" r="6" className="hero-art__nucleus-light" />
      </g>
      <path d="M318 318C356 344 384 366 412 386" className="hero-art__link" />
      <g transform="translate(420 410)">
        <polygon points="0,-54 46.8,-27 46.8,27 0,54 -46.8,27 -46.8,-27" className="hero-art__ring" />
        <path d="M0 -38 L33 -19 M33 19 L0 38 M-33 -19 L-33 19" className="hero-art__ring-soft" />
        {HEX_VERTICES.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="3.4" className="hero-art__ring-node" />
        ))}
      </g>
      <g transform="translate(98 214)">
        {LATTICE_DOTS.map((dot) => (
          <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r="1.8" className="hero-art__lattice-dot" />
        ))}
      </g>
      {TILES.map((tile, index) => (
        <g key={tile.symbol} transform={`translate(${tile.x} ${tile.y})`}>
          <g className={`hero-art__tile hero-art__tile--${index + 1}`}>
            <rect width="48" height="48" rx="11" className="hero-art__tile-bg" />
            <text x="24" y="29" textAnchor="middle" className="hero-art__tile-label">
              {tile.symbol}
            </text>
            <text x="24" y="41" textAnchor="middle" className="hero-art__tile-sub">
              {tile.number}
            </text>
          </g>
        </g>
      ))}
      <text x="280" y="36" textAnchor="middle" className="hero-art__label">
        ORBITAL / 01
      </text>
    </svg>
  )
}
