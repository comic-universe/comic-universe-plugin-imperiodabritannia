import { getChapters } from '../../lib/imperio'
import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST(request: Request) {
  try { const body = await request.json(); const id = typeof body?.siteId === 'string' ? body.siteId.trim() : ''; return json(id ? await getChapters(id) : []) }
  catch (error) { console.error('getChapters failed', error); return json([]) }
}
