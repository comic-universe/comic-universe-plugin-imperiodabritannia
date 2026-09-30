import { searchManga } from '../../lib/imperio'
import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST(request: Request) {
  try { const body = await request.json(); const query = typeof body?.search === 'string' ? body.search.trim() : ''; return json(query ? await searchManga(query) : []) }
  catch (error) { console.error('search failed', error); return json([]) }
}
