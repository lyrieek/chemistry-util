import type { Material } from './materials'

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'

function normalize(text: string) {
  return Array.from(text.toLowerCase(), (char) => {
    const digit = SUBSCRIPT_DIGITS.indexOf(char)
    return digit === -1 ? char : String(digit)
  }).join('')
}

export function materialMatches(material: Material, query: string, names: string[]): boolean {
  const q = normalize(query.trim())
  if (!q) return true
  if (names.some((name) => normalize(name).includes(q))) return true
  if (normalize(material.formula).includes(q)) return true
  return material.elements.some((element) => element.sym.toLowerCase().includes(q))
}
