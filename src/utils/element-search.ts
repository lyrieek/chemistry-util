export function elementMatches(row: Record<string, string>, query: string, extraNames: readonly string[] = []): boolean {
  const q = query.trim().toLowerCase()
  if (q === '') return true
  return [row.name, row.symbol, row.number, ...extraNames].some((value) => value.toLowerCase().includes(q))
}
