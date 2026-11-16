import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const LOCALE_DIR = join(import.meta.dirname, '..', 'src', 'locales')

const LIMITS = {
  name: { zh: 18, en: 25 },
  desc: { en: 40, zh: 23 },
}

const reported = new Set()

function loadLocale(lang) {
  return JSON.parse(readFileSync(join(LOCALE_DIR, `${lang}.json`), 'utf8'))
}

function collectViolations() {
  const errors = []
  try {
    const zh = loadLocale('zh')
    const en = loadLocale('en')

    const zhName = zh.translation?.name ?? {}
    const enName = en.translation?.name ?? {}
    const zhDesc = zh.translation?.desc ?? {}
    const enDesc = en.translation?.desc ?? {}

    for (const [key, value] of Object.entries(zhName)) {
      if (typeof value === 'string' && value.length > LIMITS.name.zh) {
        errors.push(`zh.translation.name.${key} (中文): ${value.length} > ${LIMITS.name.zh} — ${JSON.stringify(value)}`)
      }
    }
    for (const [key, value] of Object.entries(enName)) {
      if (typeof value === 'string' && value.length > LIMITS.name.en) {
        errors.push(`en.translation.name.${key} (英文): ${value.length} > ${LIMITS.name.en} — ${JSON.stringify(value)}`)
      }
    }
    for (const [key, value] of Object.entries(enDesc)) {
      if (typeof value === 'string' && value.length > LIMITS.desc.en) {
        errors.push(`en.translation.desc.${key} (英文): ${value.length} > ${LIMITS.desc.en} — ${JSON.stringify(value)}`)
      }
    }
    for (const [key, value] of Object.entries(zhDesc)) {
      if (typeof value === 'string' && value.length > LIMITS.desc.zh) {
        errors.push(`zh.translation.desc.${key} (中文): ${value.length} > ${LIMITS.desc.zh} — ${JSON.stringify(value)}`)
      }
    }
  } catch (err) {
    errors.push(`Failed to read locale files: ${err.message}`)
  }
  return errors
}

function getProgramNode(context) {
  try {
    return context.sourceCode?.ast
  } catch {
    /* fall through */
  }
  try {
    return context.getSourceCode?.().ast
  } catch {
    /* fall through */
  }
  return { type: 'Program', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } } }
}

export default {
  meta: { name: 'material-i18n' },
  rules: {
    'length-check': {
      meta: {
        type: 'problem',
        docs: { description: 'Enforce i18n material name/desc length limits' },
        schema: [],
        defaultOptions: [],
      },
      create(context) {
        return {
          'Program:exit'() {
            const violations = collectViolations()
            const node = getProgramNode(context)

            for (const msg of violations) {
              if (reported.has(msg)) continue
              reported.add(msg)
              context.report({ node, message: msg })
            }
          },
        }
      },
    },
  },
}
