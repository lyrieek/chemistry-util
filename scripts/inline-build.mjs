import { existsSync } from 'node:fs'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const htmlPath = path.join(dist, 'index.html')

let html = await readFile(htmlPath, 'utf8')

const readDist = (ref) => {
  const clean = ref.replace(/^\//, '').split('?')[0]
  return readFile(path.join(dist, clean), 'utf8')
}

const inlineScripts = async () => {
  const matches = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)]
  for (const match of matches) {
    const js = (await readDist(match[1])).replaceAll(/<\/script/gi, String.raw`</script`)
    html = html.replace(match[0], () => `<script type="module">\n${js}\n</script>`)
  }
}

const inlineStyles = async () => {
  const matches = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
  for (const match of matches) {
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (!href) continue
    const css = await readDist(href)
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`)
  }
}

const inlineIcons = async () => {
  const matches = [...html.matchAll(/<link\b[^>]*\brel="icon"[^>]*>/g)]
  for (const match of matches) {
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (!href || /^(data:|https?:)/.test(href)) continue
    const icon = await readDist(href)
    const uri = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`
    html = html.replace(match[0], () => match[0].replace(/\bhref="[^"]+"/, () => `href="${uri}"`))
  }
}

await inlineScripts()
await inlineStyles()
await inlineIcons()
await writeFile(htmlPath, html)

if (existsSync(dist)) {
  for (const entry of await readdir(dist)) {
    if (entry !== 'index.html') await rm(path.join(dist, entry), { recursive: true, force: true })
  }
}

const kb = (Buffer.byteLength(html) / 1024).toFixed(1)
// oxlint-disable-next-line no-console
console.log(`single-file build: dist/index.html (${kb} kB)`)
