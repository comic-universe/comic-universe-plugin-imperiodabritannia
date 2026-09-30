import { getPages } from '../../lib/imperio'
import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST(request: Request) {
  try { const body = await request.json(); const url = typeof body?.chapterSiteId === 'string' ? body.chapterSiteId.trim() : typeof body?.siteId === 'string' ? body.siteId.trim() : ''; return json(url ? await getPages(url) : []) }
  catch (error) { console.error('getPages failed', error); return json([]) }
}
