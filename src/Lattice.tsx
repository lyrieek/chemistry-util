import { useMemo, useState, type MouseEvent } from 'react'
import { Group } from '@visx/group'
import { Polygon, voronoi } from '@visx/delaunay'
import { formatPercentage, type ElementProportion } from './composition'

const SIZE = 200 // 画布宽高，单位像素
const POINTS_PER_PERCENT = 1.5 // 每个百分比点数对应生成的种子点数量
const MIN_POINTS = 3 // 每种元素最少生成的种子点数量
const MODULUS = 2_147_483_647 // 伪随机数生成器的取模值

interface LatticePoint {
  x: number // 种子点 X 坐标
  y: number // 种子点 Y 坐标
  sym: string // 元素符号
  pct: number // 元素占比（百分比）
  color: string // 元素颜色
}

// 根据种子字符串计算哈希值，作为伪随机数种子
function hashSeed(text: string) {
  let hash = 7
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + (text.codePointAt(i) ?? 0)) % MODULUS
  }
  return hash || 7
}

// 基于种子创建可复现的伪随机数生成器（0~1 之间）
function createRandom(seed: number) {
  let state = seed % MODULUS
  if (state <= 0) state += MODULUS - 1
  return () => {
    state = (state * 16_807) % MODULUS
    return (state - 1) / (MODULUS - 1)
  }
}

// 根据元素列表构建 Voronoi 图的种子点集
function buildPoints(elements: ElementProportion[], seedKey: string) {
  const random = createRandom(hashSeed(seedKey))
  const points: LatticePoint[] = []
  for (const element of elements) {
    const count = Math.max(MIN_POINTS, Math.round(element.pct * POINTS_PER_PERCENT))
    for (let i = 0; i < count; i++) {
      points.push({
        x: random() * SIZE,
        y: random() * SIZE,
        sym: element.sym,
        pct: element.pct,
        color: element.color ?? '#88c2d0',
      })
    }
  }
  return points
}

export function Lattice({ elements, seedKey, basisLabel }: { elements: ElementProportion[]; seedKey: string; basisLabel: string }) {
  // 根据元素和种子生成种子点（复用）
  const points = useMemo(() => buildPoints(elements, seedKey), [elements, seedKey])
  // 基于种子点构建 Voronoi 分区图
  const diagram = useMemo(
    () => voronoi<LatticePoint>({ data: points, x: (point) => point.x, y: (point) => point.y, width: SIZE, height: SIZE }),
    [points],
  )
  const [hovered, setHovered] = useState<number | null>(null) // 当前悬停的种子点索引，null 表示未悬停
  // 当前悬停点的相邻单元格索引集合
  const neighbors = useMemo(() => new Set<number>(hovered === null ? [] : diagram.neighbors(hovered)), [diagram, hovered])
  const activePoint = hovered === null ? null : points[hovered] // 当前悬停的种子点
  // 判断给定索引的单元格是否需要变暗（非悬停且非相邻）
  const isDimmed = (index: number) => hovered !== null && index !== hovered && !neighbors.has(index)

  const handleMove = (event: MouseEvent<SVGGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    // 将鼠标位置映射到画布坐标
    const x = ((event.clientX - rect.left) / rect.width) * SIZE
    const y = ((event.clientY - rect.top) / rect.height) * SIZE
    const next = diagram.delaunay.find(x, y, 0)
    if (next !== hovered) setHovered(next)
  }

  // 生成用于无障碍标签的元素占比摘要
  const summary = elements.map((element) => `${element.sym} ${formatPercentage(element.pct)}% ${basisLabel}`).join(', ')
  const clipId = `lattice-${seedKey.replaceAll(/[^a-z0-9]/gi, '')}`

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="lattice-chart" role="img" aria-label={summary}>
      <defs>
        <clipPath id={clipId}>
          <rect width={SIZE} height={SIZE} rx={15} />
        </clipPath>
      </defs>
      <Group clipPath={`url(#${clipId})`} onMouseMove={handleMove} onMouseLeave={() => setHovered(null)}>
        {points.map((point, index) => {
          const polygon = diagram.cellPolygon(index)
          return polygon ? (
            <Polygon
              key={`cell-${index}`}
              className="lattice-cell"
              polygon={polygon}
              fill={point.color}
              fillOpacity={isDimmed(index) ? 0.22 : 1}
              stroke="white"
              strokeOpacity={0.9}
              strokeWidth={0.8}
              style={{ transition: 'fill-opacity 0.15s ease' }}
            />
          ) : null
        })}
        {points.map((point, index) => (
          <circle
            key={`site-${index}`}
            cx={point.x}
            cy={point.y}
            r={hovered === index ? 2.4 : 1.5}
            fill="#fff"
            fillOpacity={isDimmed(index) ? 0.25 : 0.85}
            style={{ transition: 'fill-opacity 0.15s ease' }}
          />
        ))}
      </Group>
      {activePoint ? (
        <text x={10} y={17} className="lattice-readout">
          {`${activePoint.sym} · ${formatPercentage(activePoint.pct)}%`}
        </text>
      ) : null}
    </svg>
  )
}
