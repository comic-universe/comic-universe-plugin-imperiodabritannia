import { getDetails } from '../../lib/imperio'
import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST(request: Request) {
  try { const body = await request.json(); const id = typeof body?.siteId === 'string' ? body.siteId.trim() : ''; if (!id) return json({}, 400); const data = await getDetails(id); return data ? json({ ...data, type: 'comic' }) : json({}, 404) }
  catch (error) { console.error('getDetails failed', error); return json({}, 500) }
}
