import { useEffect, useRef, useState } from 'react'
import type { ElementProportion } from './composition'

const DEFAULT_DURATION_MS = 520
const REDUCED_MOTION_DURATION_MS = 160
const SETTLED_EPSILON = 0.0005

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3
}

function prefersReducedMotion() {
  return typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function resolveDuration(duration: number, reducedMotion: boolean) {
  if (duration <= 0) return 0
  return reducedMotion ? Math.min(duration, REDUCED_MOTION_DURATION_MS) : duration
}

export function mixPercentages(from: ElementProportion[], to: ElementProportion[], progress: number) {
  const clamped = Math.min(1, Math.max(0, progress))
  const eased = easeOutCubic(clamped)
  return to.map((element, index) => ({
    sym: element.sym,
    n: element.n,
    color: element.color,
    pct: from[index].pct + (element.pct - from[index].pct) * eased,
  }))
}

export function useAnimatedPercentages(elements: ElementProportion[], duration = DEFAULT_DURATION_MS) {
  const [displayed, setDisplayed] = useState(elements)
  const displayedRef = useRef(elements)
  const frameRef = useRef<number | null>(null)
  const signature = elements.map((element) => `${element.sym}:${element.pct}`).join('|')

  useEffect(() => {
    const from = displayedRef.current
    const sameShape = from.length === elements.length && from.every((element, index) => element.sym === elements[index].sym)
    const settled = sameShape && from.every((element, index) => Math.abs(element.pct - elements[index].pct) < SETTLED_EPSILON)
    const activeDuration = resolveDuration(duration, prefersReducedMotion())

    if (!sameShape || settled || activeDuration <= 0) {
      displayedRef.current = elements
      setDisplayed(elements)
      return
    }

    let startTime: number | null = null
    const tick = (now: number) => {
      startTime ??= now
      const progress = Math.min(1, (now - startTime) / activeDuration)
      const next = mixPercentages(from, elements, progress)
      displayedRef.current = next
      setDisplayed(next)
      frameRef.current = progress < 1 ? requestAnimationFrame(tick) : null
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [signature, duration])

  return displayed
}
