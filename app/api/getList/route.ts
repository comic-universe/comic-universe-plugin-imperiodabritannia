import { listManga } from '../../lib/imperio'
import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST(request: Request) {
  try { const body = await request.json().catch(() => ({})); return json(await listManga(Number(body?.page) || 1)) }
  catch (error) { console.error('getList failed', error); return json([]) }
}
