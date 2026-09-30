import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function POST() { return json({ success: false, message: 'Offline chapter downloads are not supported by Imperio da Britannia.' }, 501) }
