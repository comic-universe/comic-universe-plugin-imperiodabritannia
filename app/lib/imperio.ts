const SITE_URL = 'https://imperiodabritannia.net'
const API_URL = 'https://api.imperiodabritannia.net'
const CDN_URL = 'https://cdn.imperiodabritannia.net'

// These headers are part of the site's public web client configuration.
const API_TOKEN = 'bunker_api_token_secreto_2025'

interface ImperioChapter {
  id: number | string
  numero: string | number
  nome?: string | null
  total_paginas?: number | null
  paywall?: boolean
}

interface ImperioManga {
  id: number | string
  slug?: string | null
  nome?: string
  descricao?: string | null
  imagem?: string | null
  status_nome?: string | null
  total_capitulos?: number | null
  formato_nome?: string | null
  capitulos?: ImperioChapter[]
}

interface ImperioApiResponse {
  sucesso?: boolean
  mensagem?: string
  obras?: ImperioManga[]
  obra?: ImperioManga
  capitulo?: {
    id: number | string
    numero: string | number
    nome?: string | null
    paginas?: Array<{ cdn_id?: string; numero?: number }>
  }
}

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

const apiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`

async function apiGet(path: string): Promise<ImperioApiResponse> {
  const response = await fetch(apiUrl(path), {
    headers: {
      Accept: 'application/json',
      'X-Noencryptionbritta': '1',
      'X-API-Token': API_TOKEN,
      'X-Brit-Cache': 'true'
    },
    next: { revalidate: 300 }
  })

  if (!response.ok) throw new Error(`Imperio da Britannia API returned ${response.status}`)
  const payload = (await response.json()) as ImperioApiResponse
  if (payload.sucesso === false) throw new Error(payload.mensagem || 'Imperio da Britannia API request failed')
  return payload
}

function coverUrl(image: string | null | undefined): string {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  if (/^(obras|usuarios|shop)\//i.test(image)) return `${CDN_URL}/${image}`
  return `${CDN_URL}/proxy/${image}`
}

function toSummary(manga: ImperioManga): MangaSummary {
  return {
    siteId: String(manga.id),
    name: manga.nome?.trim() || manga.slug || String(manga.id),
    synopsis: manga.descricao || '',
    status: manga.status_nome || 'Unknown',
    cover: coverUrl(manga.imagem),
    chapterCount: typeof manga.total_capitulos === 'number' ? manga.total_capitulos : null,
    contentType: 'comic'
  }
}

export async function listManga(page = 1): Promise<MangaSummary[]> {
  const params = new URLSearchParams({ pagina: String(Math.max(1, Math.floor(page))), limite: '24' })
  const payload = await apiGet(`/api/obras?${params}`)
  return (payload.obras || []).map(toSummary)
}

export async function searchManga(query: string): Promise<MangaSummary[]> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return []
  const params = new URLSearchParams({ pagina: '1', limite: '24', busca: normalizedQuery })
  const payload = await apiGet(`/api/obras?${params}`)
  return (payload.obras || []).map(toSummary)
}

async function getManga(siteId: string): Promise<ImperioManga | null> {
  const identifier = siteId.trim()
  if (!identifier) return null
  const isNumericId = /^\d+$/.test(identifier)
  const path = isNumericId
    ? `/api/obras/${encodeURIComponent(identifier)}`
    : `/api/obras/by-slug/${encodeURIComponent(identifier.replace(/^.*\/manga\//, '').replace(/\/$/, ''))}`
  const payload = await apiGet(path)
  return payload.obra || null
}

export async function getDetails(siteId: string): Promise<MangaSummary | null> {
  const manga = await getManga(siteId)
  if (!manga) return null
  const summary = toSummary(manga)
  if (Array.isArray(manga.capitulos)) summary.chapterCount = manga.capitulos.length
  return summary
}

export async function getChapters(siteId: string): Promise<ChapterSummary[]> {
  const manga = await getManga(siteId)
  if (!manga || !Array.isArray(manga.capitulos)) return []
  return manga.capitulos
    .filter((chapter) => chapter && chapter.id != null && chapter.numero != null)
    .map((chapter) => {
      const number = String(chapter.numero)
      return {
        siteId: `${manga.id}:${number}`,
        name: chapter.nome?.trim() || `Capítulo ${number}`,
        number,
        language: 'pt-BR',
        languageCodes: ['pt-br'],
        siteLink: `${SITE_URL}/manga/${manga.slug || manga.id}/capitulo/${chapter.id}`,
        external: false,
        readable: true,
        offline: false,
        pages: []
      }
    })
    .sort((left, right) => Number(left.number) - Number(right.number))
}

export async function getPages(chapterSiteId: string) {
  const match = chapterSiteId.trim().match(/^(\d+):(.+)$/)
  if (!match) return []
  const [, mangaId, chapterNumber] = match
  const payload = await apiGet(`/api/obras/${encodeURIComponent(mangaId)}/capitulos/${encodeURIComponent(chapterNumber)}`)
  const pages = payload.capitulo?.paginas || []
  return pages
    .filter((page) => typeof page.cdn_id === 'string' && page.cdn_id.length > 0)
    .map((page, index) => {
      const path = coverUrl(page.cdn_id)
      const extension = path.split('?')[0].split('.').pop() || 'jpg'
      return { filename: `${String(page.numero || index + 1).padStart(3, '0')}.${extension}`, path }
    })
}
