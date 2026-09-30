const SITE = 'https://imperiodabritannia.net'

export interface MangaSummary {
  siteId: string
  name: string
  synopsis: string
  status: string
  cover: string
  chapterCount: number | null
  contentType: 'comic'
}

export interface ChapterSummary {
  siteId: string
  name: string
  number: string
  language: string
  languageCodes: string[]
  siteLink: string
  external: boolean
  readable: boolean
  offline: boolean
  pages: Array<Record<string, unknown>>
}

const decode = (value: string) => value
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
  .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))

const strip = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
const absolute = (url: string) => { try { return new URL(decode(url), SITE).toString() } catch { return '' } }
const attr = (tag: string, key: string) => tag.match(new RegExp(`\\b${key}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1] || ''

async function getHtml(url: string) {
  const response = await fetch(url, { headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'Mozilla/5.0 (compatible; ComicUniverse/1.0)' }, next: { revalidate: 300 } })
  if (!response.ok) throw new Error(`Imperio da Britannia returned ${response.status}`)
  return response.text()
}

function parseCards(html: string): MangaSummary[] {
  const out = new Map<string, MangaSummary>()
  const anchors = html.match(/<a\b[^>]*href=["'][^"']*\/manga\/[^"']+["'][^>]*>[\s\S]*?<\/a>/gi) || []
  for (const anchor of anchors) {
    const href = absolute(attr(anchor.slice(0, anchor.indexOf('>') + 1), 'href'))
    const slug = href.match(/\/manga\/([^/?#]+)\/?$/)?.[1]
    if (!slug || out.has(slug)) continue
    const title = strip(anchor)
    const imageTag = anchor.match(/<img\b[^>]*>/i)?.[0] || ''
    const cover = absolute(attr(imageTag, 'src') || attr(imageTag, 'data-src') || attr(imageTag, 'data-lazy-src'))
    if (!title && !cover) continue
    out.set(slug, { siteId: slug, name: title || slug.replace(/-/g, ' '), synopsis: '', status: 'Unknown', cover, chapterCount: null, contentType: 'comic' })
  }
  return [...out.values()]
}

export async function listManga(page = 1): Promise<MangaSummary[]> {
  const html = await getHtml(`${SITE}/obras/${page > 1 ? `?pagina=${page}` : ''}`)
  return parseCards(html)
}

export async function searchManga(query: string): Promise<MangaSummary[]> {
  const url = new URL('/obras/', SITE)
  url.searchParams.set('busca', query)
  const html = await getHtml(url.toString())
  const matches = parseCards(html)
  if (matches.length) return matches
  return parseCards(await getHtml(`${SITE}/?s=${encodeURIComponent(query)}`))
}

export async function getDetails(siteId: string): Promise<MangaSummary | null> {
  const slug = siteId.replace(/^.*\/manga\//, '').replace(/\/$/, '')
  if (!/^[\p{L}\p{N}-]+$/u.test(slug)) return null
  const html = await getHtml(`${SITE}/manga/${encodeURIComponent(slug)}/`)
  const title = strip(html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.[0] || html.match(/<title\b[^>]*>[\s\S]*?<\/title>/i)?.[0] || '')
  const description = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || ''
  const ogImage = html.match(/<meta\b[^>]*property=["']og:image["'][^>]*>/i)?.[0] || ''
  const desc = attr(description, 'content')
  const cover = attr(ogImage, 'content')
  const chapters = [...html.matchAll(/href=["']([^"']*\/capitulo-[^"']*)["']/gi)]
  const count = new Set(chapters.map((m) => absolute(m[1]))).size
  if (!title && !cover) return null
  return { siteId: slug, name: title.replace(/\s*\|\s*Imperio.*$/i, ''), synopsis: decode(desc), status: 'Unknown', cover: absolute(cover), chapterCount: count || null, contentType: 'comic' }
}

export async function getChapters(siteId: string): Promise<ChapterSummary[]> {
  const slug = siteId.replace(/^.*\/manga\//, '').replace(/\/$/, '')
  if (!/^[\p{L}\p{N}-]+$/u.test(slug)) return []
  const html = await getHtml(`${SITE}/manga/${encodeURIComponent(slug)}/`)
  const seen = new Set<string>()
  const chapters: ChapterSummary[] = []
  const links = html.match(/<a\b[^>]*href=["'][^"']*\/capitulo-[^"']+["'][^>]*>[\s\S]*?<\/a>/gi) || []
  for (const link of links) {
    const tag = link.slice(0, link.indexOf('>') + 1)
    const href = absolute(attr(tag, 'href'))
    if (!href || seen.has(href)) continue
    seen.add(href)
    const label = strip(link)
    const chapterMatch = href.match(/capitulo-([^/?#]+)/i)
    const number = (label.match(/(?:cap(?:ítulo|itulo)?\.?\s*)?([\d]+(?:[.,][\d]+)?)/i)?.[1] || chapterMatch?.[1] || '').replace(',', '.')
    if (!number) continue
    chapters.push({ siteId: href, name: label || `Capítulo ${number}`, number, language: 'pt-BR', languageCodes: ['pt-br'], siteLink: href, external: false, readable: true, offline: false, pages: [] })
  }
  return chapters.sort((a, b) => Number(a.number) - Number(b.number))
}

export async function getPages(chapterSiteId: string) {
  const url = absolute(chapterSiteId)
  if (!url || !new URL(url).hostname.endsWith('imperiodabritannia.net')) return []
  const html = await getHtml(url)
  const pageImages = new Map<string, string>()
  const images = html.match(/<img\b[^>]*>/gi) || []
  for (const image of images) {
    const src = absolute(attr(image, 'data-src') || attr(image, 'data-lazy-src') || attr(image, 'src'))
    if (!src || !/\.(jpe?g|png|webp)(?:\?|$)/i.test(src)) continue
    if (/logo|avatar|icon|banner/i.test(src)) continue
    pageImages.set(src, src)
  }
  return [...pageImages.keys()].map((src, index) => ({ filename: `${String(index + 1).padStart(3, '0')}.${src.split('.').pop()?.split('?')[0] || 'jpg'}`, path: src }))
}
