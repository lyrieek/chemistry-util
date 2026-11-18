export type CsvRow = Record<string, string>

type FieldSlice = { value: string; end: number }

function readQuotedField(line: string, start: number): FieldSlice {
  let i = start + 1
  let field = ''
  while (i < line.length) {
    const ch = line[i]
    if (ch === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        field += '"'
        i += 2
        continue
      }
      return { value: field, end: i + 1 }
    }
    field += ch
    i++
  }
  return { value: field, end: i }
}

function parseLine(line: string): string[] {
  const fields: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      const { value, end } = readQuotedField(line, i)
      fields.push(value)
      i = end
      if (i < line.length && line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      fields.push(end === -1 ? line.slice(i) : line.slice(i, end))
      i = end === -1 ? line.length : end + 1
    }
  }
  return fields
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) return []
  const header = parseLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const row: CsvRow = {}
    header.forEach((key, i) => {
      row[key] = values[i] ?? ''
    })
    return row
  })
}
