import { build } from 'vite'
import { existsSync } from 'node:fs'
import { readFile, readdir, rm, rmdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const pages = [
  { name: 'index', input: 'index.html' },
  { name: 'periodic-table', input: 'src/pages/periodic-table.html' },
]

const dist = path.resolve('dist')

const buildPages = async () => {
  await rm(dist, { recursive: true, force: true })
  for (const page of pages) {
    const outDir = path.join(dist, page.name)
    await build({
      configFile: path.resolve('vite.config.ts'),
      build: {
        outDir,
        rollupOptions: {
          input: page.input,
          output: { codeSplitting: false },
        },
      },
    })
    const assets = path.join(outDir, 'assets')
    const chunks = existsSync(assets) ? (await readdir(assets)).filter((file) => file.endsWith('.js')) : []
    if (chunks.length > 1) {
      throw new Error(`${page.input}: expected a single JS chunk, got ${chunks.length} (${chunks.join(', ')})`)
    }
  }
}

const readDist = async (file, ref) => {
  const clean = ref.replace(/^\//, '').split('?')[0]
  const candidates = []
  for (let dir = path.dirname(file); ; dir = path.dirname(dir)) {
    candidates.push(path.join(dir, clean))
    if (dir === dist) break
    const parent = path.dirname(dir)
    if (parent === dir) break
  }
  let lastError
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, 'utf8')
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

const inlineScripts = async (file, html) => {
  const matches = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)]
  for (const match of matches) {
    const js = (await readDist(file, match[1])).replace(/<\/script/gi, '<\\/script')
    html = html.replace(match[0], () => `<script type="module">\n${js}\n</script>`)
  }
  return html
}

const inlineStyles = async (file, html) => {
  const matches = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
  for (const match of matches) {
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (!href) continue
    const css = await readDist(file, href)
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`)
  }
  return html
}

const inlineIcons = async (file, html) => {
  const matches = [...html.matchAll(/<link\b[^>]*\brel="icon"[^>]*>/g)]
  for (const match of matches) {
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (!href || /^(data:|https?:)/.test(href)) continue
    const icon = await readDist(file, href)
    const uri = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`
    html = html.replace(match[0], () => match[0].replace(/\bhref="[^"]+"/, () => `href="${uri}"`))
  }
  return html
}

const removeModulepreload = (html) => html.replace(/<link\b[^>]*\brel="modulepreload"[^>]*>\s*/g, '')

const collectHtml = async (dir, out = []) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await collectHtml(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

const processHtml = async (file) => {
  let html = await readFile(file, 'utf8')
  html = await inlineScripts(file, html)
  html = removeModulepreload(html)
  html = await inlineStyles(file, html)
  html = await inlineIcons(file, html)
  await writeFile(file, html)
}

const prune = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await prune(full)
      try {
        await rmdir(full)
      } catch {
        /* directory not empty or not removable */
      }
    } else if (!entry.name.endsWith('.html')) {
      await rm(full, { force: true })
    }
  }
}

const inlinePages = async () => {
  const htmlFiles = await collectHtml(dist)
  await Promise.all(htmlFiles.map(processHtml))

  for (const file of htmlFiles) {
    const target = path.join(dist, path.basename(file))
    if (file !== target) await rename(file, target)
  }

  await prune(dist)

  for (const file of htmlFiles) {
    const html = await readFile(path.join(dist, path.basename(file)), 'utf8')
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1)
    // oxlint-disable-next-line no-console
    console.log(`single-file build: dist/${path.basename(file)} (${kb} kB)`)
  }
}

await buildPages()
await inlinePages()
