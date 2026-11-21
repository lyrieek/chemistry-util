const NUMBER_PATTERN = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

export function formatNumber(value: string): string {
  if (value.trim() === '') return value
  const num = Number(value)
  if (!Number.isFinite(num)) return value
  if (Number.isInteger(num)) return String(num)
  const abs = Math.abs(num)
  if (abs >= 1000) return num.toFixed(1)
  if (abs >= 0.001) return num.toFixed(3)
  return num.toExponential(2)
}

export function formatNumericValue(value: string): string {
  return value.replaceAll('[', '').replaceAll(']', '').replaceAll(NUMBER_PATTERN, formatNumber)
}

export function sortNumber(value: string): number {
  const match = value.match(NUMBER_PATTERN)
  return match === null || match.length === 0 ? Number.NaN : Number(match[0])
}
